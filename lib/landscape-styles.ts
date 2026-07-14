export type LandscapeRedesignIntensity = "conservative" | "balanced" | "creative";

export interface LandscapeDesignBrief {
  styleName: string;
  designFocus: string;
  plantSuggestions: string[];
  materialSuggestions: string[];
  maintenanceLevel: string;
}

export interface LandscapeStyle {
  id: string;
  label: string;
  /** Appended to the user's own description (if any) when building the Replicate prompt. */
  promptFragment: string;
  /**
   * A short (~10 word) restatement of the style's 2-3 most essential,
   * distinctive elements, repeated near the end of the prompt (see
   * buildLandscapePrompt) so the visual direction doesn't get diluted by the
   * variant-specific layout instruction sitting between it and the model's
   * final read of the prompt.
   */
  styleAnchor: string;
  category?: "stable" | "creative";
  designBrief: Omit<LandscapeDesignBrief, "styleName">;
}

export const LANDSCAPE_STYLES: LandscapeStyle[] = [
  {
    id: "modern",
    label: "Clean Garden",
    category: "stable",
    promptFragment:
      "Create an orderly refined garden layout with crisp clipped shrubs, tidy evergreen structure, a refreshed plant palette, fuller flowering shrub groups, stronger seasonal flower color, clean bed edges, restrained flowering accents, organized planting blocks, a redesigned path layout, a clean light gravel or stone-fines path that replaces the original path material, daytime garden markers, and a simple bench or stone seat; the layout language must feel neat, edited, and low-clutter rather than romantic, dry-climate, moss-stone, shade-border, or xeriscape",
    styleAnchor: "Keep it crisp and orderly: clipped evergreen shrubs, clean light gravel paths.",
    designBrief: {
      designFocus: "A tidier, cleaner garden composition that keeps buildings fixed while improving planting structure, path layout, and garden details.",
      plantSuggestions: ["clipped boxwood", "low evergreen shrubs", "compact flowering shrubs", "tidy groundcover"],
      materialSuggestions: ["clean gravel or compacted path", "subtle stone edging", "natural mulch"],
      maintenanceLevel: "Moderate - regular trimming keeps the clean look sharp.",
    },
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    category: "stable",
    promptFragment:
      "Create a Mediterranean garden-only redesign with distinct composition types: asymmetrical herb islands, a single olive or terracotta focal feature, crossing clay paver paths, or an off-center stone bench and water bowl vignette. Use gravel courts, designed planting islands, stone-edged herb beds, lavender bands, rosemary bands, olive focal planting, silver foliage, agave accents, terracotta pot grouping, stone paving pattern, limestone chips, natural stone edging, clay paver edging, and terracotta-toned compacted earth paths that replace the original path material; every central court area must contain planting islands, pots, stone pattern, or a focal feature, not an empty gravel field; avoid repetitive round islands and avoid repeated circular planting islands; the layout language must feel sun-warmed, aromatic, drought-tolerant, gravel-and-stone based, and stone-and-herb based, not like English borders, moss-stone gardens, clean clipped gardens, or shade planting",
    styleAnchor: "Must include olive trees, lavender, terracotta pots, warm gravel, and stone herb planting.",
    designBrief: {
      designFocus: "A warm, drought-tolerant planting scheme with silver foliage, aromatic herbs, natural stone texture, and a more Mediterranean path rhythm.",
      plantSuggestions: ["olive trees", "lavender", "rosemary", "ornamental grasses", "agave"],
      materialSuggestions: ["warm gravel", "natural stone edging", "terracotta-toned compacted earth"],
      maintenanceLevel: "Low to moderate - best for sunny, dry, well-drained spaces.",
    },
  },
  {
    id: "japanese",
    label: "Moss & Stone Garden",
    category: "stable",
    promptFragment:
      "Create a calm asymmetrical garden composition using expanded moss groundcover, raked gravel fields, larger natural stone groupings, sculpted shrub forms, ferns, small maples, quiet negative planting space, reworked bed outlines, stone stepping paths or raked gravel paths that replace the original path surface, and a low stone lantern form; the layout language must feel quiet, mineral, mossy, and contemplative, not flower-heavy, Mediterranean, clean clipped, shade-border, or xeriscape",
    styleAnchor: "Must include moss groundcover, raked gravel, and natural stone groupings.",
    designBrief: {
      designFocus: "A calm moss-and-stone composition that keeps buildings fixed while reshaping planting, stones, gravel, and circulation for a quieter garden mood.",
      plantSuggestions: ["moss", "pruned evergreen shrubs", "ferns", "small maples", "shade-tolerant groundcover"],
      materialSuggestions: ["raked gravel", "natural stepping stones", "mossy stone edging"],
      maintenanceLevel: "Moderate - pruning and gravel upkeep are important.",
    },
  },
  {
    id: "tropical",
    label: "Shade Planting Borders",
    category: "stable",
    promptFragment:
      "Deep shade borders frame the garden with enlarged side beds, bold broad-leaf planting masses, hosta, ferns, overlapping foliage layers, shade-tolerant flower accents, a curved shaded path or natural stone path, dark mulch, and brick or stone edging. The garden feels lush, leafy, cool, enclosed by planting, and shade-friendly rather than dry, flower-dominated, clipped, or gravel-dominated.",
    styleAnchor: "Must include broad-leaf hosta and ferns in deep layered shade borders.",
    designBrief: {
      designFocus: "A lush border refresh that frames the garden with broad leaves, shade-friendly texture, and clearer circulation without adding architecture.",
      plantSuggestions: ["hosta", "fern", "canna", "ginger lily", "shade-tolerant flowering perennials"],
      materialSuggestions: ["compacted earth or gravel path", "dark mulch", "brick or stone bed edging"],
      maintenanceLevel: "Moderate - foliage beds need seasonal cleanup and watering.",
    },
  },
  {
    id: "english-garden",
    label: "English Garden",
    category: "creative",
    promptFragment:
      "Create a garden-only English ground-plane redesign with a romantic flower-rich layout with dense layered herbaceous borders, overflowing rose shrub groups, foxglove, salvia, catmint, soft perennial drifts, informal winding pale pea gravel, brick-edged paths that replace the original path material, small ornamental garden markers, and a simple garden bench with garden-only views; the layout language must feel lush, romantic, informal, and flower-heavy, not Mediterranean dry garden, moss-stone garden, clean clipped garden, shade foliage border, or xeriscape",
    styleAnchor: "Must include roses and dense layered herbaceous borders, romantic and flower-heavy.",
    designBrief: {
      designFocus: "A romantic, flower-heavy garden concept with layered beds and a more expressive path layout.",
      plantSuggestions: ["roses", "foxglove", "salvia", "catmint", "herbaceous perennials"],
      materialSuggestions: ["pea gravel", "soft brick edging", "informal stepping paths"],
      maintenanceLevel: "High - best for users who want rich planting and accept more upkeep.",
    },
  },
  {
    id: "minimalist",
    label: "Flowering Garden Refresh",
    category: "stable",
    promptFragment:
      "Bright seasonal flowers fill reshaped natural beds with richer color blocks, hydrangea, camellia, rose-like flowering shrubs, broad seasonal flower bands, expanded layered flowering shrubs, and varied bloom heights. A curved fine-gravel or stepping-stone path replaces the original path surface and passes between the flower-rich beds with clean natural edging. The garden feels colorful, fresh, floral, abundant, and homeowner-friendly rather than dry, mossy, clipped, foliage-only, or xeric.",
    styleAnchor: "Must include bright hydrangea and camellia flower color blocks throughout.",
    designBrief: {
      designFocus: "A flower-forward refresh that keeps buildings fixed while increasing color, layered planting, and a more intentional garden path composition.",
      plantSuggestions: ["camellia", "rose-like flowering shrubs", "hydrangea", "low evergreen hedges", "seasonal perennials"],
      materialSuggestions: ["gravel or compacted earth path", "mulch under shrubs", "natural bed edging"],
      maintenanceLevel: "Moderate - flowering shrubs need pruning and seasonal care.",
    },
  },
  {
    id: "desert",
    label: "Desert / Xeriscape",
    category: "stable",
    promptFragment:
      "Large gravel-mulch fields and decomposed-granite paths flow continuously between reworked mineral beds filled with agave, succulent rosettes, sculptural succulent groups, native grass drifts, dry-climate groundcover, and natural boulders. Sparse drought-tolerant planting and open mineral surfaces give the whole garden an arid, sculptural, spacious, low-maintenance character rather than a lush, mossy, clipped, shaded, or herb-dominated character.",
    styleAnchor: "Must include agave, succulent rosettes, and large gravel mulch fields.",
    designBrief: {
      designFocus: "A water-wise xeriscape concept using gravel mulch, sculptural succulents, drought-tolerant texture, and a redesigned dry garden path.",
      plantSuggestions: ["agave", "succulent rosettes", "native grasses", "yucca", "dry-climate groundcover"],
      materialSuggestions: ["gravel mulch", "decomposed granite", "natural boulders"],
      maintenanceLevel: "Low - suited to dry climates with minimal irrigation.",
    },
  },
];

