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

// black-forest-labs/flux-fill-pro - mask-based inpainting.
// Used instead of flux-kontext-pro so the building can be locked out of
// regeneration entirely via a mask (pixel-copied from the source photo)
// rather than relying on prompt text to ask the model not to touch it.
const FLUX_FILL_PRO_MODEL = "black-forest-labs/flux-fill-pro";

// schananas/grounded_sam - Grounding DINO + Segment Anything, used once per
// uploaded photo to detect the building and produce a mask. Community
// model, not an official Replicate one — see resolveLatestModelVersion().
const GROUNDED_SAM_MODEL = "schananas/grounded_sam";

export type LandscapeModelTier = "standard" | "premium";

interface RunFluxFillInput {
  imageUrl: string;
  /** White = garden area to redesign, black = building area to keep untouched. */
  maskUrl: string;
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
      const response = await fetch(url, init);

      // Accounts without a payment method on file get a hard burst limit
      // from Replicate (429), separate from any network-level failure.
      // Worth a short, bounded retry here too — the account may simply be
      // between requests, and Replicate tells us exactly how long to wait.
      if (response.status === 429 && attempt < REPLICATE_FETCH_ATTEMPTS) {
        const retryAfterSeconds = Number(response.headers.get("retry-after")) || 5;
        console.warn(
          `${label} rate limited (429); retrying in ${retryAfterSeconds}s (${attempt}/${REPLICATE_FETCH_ATTEMPTS})`
        );
        await sleep(retryAfterSeconds * 1000);
        continue;
      }

