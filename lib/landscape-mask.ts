/**
 * Building-mask generation and caching for the mask-based garden redesign
 * pipeline (see lib/replicate.ts for the model calls this wraps).
 *
 * Why this exists: flux-kontext-pro (the previous single-model approach)
 * relied entirely on prompt text to ask the model not to touch the
 * building, which put "preserve the building exactly" and "redesign the
 * garden significantly" in tension inside one unmasked global edit — the
 * building could still drift in position/scale, and pushing harder for
 * garden variety made that drift (and Flux's safety-classifier false
 * positive rate) worse. Masking the building out of regeneration entirely
 * removes that tension: the building region is copied pixel-for-pixel from
 * the source photo, not regenerated, so it cannot move, and the garden
 * prompt can be short and unhedged.
 */

import crypto from "node:crypto";
import sharp from "sharp";
import { uploadBufferToR2, getR2PublicUrl } from "@/utils/r2/client";
import { runGroundedSamMask } from "./replicate";

/**
 * How much to feather (blur) the mask edge, in pixels. Without this, the
 * seam between the pixel-copied building and the regenerated garden can
 * show as a hard line. Small enough not to eat into fine building detail
 * (window mullions, roof edges), large enough to soften the seam.
 */
const MASK_FEATHER_PX = 3;

function hashImageUrl(imageUrl: string): string {
  return crypto.createHash("sha256").update(imageUrl).digest("hex").slice(0, 32);
}

/**
 * Deterministic (not random) R2 key, derived from the source image URL, so
 * repeated calls for the same uploaded photo resolve to the same cached
 * mask instead of generating a new random key each time.
 */
function maskObjectKey(imageUrl: string): string {
  return `landscape/masks/${hashImageUrl(imageUrl)}.png`;
}

async function isAlreadyCached(publicUrl: string): Promise<boolean> {
  try {
    const res = await fetch(publicUrl, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Returns a mask ready to pass straight to flux-fill-pro as `mask`: white =
 * garden area that can be redesigned, black = building area that must stay
 * pixel-identical to the source photo.
 *
 * Cached in R2 keyed by a hash of the source image URL — a given uploaded
 * photo only pays for one grounded_sam call no matter how many
 * styles/variants/intensities get generated from it afterward. Call this
 * once per photo (in the API route, before looping over variants), not once
 * per variant.
 */
export async function getOrCreateGardenMask(imageUrl: string): Promise<string> {
  const key = maskObjectKey(imageUrl);
  const publicUrl = getR2PublicUrl(key);

  if (await isAlreadyCached(publicUrl)) {
    return publicUrl;
  }

  // 1. Detect the building (white = building).
  const buildingMaskUrl = await runGroundedSamMask(imageUrl);
  const buildingMaskRes = await fetch(buildingMaskUrl);
  if (!buildingMaskRes.ok) {
    throw new Error(`Failed to download building mask (${buildingMaskRes.status})`);
  }
  const buildingMaskBuffer = Buffer.from(await buildingMaskRes.arrayBuffer());

  // 2. Invert (white = garden/editable, black = building/locked) and
  //    feather the edge so the seam isn't a hard line.
  const gardenMaskBuffer = await sharp(buildingMaskBuffer)
    .negate({ alpha: false })
    .blur(MASK_FEATHER_PX)
    .png()
    .toBuffer();

  // 3. Cache to R2 so future generations from this photo skip grounded_sam.
  await uploadBufferToR2(key, gardenMaskBuffer, "image/png");

  return publicUrl;
}