// Under the mask-based pipeline (lib/landscape-mask.ts + flux-fill-pro),
// the building region is physically excluded from regeneration — it's
// copied pixel-for-pixel from the source photo, not redrawn. So the old
// PRESERVATION_RULES block (300+ words asking the model not to touch the
// building) is no longer needed at all; that's the whole point of this
// architecture change. The one thing that IS still worth saying explicitly
// is this: with the model given free rein over the garden area and no
// building-preservation text constraining it, it will sometimes borrow
// stock-photo elements (walls, sheds, gates) from its training data for
// the requested style. This single rule heads that off.
const NO_NEW_STRUCTURES_RULE =
  "Hard boundary rule: the garden's open edges must be preserved on every side of the frame, bordered only by existing hedges and trees, with open sky or foliage visible beyond them, even in the deep background or distant view. The scene must remain a private residential garden with planting, paths, garden surfaces, and landscape objects only — no other structures of any kind.";

// NOTE: previously had a NO_WATERMARK_RULE here explicitly saying "do not
// include any watermark, logo, character, or overlaid text." Removed —
// watermarks got MORE frequent and more legible after adding that rule, not
// less. Same failure mode as the swimming-pool wording: naming a concept in
// the prompt, even to forbid it, seems to increase its presence rather than
// suppress it for this model. Leaving it unmentioned entirely instead.

