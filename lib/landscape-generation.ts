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

// Each option now specifies the lawn's shape/proportion explicitly, not
// just which plants or objects appear. Plant-palette differences alone
// weren't producing visibly different overall compositions - all four
// options were converging on "one oval lawn ringed by planting." Forcing
// a different lawn shape/size/position per option makes the macro layout
// itself differ, which plant choice differences alone couldn't do.
const FALLBACK_VARIANT_INSTRUCTIONS = [
  "Create an expanded border planting layout: reduce open lawn to small irregular remnants or narrow green strips, then let wide, deep, curving planting borders push far into the yard from both sides. Use the selected style's plant palette heavily so planting dominates the composition. This planting-led layout must not look like one large open lawn with a thin planting edge, a centered feature bed, or a simple path-divided lawn.",
  "Create a central focal garden layout: make the center of the yard a style-appropriate focal garden feature rather than a large plain lawn. Use a circular or square planting island, birdbath, stone sculpture, gravel court, terracotta pot cluster, or small basin feature surrounded by style-specific planting. Lawn may remain only as smaller supporting patches when the selected style suits lawn; for dry-climate styles, use gravel, stone, herbs, and drought-tolerant planting instead of a dominant turf lawn. This central-focus layout must not use one large open manicured lawn as its main feature.",
  "Create a rebuilt path and surface layout: a new, visually dominant path network (diagonal, S-curve, zigzag, loop, or intersecting walkways) divides the garden into several distinct planting and surface zones rather than simply running alongside one lawn. Replace the path material with a visibly different style-appropriate surface such as gravel, brick, decomposed granite, natural stone, clay pavers, pale pea gravel, or raked gravel. This path-led layout must not leave a single large central turf area as the dominant element.",
  "Create a landscape feature nook layout: replace a clearly visible portion of the garden with a dedicated seating or gathering area, gravel nook, paved corner, stone feature area, or pot cluster positioned to one side. Furnish it with a bench or stone seat, natural stone grouping, decorative planters, or style-appropriate pots, and surround it with selected-style planting. This feature-led layout must not use one large plain lawn, a single centered bed, or a simple path-divided lawn as its main feature.",
];

