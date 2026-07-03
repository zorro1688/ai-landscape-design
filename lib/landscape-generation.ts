import type { LandscapeModelTier } from "./replicate";
import { getLandscapeDesignBrief, type LandscapeDesignBrief } from "./landscape-styles";

export type LandscapePlanType = "1" | "3";

export interface LandscapeGenerationPlanInput {
  isAuthenticated: boolean;
  planType: LandscapePlanType;
}

export interface LandscapeGenerationPlan {
  variantCount: number;
  creditCost: number;
  tier: LandscapeModelTier;
}

export interface LandscapeDesignResult {
  resultImageUrl: string;
  originalImageUrl: string;
  styleId: string;
  variantIndex: number;
  designBrief: LandscapeDesignBrief;
  designId?: string | null;
}

export function getLandscapeGenerationPlan({
  isAuthenticated,
  planType,
}: LandscapeGenerationPlanInput): LandscapeGenerationPlan {
  const perImageCreditCost = parseInt(planType, 10);
  const variantCount = isAuthenticated ? 4 : 1;

  return {
    variantCount,
    creditCost: perImageCreditCost * variantCount,
    tier: planType === "3" ? "premium" : "standard",
  };
}

const VARIANT_INSTRUCTIONS = [
  "OPTION 1 COMPLETE DESIGN BRIEF - Expanded Border Planting Concept: create a visibly different garden layout built around expanded side borders and foreground planting beds. Make the border beds larger, reshape their outlines, reduce plain lawn areas, add new plant varieties and style-specific plants, stronger shrub layers, richer groundcover masses, and clearer bed edge geometry. Keep the building, sky, camera angle, exposure, and daylight unchanged. Do not darken the image. This option must read as a planting-led redesign and must not resemble the other options.",
  "OPTION 2 COMPLETE DESIGN BRIEF - Central Focal Garden Concept: create a visibly different garden layout built around a central oval, circular bed, island planting feature, or small non-building water feature when appropriate. Emphasize a central composition, brighter seasonal flower color blocks, varied bloom heights, fuller border planting, style-specific focal plants, and a clearly organized center-of-yard feature. Keep the building, sky, camera angle, exposure, and daylight unchanged. Do not darken the image. This option must read as a central-focus redesign and must not resemble the other options.",
  "OPTION 3 COMPLETE DESIGN BRIEF - Rebuilt Path And Surface Concept: create a visibly different garden layout built around a new circulation pattern such as a looping path, diagonal route, offset curve, or stepping-stone route. Replace the original path material with a visibly different style-appropriate surface such as gravel, brick, decomposed granite, natural stone, clay pavers, pale pea gravel, or raked gravel depending on the selected style. Reshape circulation, widen or narrow paths where useful, and create stronger bed-to-path contrast. Keep the building, sky, camera angle, exposure, and daylight unchanged. Do not darken the image. This option must read as a path-led redesign and must not resemble the other options.",
  "OPTION 4 COMPLETE DESIGN BRIEF - Landscape Feature Nook Concept: create a visibly different garden layout built around a seating nook or feature-focused garden moment using non-building landscape elements. Add or replace elements such as a bench or stone seat, natural stone grouping, decorative planters, terracotta pots when style-appropriate, daytime garden markers, small garden ornaments, groundcover masses, and water features when requested. Keep these as landscape-only objects, not buildings or roofed structures. Keep the building, sky, camera angle, exposure, and daylight unchanged. Do not darken the image. This option must read as a feature-led redesign and must not resemble the other options.",
];

export function getLandscapeVariantInstruction(variantIndex: number): string {
  return VARIANT_INSTRUCTIONS[variantIndex % VARIANT_INSTRUCTIONS.length];
}
export function getLandscapeVariantSeed(
  userKey: string,
  styleId: string,
  variantIndex: number,
  customDescription = "",
  intensity = "balanced"
): number {
  const input = `${userKey}:${styleId}:${variantIndex}:${customDescription.trim()}:${intensity}`;
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash) % 2147483647;
}

function buildDesignBriefForRequest(
  styleId: string,
  customDescription?: string
): LandscapeDesignBrief {
  const brief = getLandscapeDesignBrief(styleId);
  const request = customDescription?.trim();
  if (!request) return brief;

  const asksForWaterFeature = /水池|池塘|鱼池|喷泉|水景|pond|pool|fountain|water feature/i.test(request);
  if (!asksForWaterFeature) {
    return {
      ...brief,
      designFocus: `${brief.designFocus} Also incorporates the user's custom request: ${request}.`,
    };
  }

  return {
    ...brief,
    designFocus: `${brief.designFocus} Adds a visible garden water feature such as a small pond or reflecting pool as requested by the user.`,
    materialSuggestions: [
      ...brief.materialSuggestions,
      "small pond or reflecting pool",
      "natural stone edging for the water feature",
    ],
  };
}

export function buildLandscapeDesignResult({
  resultImageUrl,
  originalImageUrl,
  styleId,
  variantIndex,
  designId = null,
  customDescription,
}: {
  resultImageUrl: string;
  originalImageUrl: string;
  styleId: string;
  variantIndex: number;
  designId?: string | null;
  customDescription?: string;
}): LandscapeDesignResult {
  return {
    resultImageUrl,
    originalImageUrl,
    styleId,
    variantIndex,
    designId,
    designBrief: buildDesignBriefForRequest(styleId, customDescription),
  };
}