const INTENSITY_PROMPTS: Record<LandscapeRedesignIntensity, string> = {
  conservative:
    "Redesign intensity — conservative: keep the existing bed shapes and path route recognizable; refresh plant varieties, flower color, and bed edging only.",
  balanced:
    "Redesign intensity — balanced: rework at least 40% of the garden area; reshape planting beds, introduce a new plant palette, and replace the path material with a different style-appropriate surface; do not repeat the source layout.",
  creative:
    "Redesign intensity — creative: rework at least 60% of the garden area; reroute or reshape the path, replace its material, introduce a distinct plant palette, and add new landscape objects such as a bench, planters, or stones; do not repeat the source layout.",
};

export function getStyleById(styleId: string): LandscapeStyle | undefined {
  return LANDSCAPE_STYLES.find((style) => style.id === styleId);
}

function buildUserRequestPrompt(customDescription?: string): string | null {
  const rawRequest = customDescription?.trim();
  if (!rawRequest) return null;

  const hints: string[] = [];
  const hasWaterFeature = /水池|池塘|鱼池|喷泉|水景|pond|pool|fountain|water feature/i.test(rawRequest);
  const hasCenterPlacement = /中间|中央|中心|middle|center|centre/i.test(rawRequest);

  if (hasWaterFeature) {
    hints.push("add a small birdbath, fountain basin, or stone water bowl feature, sized as a single garden ornament");
  }

  if (hasCenterPlacement) {
    hints.push("place the requested feature near the center of the yard or garden where it fits naturally");
  }

  const interpretedRequest = hints.length > 0 ? hints.join("; ") : rawRequest;

  return `PRIORITY USER REQUEST: ${rawRequest}. Interpreted for the image model: ${interpretedRequest}. This requested change must be visible in the final design unless it would create a building or unsafe structure.`;
}

export function getLandscapeDesignBrief(styleId: string): LandscapeDesignBrief {
  const style = getStyleById(styleId);

  if (!style) {
    return {
      styleName: "Custom Landscape Design",
      designFocus: "A custom landscape concept based on the uploaded yard photo and user instructions.",
      plantSuggestions: ["layered shrubs", "seasonal flowers", "groundcover"],
      materialSuggestions: ["redesigned path surface", "natural mulch", "stone edging"],
      maintenanceLevel: "Moderate - depends on the requested design details.",
    };
  }

  return {
    styleName: style.label,
    ...style.designBrief,
  };
}

/**
 * Builds the prompt sent to flux-fill-pro for the garden (mask-white) area
 * only. Combines the selected style, an optional variant-specific layout
 * brief, the user's free-text request, and the redesign intensity, plus the
 * no-new-structures anti-hallucination rule.
 *
 * Ordering: style description and variant instruction are both placed in
 * the front section, back to back, rather than one strictly ahead of the
 * other. The style's `styleAnchor` (2-3 essential elements, ~10 words) is
 * repeated again near the end — observed behavior was the variant
 * instruction sitting between the style text and the model's final read of
 * the prompt was enough to dilute style fidelity (Mediterranean losing its
 * olive trees/terracotta in 2 of 4 variants), even with the full style text
 * present earlier. The no-new-structures rule is likewise stated once up
 * front and again at the end for the same reason.
 *
 * Deliberately does NOT mention watermarks/logos anywhere (see the note by
 * the removed NO_WATERMARK_RULE above) — naming that concept to forbid it
 * made watermarks appear more often and more legibly, not less.
 */
export function buildLandscapePrompt(
  styleId: string,
  customDescription?: string,
  intensity: LandscapeRedesignIntensity = "balanced",
  variantInstruction?: string
): string {
  const style = getStyleById(styleId);
  const styleText = style
    ? style.promptFragment
    : "a beautifully redesigned outdoor garden";
  const styleAnchor = style?.styleAnchor;

  const userRequest = buildUserRequestPrompt(customDescription);

  const parts = [
    NO_NEW_STRUCTURES_RULE,
    styleText,
    variantInstruction,
    userRequest,
    INTENSITY_PROMPTS[intensity],
    styleAnchor,
    NO_NEW_STRUCTURES_RULE,
  ];

  return parts.filter(Boolean).join(" ");
}