const STYLE_VARIANT_OVERRIDES: Record<string, string[]> = {
  modern: [
    "Create a Clean Garden clipped planting-block layout: replace scattered beds with ordered geometric planting areas, clipped evergreen balls, low hedging, compact flowering accents, and crisp mulch or light gravel bands. Keep any lawn small and controlled rather than making it the main feature.",
    "Create a Clean Garden low focal layout: place a restrained central or off-center low focal feature such as a stone basin, sculptural shrub group, or simple rectangular planting island, surrounded by clipped boxwood, tidy evergreen masses, and neat flowering shrubs. The result should feel crisp and ordered, with turf only as a supporting surface.",
    "Create a Clean Garden clean path and paving layout: rebuild the garden around straight or softly geometric walkways using stone fines, pale gravel, large-format paving, or narrow edging strips. Divide the yard into tidy planting rectangles and controlled lawn panels so the path design is visibly different from the source.",
    "Create a Clean Garden evergreen nook layout: add a small stone bench, stone seat, or compact sitting edge set inside an evergreen nook with clipped shrubs, upright accents, tidy groundcover, and clean gravel or paving around it. Keep the composition minimal, precise, and easy to maintain.",
  ],
  mediterranean: [
    "Create a Mediterranean asymmetrical herb-island layout: use irregular herb islands, asymmetrical planting islands, and staggered planting islands of varied island sizes, linked by weaving gravel channels. Fill the islands with lavender bands, rosemary bands, silver foliage, thyme-like groundcover, pale stone edging, and terracotta pots. This must not resemble the other Mediterranean options and must not become an empty gravel field.",
    "Create a Mediterranean single-focal garden court layout: use one clear centerpiece such as a single olive tree focal point or large terracotta urn focal point, set within radial stone paving and a ring of herb beds. Add terracotta pot grouping, lavender, rosemary, and stone-edged planting around the centerpiece. This must not resemble the other Mediterranean options and must not become a blank gravel field.",
    "Create a Mediterranean crossing-path quadrant layout: use crossing clay paver paths or diagonal clay paver paths to divide the center into four distinct planting quadrants. Fill the divided planting beds with agave, upright silver-leaf perennials, rosemary, lavender, and pale stone mulch. This layout is path-led and not circular islands, and it must be different from the other Mediterranean options.",
    "Create a Mediterranean off-center vignette layout: build a small sitting court with an off-center vignette, stone bench, stone water bowl, terracotta seating nook, terracotta pots, herb planters, agave, and silver-leaf perennials. This layout is a furnished garden moment, not circular islands, not a bare gravel field, and different from the other Mediterranean options.",
  ],
  japanese: [
    "Continuous moss groundcover shapes around asymmetrical natural stone groupings, pruned evergreen mounds, ferns, and small maples. Low layered planting keeps the garden quiet, mineral, and close to the ground.",
    "Pale raked gravel with soft dry creek curves surrounds low moss islands, sculpted shrubs, ferns, and a few larger natural stones placed asymmetrically. Natural materials fill the open ground with a calm, low, mineral character.",
    "A slow diagonal run of offset stepping stones crosses moss groundcover, ferns, low pruned shrubs, and small stone clusters. The route passes through several quiet planted pockets.",
    "A low stone basin or natural stone grouping sits among moss, raked gravel, ferns, and sculpted evergreen forms. Small stone details gather around one calm garden focal point.",
  ],
  tropical: [
    "Deep shade borders extend from both sides with broad hosta drifts, fern masses, layered broad-leaf planting, shade-tolerant flowers, and cool dark mulch. Dense planting frames a smaller open center.",
    "Tall ferns, overlapping hosta drifts, deep foliage layers, and shade-tolerant flowers form several enclosed leafy pockets. Varied leaf sizes create a cool woodland rhythm from foreground to hedge.",
    "A curved shaded path or woodland path uses irregular natural stone beneath arching ferns, hosta, and broad-leaf planting on both sides. Dark mulch edges and planted bends divide the route into quiet shaded sections.",
    "A shaded seating nook sits in a fern-framed corner with a simple bench or stone seat, layered hosta, ferns, shade flowers, and natural stone edging. Dense foliage wraps around the resting area.",
  ],
  "english-garden": [
    "Create an English Garden dense border layout: replace sparse beds with dense layered herbaceous border planting, roses, foxglove, salvia, catmint, and soft perennial drift masses that push into the garden. This romantic flower border layout must be different from the other English Garden variants.",
    "Create an English Garden flower-drift layout: use sweeping perennial drift bands, rose shrub clusters, foxglove spires, salvia, catmint, and seasonal flower color to make the garden flower-heavy and informal. This flower-rich layout must not resemble the other English Garden variants.",
    "Create an English Garden winding path layout: rebuild circulation as an informal winding path with pale pea gravel and brick-edged paths, weaving between herbaceous border beds, roses, foxglove, and catmint. This path-led English garden must be different from the other English Garden variants.",
    "Create an English Garden romantic seating layout: add a simple garden bench or romantic seating moment framed by roses, dense herbaceous borders, foxglove, salvia, catmint, and overflowing perennial planting. This seating layout must not be the same as the other English Garden variants.",
  ],
  minimalist: [
    "Bold hydrangea and camellia color blocks fill broad reshaped beds with flowering shrub masses, seasonal flower bands, and layered bloom heights. Dense coordinated color occupies most planting areas around a smaller open center.",
    "Sweeping seasonal flower bands and repeated color ribbons curve around reshaped beds. Rose-like flowering shrubs, hydrangea, camellia, and lower perennials form broad waves of pink, white, red, and soft purple.",
    "A gently curving stepping-stone or fine-gravel path moves through expanded flowering shrub beds. Hydrangea, camellia, rose-like shrubs, and colorful perennial drifts overlap both sides of the route.",
    "One specimen flowering shrub or compact flowering tree anchors an off-center bed, surrounded by hydrangea, camellia, rose-like shrubs, seasonal flowers, and clean natural edging. Smaller flowering groups lead toward the focal plant.",
  ],
  desert: [
    "Broad gravel-mulch beds spread across the yard with sculpturally spaced agave, succulent rosettes, yucca, dry-climate groundcover, and small native grass drifts. Open mineral surfaces separate each drought-tolerant planting group.",
    "A shallow winding dry wash of decomposed granite and pale river stones crosses the yard between native grass drifts, agave, succulent rosettes, and low dry-climate groundcover. Larger stones gather naturally along the wash bends.",
    "Several natural boulder clusters anchor mineral planting beds connected by a decomposed-granite path. Agave, yucca, succulent rosettes, and sparse native grasses repeat around the stone outcrops.",
    "One continuous garden ground plane connects an off-center dry seating nook to a small terracotta pot group through a single gravel court. Agave, succulent rosettes, low native grasses, and two natural boulder groups surround the nook as one cohesive garden.",
  ],
};

export function getLandscapeVariantInstruction(styleId: string, variantIndex: number): string {
  const variants = STYLE_VARIANT_OVERRIDES[styleId] ?? FALLBACK_VARIANT_INSTRUCTIONS;
  return variants[variantIndex % variants.length];
}
export function getLandscapeVariantSeed(
  userKey: string,
  styleId: string,
  variantIndex: number,
  customDescription = "",
  intensity = "balanced",
  variantInstruction = ""
): number {
  const input = `${userKey}:${styleId}:${variantIndex}:${customDescription.trim()}:${intensity}:${variantInstruction}`;
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


