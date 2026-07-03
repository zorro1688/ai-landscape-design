import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 is S3-compatible, so we use the AWS S3 SDK pointed at R2's endpoint.
 *
 * Required env vars:
 * R2_ACCOUNT_ID=your-cloudflare-account-id
 * R2_ACCESS_KEY_ID=your-r2-access-key-id
 * R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
 * R2_BUCKET_NAME=your-bucket-name
 * R2_PUBLIC_URL=https://your-public-bucket-domain.com  (custom domain or r2.dev public URL)
 */

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = getEnv("R2_ACCOUNT_ID");

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return cachedClient;
}

export function getR2BucketName(): string {
  return getEnv("R2_BUCKET_NAME");
}

export function getR2PublicUrl(key: string): string {
  const publicBase = getEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  return `${publicBase}/${key}`;
}

/**
 * Generates a presigned PUT URL so the client can upload a file
 * directly to R2 without the file passing through our server.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    publicUrl: getR2PublicUrl(key),
  };
}

/**
 * Uploads a buffer directly from the server (used to persist the
 * AI-generated result image fetched from Replicate's temporary URL).
 */
export async function uploadBufferToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  return getR2PublicUrl(key);
}

/**
 * Generates a unique object key, namespaced by user (or "anonymous")
 * and date, to keep the bucket organized.
 */
export function buildObjectKey(
  namespace: "uploads" | "results",
  userId: string | null,
  extension: string
): string {
  const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ownerSegment = userId ?? "anonymous";
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `landscape/${namespace}/${datePrefix}/${ownerSegment}/${uniqueId}.${extension}`;
}
