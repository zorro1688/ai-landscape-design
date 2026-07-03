/**
 * Thin wrapper around the Replicate HTTP API.
 *
 * We call the REST API directly with fetch instead of the official
 * `replicate` npm package, so there is one fewer dependency to manage
 * and the request/response shape is fully visible here.
 *
 * Required env var:
 * REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const REPLICATE_FETCH_ATTEMPTS = 3;
const DEFAULT_REPLICATE_RETRY_DELAY_MS = 750;

// black-forest-labs/flux-kontext-pro - text-guided image editing.
// Good default for "redesign this real photo" tasks because it preserves
// the original composition unless explicitly told to change it.
// Swap this version id if Black Forest Labs / Replicate publish a newer one.
const FLUX_KONTEXT_PRO_VERSION =
  "black-forest-labs/flux-kontext-pro";

export type LandscapeModelTier = "standard" | "premium";

interface RunFluxKontextInput {
  imageUrl: string;
  prompt: string;
  seed?: number;
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
}

function getReplicateToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("Missing required environment variable: REPLICATE_API_TOKEN");
  }
  return token;
}

function getRetryDelayMs(): number {
  const configured = Number(process.env.REPLICATE_RETRY_DELAY_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_REPLICATE_RETRY_DELAY_MS;
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const cause = (error as Error & { cause?: { code?: string } }).cause;
  const code = cause?.code;

  return (
    error.message === "fetch failed" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_SOCKET" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EAI_AGAIN"
  );
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithNetworkRetry(
  url: string,
  init?: RequestInit,
  label = "Replicate request"
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= REPLICATE_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (!isRetryableNetworkError(error) || attempt === REPLICATE_FETCH_ATTEMPTS) {
        break;
      }

      console.warn(`${label} network error; retrying (${attempt}/${REPLICATE_FETCH_ATTEMPTS})`, error);
      await sleep(getRetryDelayMs() * attempt);
    }
  }

  throw lastError;
}

/**
 * Maps our internal credit tier to the model used for generation.
 * Standard uses Flux Kontext Pro. Premium can be swapped to a stronger
 * model (e.g. Nano Banana Pro) once you've validated quality/cost tradeoffs.
 */
export function getModelForTier(tier: LandscapeModelTier): string {
  if (tier === "premium") {
    // TODO: confirm the exact Replicate model identifier and input schema
    // for the premium model before enabling this in production billing.
    return FLUX_KONTEXT_PRO_VERSION;
  }
  return FLUX_KONTEXT_PRO_VERSION;
}

/**
 * Starts a prediction and polls until it finishes.
 * Replicate generations for Flux Kontext Pro typically take 5-20 seconds,
 * which is within a standard Vercel serverless function timeout, so we
 * poll synchronously rather than using webhooks for the first version.
 */
export async function generateLandscapeDesign(
  { imageUrl, prompt, seed }: RunFluxKontextInput,
  tier: LandscapeModelTier = "standard"
): Promise<string> {
  const token = getReplicateToken();
  const model = getModelForTier(tier);

  const createResponse = await fetchWithNetworkRetry(
    `${REPLICATE_API_BASE}/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait", // ask Replicate to hold the connection until done, when supported
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: imageUrl,
          aspect_ratio: "match_input_image",
          ...(seed !== undefined ? { seed } : {}),
        },
      }),
    },
    "Replicate create prediction"
  );

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    throw new Error(`Replicate request failed (${createResponse.status}): ${errorBody}`);
  }

  let prediction: ReplicatePrediction = await createResponse.json();

  // If "Prefer: wait" isn't honored (e.g. it times out before completion),
  // fall back to polling the prediction by id.
  const maxAttempts = 30;
  const pollIntervalMs = 2000;
  let attempts = 0;

  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < maxAttempts
  ) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const pollResponse = await fetchWithNetworkRetry(
      `${REPLICATE_API_BASE}/predictions/${prediction.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
      "Replicate poll prediction"
    );

    if (!pollResponse.ok) {
      const errorBody = await pollResponse.text();
      throw new Error(`Replicate polling failed (${pollResponse.status}): ${errorBody}`);
    }

    prediction = await pollResponse.json();
    attempts += 1;
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    throw new Error(`Replicate generation ${prediction.status}: ${prediction.error ?? "unknown error"}`);
  }

  if (prediction.status !== "succeeded" || !prediction.output) {
    throw new Error("Replicate generation timed out before completing.");
  }

  // flux-kontext-pro returns a single image URL (string), but we defensively
  // handle the array case in case the model output shape changes.
  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

  if (!outputUrl) {
    throw new Error("Replicate generation succeeded but returned no output URL.");
  }

  return outputUrl;
}

/**
 * Downloads the generated image from Replicate's temporary delivery URL
 * so it can be persisted to our own R2 bucket. Replicate output URLs are
 * not guaranteed to stay available long-term.
 */
export async function downloadImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetchWithNetworkRetry(url, undefined, "Replicate output download");
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`);
  }
  const contentType = response.headers.get("content-type") ?? "image/png";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}
