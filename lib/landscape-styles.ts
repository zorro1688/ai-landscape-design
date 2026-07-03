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
  category?: "stable" | "creative";
  designBrief: Omit<LandscapeDesignBrief, "styleName">;
}

export const LANDSCAPE_STYLES: LandscapeStyle[] = [
  {
    id: "modern",
    label: "Clean Garden",
    category: "stable",
    promptFragment:
      "STYLE SIGNATURE - Clean Garden: create an orderly refined garden layout with crisp clipped shrubs, tidy evergreen structure, a refreshed plant palette, fuller flowering shrub groups, stronger seasonal flower color, clean bed edges, restrained flowering accents, organized planting blocks, a redesigned path layout, a clean light gravel or stone-fines path that replaces the original path material, daytime garden markers, and a simple bench or stone seat; the layout language must feel neat, edited, and low-clutter rather than romantic, dry-climate, moss-stone, shade-border, or xeriscape",
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
      "STYLE SIGNATURE - Mediterranean garden-only redesign: create a warm dry-climate garden layout with reduced plain lawn, reduce plain lawn areas, lavender bands, rosemary bands, olive focal planting, silver foliage, agave accents, terracotta planters, limestone chips, natural stone edging, clay paver edging, and terracotta-toned compacted earth paths that replace the original path material; the layout language must feel sun-warmed, aromatic, drought-tolerant, and stone-and-herb based, not like English borders, moss-stone gardens, clean clipped gardens, or shade planting",
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
      "STYLE SIGNATURE - Moss & Stone Garden: create a transformative moss and stone garden redesign with a calm asymmetrical moss-and-stone composition with expanded moss groundcover, raked gravel fields, larger natural stone groupings, sculpted shrub forms, ferns, small maples, quiet negative planting space, reworked bed outlines, stone stepping paths or raked gravel paths that replace the original path surface, and a stone lantern-style garden ornament; the layout language must feel quiet, mineral, mossy, and contemplative, not flower-heavy, Mediterranean, clean clipped, shade-border, or xeriscape",
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
      "STYLE SIGNATURE - Shade Planting Borders: create a shade planting border redesign with a cool layered shade garden layout with enlarged side borders, bolder broad-leaf planting masses, hosta, ferns, deeper layered foliage, shade-tolerant flower accents, curved shaded path layout, dark mulch, brick edging, or natural stone surface that replaces the original path material, and daytime-visible border markers; the layout language must feel lush, leafy, enclosed by planting, and shade-friendly, not dry Mediterranean, moss-stone, formal clean, flower-heavy, or xeriscape",
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
      "STYLE SIGNATURE - garden-only English ground-plane redesign: create a romantic flower-rich layout with dense layered herbaceous borders, overflowing rose shrub groups, foxglove, salvia, catmint, soft perennial drifts, informal winding pale pea gravel, brick-edged paths that replace the original path material, small ornamental garden markers, and a simple garden bench with garden-only views; the layout language must feel lush, romantic, informal, and flower-heavy, not Mediterranean dry garden, moss-stone garden, clean clipped garden, shade foliage border, or xeriscape",
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
      "STYLE SIGNATURE - Flowering Garden Refresh: create a flowering garden redesign with a bright seasonal flowering layout with richer flower color blocks, hydrangea, camellia, rose-like flowering shrubs, seasonal flower bands, expanded layered flowering shrubs, varied bloom heights, reshaped natural planting beds, a reshaped path layout, a visibly different gravel, stepping stone, or natural edging material that replaces the original path material, improved bed edges, and daytime garden markers; the layout language must feel colorful, fresh, floral, and homeowner-friendly, not dry Mediterranean, moss-stone, clean clipped, shade foliage, or xeriscape",
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
      "STYLE SIGNATURE - Desert / Xeriscape: create a low-water dry garden layout with large gravel mulch fields, agave, succulent rosettes, sculptural succulent groups, native grass drifts, dry-climate groundcover, natural boulders, reworked bed outlines, decomposed granite paths or redesigned gravel paths that replace the original path material, and low desert stone markers; the layout language must feel arid, sculptural, open, low-maintenance, and mineral, not lush English, mossy, shade-border, clean clipped, or Mediterranean herb garden",
    designBrief: {
      designFocus: "A water-wise xeriscape concept using gravel mulch, sculptural succulents, drought-tolerant texture, and a redesigned dry garden path.",
      plantSuggestions: ["agave", "succulent rosettes", "native grasses", "yucca", "dry-climate groundcover"],
      materialSuggestions: ["gravel mulch", "decomposed granite", "natural boulders"],
      maintenanceLevel: "Low - suited to dry climates with minimal irrigation.",
    },
  },
];

