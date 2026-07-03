import { buildLandscapeDesignResult, type LandscapeDesignResult } from "./landscape-generation";

const DEMO_ORIGINAL_IMAGE_URL = "/examples/clean-garden-before.jpg";
const DEMO_STYLE_ID = "modern";

const demoResultUrls = [
  "/examples/clean-garden-option-1.jpg",
  "/examples/clean-garden-option-2.jpg",
  "/examples/clean-garden-option-3.jpg",
  "/examples/clean-garden-option-4.jpg",
];

export const LANDSCAPE_DEMO_DESIGNS: LandscapeDesignResult[] = demoResultUrls.map(
  (resultImageUrl, variantIndex) =>
    buildLandscapeDesignResult({
      resultImageUrl,
      originalImageUrl: DEMO_ORIGINAL_IMAGE_URL,
      styleId: DEMO_STYLE_ID,
      variantIndex,
      designId: `demo-clean-garden-${variantIndex + 1}`,
    })
);

export const LANDSCAPE_DEMO_RESULT = {
  resultImageUrl: LANDSCAPE_DEMO_DESIGNS[0].resultImageUrl,
  originalImageUrl: DEMO_ORIGINAL_IMAGE_URL,
  styleId: DEMO_STYLE_ID,
  designs: LANDSCAPE_DEMO_DESIGNS,
};