      return response;
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
 * Maps our internal credit tier to the model used for garden regeneration.
 * Standard uses Flux Fill Pro. Premium can be swapped to a stronger
 * inpainting model once you've validated quality/cost tradeoffs.
 */
export function getModelForTier(tier: LandscapeModelTier): string {
  if (tier === "premium") {
    // TODO: confirm the exact Replicate model identifier and input schema
    // for the premium model before enabling this in production billing.
    return FLUX_FILL_PRO_MODEL;
  }
  return FLUX_FILL_PRO_MODEL;
}

/**
 * grounded_sam is community-maintained and doesn't have a "default version"
 * published, so Replicate's shorthand /models/{owner}/{name}/predictions
 * endpoint 404s for it. This resolves its current version id so we can call
 * the legacy /predictions endpoint instead. Cached per model per process so
 * repeated calls don't re-fetch it every time.
 */
const modelVersionCache = new Map<string, string>();

async function resolveLatestModelVersion(model: string, token: string): Promise<string> {
  const cached = modelVersionCache.get(model);
  if (cached) return cached;

  const res = await fetchWithNetworkRetry(
    `${REPLICATE_API_BASE}/models/${model}`,
    { headers: { Authorization: `Bearer ${token}` } },
    `${model} resolve version`
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to resolve latest version for ${model} (${res.status}): ${body}`);
  }
  const data = await res.json();
  const versionId = data?.latest_version?.id;
  if (!versionId) {
    throw new Error(`No latest_version found for ${model}: ${JSON.stringify(data)}`);
  }
  modelVersionCache.set(model, versionId);
  return versionId;
}

/**
 * Creates a prediction and polls it to completion (success, failure, or
 * timeout), returning the final prediction object without throwing on a
 * failed/timed-out result — callers decide whether that's retryable.
 *
 * Tries Replicate's shorthand /models/{model}/predictions endpoint first;
 * falls back to the legacy /predictions + version-id endpoint on a 404,
 * which older community models (like grounded_sam) require.
 */
async function createAndPollPrediction(
  model: string,
  input: Record<string, unknown>,
  token: string,
  label: string
): Promise<ReplicatePrediction> {
  let createResponse = await fetchWithNetworkRetry(
    `${REPLICATE_API_BASE}/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input }),
    },
    `${label} create prediction`
  );

  if (createResponse.status === 404) {
    const versionId = await resolveLatestModelVersion(model, token);
    createResponse = await fetchWithNetworkRetry(
      `${REPLICATE_API_BASE}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ version: versionId, input }),
      },
      `${label} create prediction (versioned)`
    );
  }

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    throw new Error(`${label} request failed (${createResponse.status}): ${errorBody}`);
  }

  let prediction: ReplicatePrediction = await createResponse.json();

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
      `${label} poll prediction`
    );

    if (!pollResponse.ok) {
      const errorBody = await pollResponse.text();
      throw new Error(`${label} polling failed (${pollResponse.status}): ${errorBody}`);
    }

    prediction = await pollResponse.json();
    attempts += 1;
  }

  return prediction;
}

/**
 * Detects the building in a photo and returns a raw binary mask URL
 * (white = detected building, black = everything else). Called once per
 * uploaded photo — see lib/landscape-mask.ts, which caches the result so
 * repeated generations from the same photo don't re-run this.
 *
 * Deliberately does NOT pass a negative_mask_prompt. Testing showed this
 * model's positive/negative mask combination step has a bug: a broad
 * negative prompt like "plant, tree, grass, sky, path, ground" matches
 * almost the entire photo, and combining it erodes most of the positive
 * (building) mask down to a sliver along the roofline. The positive-only
 * detection is already clean without it.
 */
export async function runGroundedSamMask(imageUrl: string): Promise<string> {
  const token = getReplicateToken();

  const prediction = await createAndPollPrediction(
    GROUNDED_SAM_MODEL,
    {
      image: imageUrl,
      mask_prompt: "building, house, roof, wall, window",
      negative_mask_prompt: "",
      adjustment_factor: 5, // dilate slightly so the building edge has a safety margin
    },
    token,
    "grounded_sam"
  );

  if (prediction.status !== "succeeded" || !Array.isArray(prediction.output)) {
    throw new Error(
      `grounded_sam did not succeed (prediction ${prediction.id}): ${prediction.error ?? prediction.status}`
    );
  }

  // Output order is fixed: [annotated_picture_mask, neg_annotated_picture_mask, mask, inverted_mask]
  const maskUrl = prediction.output[2] ?? prediction.output[prediction.output.length - 1];
  if (!maskUrl) {
    throw new Error(`grounded_sam succeeded but returned no usable mask (prediction ${prediction.id})`);
  }
  return maskUrl;
}

/**
 * Flux Kontext's own error text when its safety classifier flags either the
 * input photo or (more often, per Replicate's logs) the generated output.
 * This check is evaluated per-generation and is at least partly
 * probabilistic — the same input photo and prompt with a different seed
 * frequently produces a result that is NOT flagged. See the note on
 * SENSITIVE_CONTENT_MAX_RETRIES below for why we retry instead of just
 * surfacing this straight to the user.
 */
const SENSITIVE_CONTENT_ERROR_PATTERN = /flagged as sensitive/i;

function isSensitiveContentError(prediction: ReplicatePrediction): boolean {
  return (
    prediction.status === "failed" &&
    SENSITIVE_CONTENT_ERROR_PATTERN.test(prediction.error ?? "")
  );
}

/**
 * Regenerates only the garden layer of a photo, keeping the building
 * (defined by maskUrl's black region) pixel-identical to the source photo.
 * Replicate generations typically take 5-20 seconds, within a standard
 * Vercel serverless function timeout, so we poll synchronously.
 *
 * If Flux's safety classifier flags a generation (error E005 — "input or
 * output was flagged as sensitive"), we retry a couple of times with a
 * different seed before giving up — this check is at least partly
 * probabilistic, and a different seed often produces a result that isn't
 * flagged even though the photo, mask, and prompt are unchanged.
 */
const SENSITIVE_CONTENT_MAX_RETRIES = 2;
// Accounts without a payment method on file are throttled by Replicate to
// a burst of 1 request at a time; retrying immediately after a failure can
// itself get rejected with a 429. A short pause avoids that self-inflicted
// failure on top of the sensitive-content retry. Once a payment method is
// added this delay is harmless (just a little extra latency).
const RETRY_DELAY_MS = 4000;

export async function generateLandscapeDesign(
  { imageUrl, maskUrl, prompt, seed }: RunFluxFillInput,
  tier: LandscapeModelTier = "standard"
): Promise<string> {
  const token = getReplicateToken();
  const model = getModelForTier(tier);
  let lastPrediction: ReplicatePrediction | null = null;

  for (let attempt = 0; attempt <= SENSITIVE_CONTENT_MAX_RETRIES; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    // The first attempt uses the caller's deterministic seed (kept stable
    // per user/style/variant so repeat requests are reproducible). Retries
    // after a sensitive-content flag intentionally use a different seed —
    // reusing the same seed would very likely reproduce the same flagged
    // output and fail again.
    const attemptSeed =
      attempt === 0 || seed === undefined ? seed : seed + attempt * 104729;

    const prediction = await createAndPollPrediction(
      model,
      {
        image: imageUrl,
        mask: maskUrl,
        prompt,
        output_format: "png",
        // flux-fill-pro caps this at 2 whenever an input image is supplied,
        // same platform limit as flux-kontext-pro — no point requesting higher.
        safety_tolerance: 2,
        ...(attemptSeed !== undefined ? { seed: attemptSeed } : {}),
      },
      token,
      "flux-fill-pro"
    );

    if (prediction.status === "succeeded" && prediction.output) {
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;
      if (outputUrl) return outputUrl;
    }

    lastPrediction = prediction;

    const shouldRetry =
      isSensitiveContentError(prediction) && attempt < SENSITIVE_CONTENT_MAX_RETRIES;

    if (!shouldRetry) break;

    console.warn(
      `Replicate flagged generation ${prediction.id} as sensitive; retrying with a new seed (attempt ${attempt + 2}/${SENSITIVE_CONTENT_MAX_RETRIES + 1})`
    );
  }

  if (!lastPrediction) {
    throw new Error("Replicate generation failed with no prediction result.");
  }

  if (lastPrediction.status === "failed" || lastPrediction.status === "canceled") {
    throw new Error(
      `Replicate generation ${lastPrediction.status} (prediction ${lastPrediction.id}): ${lastPrediction.error ?? "unknown error"}`
    );
  }

  throw new Error("Replicate generation timed out before completing.");
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