const INTENSITY_PROMPTS: Record<LandscapeRedesignIntensity, string> = {
  conservative:
    "Conservative redesign intensity: keep existing layout, path alignment, major trees, hedges, and garden boundaries mostly unchanged; make subtle planting, flower, edging, path-surface, and material improvements while preserving buildings.",
  balanced:
    "Balanced redesign intensity: create a noticeable garden-only redesign while preserving buildings, sky, camera angle, original daylight, and main site boundaries; redesign at least 40% of the editable ground-level garden area; do not repeat the source layout; the building must remain the same apparent size, distance, perspective, and same position in the frame; do not make the building appear closer or farther away; paths, planting beds, lawn, stones, water features, and daytime garden markers may change to match the selected style; replace the original path material with a visibly different style-appropriate path material; add new style-specific plant varieties, new flower color layers, and a few non-building landscape elements such as benches, decorative planters, daytime garden markers, stones, or water features; replace and reshape planting beds, introduce a new plant palette, change flower colors, add layered shrubs and groundcover masses, and redesign path layout, path materials, and bed outlines.",
  creative:
    "Creative redesign intensity: create a noticeable strong garden-only redesign with a distinct plant palette; redesign at least 60% of the editable ground-level garden area; do not repeat the source layout; add new style-specific plant varieties, new flower color layers, and add new non-building landscape elements such as benches, daytime garden markers, stones, water features, decorative planters, and small garden ornaments; visibly replace and reshape planting beds, change flower colors, add richer shrub layers, groundcover masses, stones, water features, and stronger garden design details while preserving original daylight; paths may be redesigned or rerouted within the same yard, and use a visibly different style-appropriate path material instead of the original path material; daytime garden markers may be added or repositioned, but do not change the scene into dusk, evening, or night; keep existing buildings fixed at the same apparent size, distance, perspective, and same position in the frame, but do not add buildings, rooms, roofs, walls, pavilions, gazebos, temples, pergolas, sheds, or architectural structures.",
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
    hints.push("add a clearly visible small garden pond, reflecting pool, or garden water feature");
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
 * Builds the final prompt sent to the image model, combining the
 * selected style preset with any free-text description the user typed.
 */
export function buildLandscapePrompt(
  styleId: string,
  customDescription?: string,
  intensity: LandscapeRedesignIntensity = "balanced"
): string {
  const style = getStyleById(styleId);
  const styleText = style
    ? style.promptFragment
    : "a beautifully redesigned outdoor landscape";

  const preservationRules =
    "Preserve the same camera angle, perspective, spatial boundaries, buildings, building facades, rooflines, windows, doors, walls attached to buildings, fences, patios, steps, sky, lighting, shadows, exposure, and main site boundaries. Treat the building and sky as locked background. The building must remain the same apparent size, distance from camera, perspective, and same position in the frame. The building must align with the before image and visually overlap the original building in a before-after comparison. Do not move the building, crop it differently, zoom in, zoom out, rotate it, change its angle, or make the building appear closer or farther away. The building footprint, roofline, facade, windows, doors, visible wall edges, roof color, stone color, window count, and chimney position must stay fixed. Preserve the original daylight, same brightness and color temperature, same shadow direction, and same exposure. Do not darken the image, do not change the time of day, do not create dusk, evening, night, cinematic mood, dramatic shadows, warm glowing windows, or artificial lighting atmosphere. Garden paths may be redesigned, rerouted, reshaped, widened, narrowed, or resurfaced to match the selected style. Change the path material and replace the original path material with a style-appropriate surface; do not keep the original path material unchanged. Landscape-only objects such as benches, daytime garden markers, small ornaments, decorative planters, stones, water features, planting beds, lawn, groundcover, mulch, gravel, and surface materials may be added, replaced, or repositioned. Do not add new buildings, houses, roofs, rooms, walls, pavilions, gazebos, temples, teahouses, pergolas, sheds, or architectural structures. If the source image has no visible building facade, do not introduce any building facade, windows, roofline, or brick wall. Do not turn this garden path photo into a courtyard, residential property, villa, estate, resort, patio between buildings, or architectural scene. Do not reinterpret the scene as a side yard, alley, corridor, courtyard, building passage, or narrow walled garden. Do not create tall blank walls. Do not create a narrow passage between buildings. Keep the scene as an outdoor garden path bordered by plants. Keep the original open planted garden character. Do not replace flowering shrubs or colored blossoms with plain green hedges or plain lawn; instead increase visible plant variety, flower color, layered shrubs, and groundcover texture. Do not erase all walkable circulation; keep or create a visible gravel, brick, stepping stone, decomposed granite, natural stone, or compacted earth walking surface. Only redesign the landscape layer: plants, new plant varieties, planting beds, flowers, lawn, groundcover, gravel, mulch, stones, benches, decorative planters, water features, daytime garden markers, path layout, and surface materials.";

  const userRequest = buildUserRequestPrompt(customDescription);
  const requestPrefix = userRequest ? `${userRequest} ` : "";

  return `CRITICAL EDIT BOUNDARY: copy the architecture, sky, lighting, and camera geometry from the input image. Do not apply whole-image style transfer. Edit only the ground-level garden plane. ${requestPrefix}${preservationRules} ${INTENSITY_PROMPTS[intensity]} Garden-only style target: ${styleText}. The selected style signature must dominate the editable landscape layer: use the style-specific layout language, plant palette, path material, bed shape, and landscape-only elements. Do not produce a generic garden refresh that looks similar across different styles. Follow the option-specific complete design brief appended after this base prompt as the final layout direction.`;
}



















