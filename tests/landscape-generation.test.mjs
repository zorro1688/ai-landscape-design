import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadTsModule(relativePath, requireMap = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (id in requireMap) return requireMap[id];
    throw new Error(`Unexpected require: ${id}`);
  };
  new Function("exports", "module", "require", compiled)(module.exports, module, localRequire);
  return module.exports;
}

const styles = loadTsModule("../lib/landscape-styles.ts");
const {
  buildLandscapePrompt,
  getLandscapeDesignBrief,
} = styles;
const {
  getLandscapeGenerationPlan,
  getLandscapeVariantSeed,
  buildLandscapeDesignResult,
} = loadTsModule("../lib/landscape-generation.ts", {
  "./landscape-styles": styles,
});

assert.deepEqual(getLandscapeGenerationPlan({ isAuthenticated: false, planType: "1" }), {
  variantCount: 1,
  creditCost: 1,
  tier: "standard",
});

assert.deepEqual(getLandscapeGenerationPlan({ isAuthenticated: true, planType: "1" }), {
  variantCount: 4,
  creditCost: 4,
  tier: "standard",
});

assert.deepEqual(getLandscapeGenerationPlan({ isAuthenticated: true, planType: "3" }), {
  variantCount: 4,
  creditCost: 12,
  tier: "premium",
});

assert.equal(getLandscapeVariantSeed("user-123", "modern", 0), getLandscapeVariantSeed("user-123", "modern", 0));
assert.notEqual(getLandscapeVariantSeed("user-123", "modern", 0), getLandscapeVariantSeed("user-123", "modern", 1));

const conservativePrompt = buildLandscapePrompt("modern", undefined, "conservative").toLowerCase();
assert.match(conservativePrompt, /redesign intensity/);
assert.match(conservativePrompt, /conservative/);
assert.match(conservativePrompt, /keep the existing bed shapes and path route recognizable/);

const balancedPrompt = buildLandscapePrompt("modern", undefined, "balanced").toLowerCase();
assert.match(balancedPrompt, /redesign intensity/);
assert.match(balancedPrompt, /balanced/);
assert.match(balancedPrompt, /rework at least 40% of the garden area/);
assert.match(balancedPrompt, /reshape planting beds/);
assert.match(balancedPrompt, /new plant palette/);
assert.match(balancedPrompt, /replace the path material/);
assert.match(balancedPrompt, /do not repeat the source layout/);
assert.doesNotMatch(balancedPrompt, /garden lighting|garden lights/);

const creativePrompt = buildLandscapePrompt("modern", undefined, "creative").toLowerCase();
assert.match(creativePrompt, /redesign intensity/);
assert.match(creativePrompt, /creative/);
assert.match(creativePrompt, /rework at least 60% of the garden area/);
assert.match(creativePrompt, /reroute or reshape the path/);
assert.match(creativePrompt, /distinct plant palette/);
assert.match(creativePrompt, /bench|planters|stones/);
assert.match(creativePrompt, /no other structures of any kind/);
assert.doesNotMatch(creativePrompt, /garden lighting|garden lights/);

assert.notEqual(
  getLandscapeVariantSeed("user-123", "modern", 0, "add a pond", "creative"),
  getLandscapeVariantSeed("user-123", "modern", 0, "add a fire pit", "creative"),
  "seed should vary when the user's requested feature changes"
);
assert.notEqual(
  getLandscapeVariantSeed("user-123", "modern", 0, "add a pond", "creative"),
  getLandscapeVariantSeed("user-123", "modern", 0, "add a pond", "conservative"),
  "seed should vary when redesign intensity changes"
);
assert.notEqual(
  getLandscapeVariantSeed("user-123", "japanese", 0, "", "creative", "old moss option wording"),
  getLandscapeVariantSeed("user-123", "japanese", 0, "", "creative", "new moss option wording"),
  "seed should vary when a style-specific variant prompt changes so bad fixed seeds do not persist"
);

const { getLandscapeVariantInstruction } = loadTsModule("../lib/landscape-generation.ts", {
  "./landscape-styles": styles,
});
const variantInstructions = [0, 1, 2, 3].map((index) => getLandscapeVariantInstruction("custom", index).toLowerCase());
assert.equal(new Set(variantInstructions).size, 4);
assert.doesNotMatch(variantInstructions.join(" "), /design option|signature|watermark|logo|overlaid text/);
assert.match(variantInstructions.join(" "), /must not look like|must not use/);
assert.match(variantInstructions.join(" "), /lawn|turf/);
assert.match(variantInstructions.join(" "), /must not .*large .*lawn|must not leave a single large central turf/);
assert.doesNotMatch(variantInstructions.join(" "), /garden lighting|garden lights/);

assert.match(variantInstructions[0], /expanded border planting/);
assert.match(variantInstructions[0], /reduce open lawn|small irregular remnants|narrow green strips/);
assert.match(variantInstructions[0], /wide, deep, curving planting borders/);
assert.match(variantInstructions[0], /planting dominates the composition/);
assert.match(variantInstructions[0], /planting-led layout/);

assert.match(variantInstructions[1], /central focal garden/);
assert.match(variantInstructions[1], /style-appropriate focal garden feature|rather than a large plain lawn/);
assert.match(variantInstructions[1], /circular|square planting island|birdbath|stone sculpture|gravel court|terracotta pot cluster|small basin/);
assert.match(variantInstructions[1], /central-focus layout/);
assert.match(variantInstructions[1], /dry-climate styles.*gravel, stone, herbs, and drought-tolerant planting/);

assert.match(variantInstructions[2], /rebuilt path and surface layout/);
assert.match(variantInstructions[2], /diagonal|s-curve|zigzag|loop|intersecting walkways/);
assert.match(variantInstructions[2], /several distinct planting and surface zones/);
assert.match(variantInstructions[2], /gravel|brick|decomposed granite|natural stone|clay pavers|pale pea gravel|raked gravel/);
assert.match(variantInstructions[2], /path-led layout/);

assert.match(variantInstructions[3], /landscape feature nook layout/);
assert.match(variantInstructions[3], /seating or gathering area|gravel nook|paved corner|stone feature area|pot cluster/);
assert.match(variantInstructions[3], /bench|stone seat|natural stone grouping|decorative planters|style-appropriate pots/);
assert.match(variantInstructions[3], /feature-led layout/);
assert.doesNotMatch(variantInstructions.join(" "), /keeping the primary path route visible|keep the primary path route visible/);

const japaneseVariantPrompt = buildLandscapePrompt(
  "japanese",
  "在院子中间加一个水池",
  "creative",
  getLandscapeVariantInstruction("japanese", 2)
).toLowerCase();
assert.match(japaneseVariantPrompt, /moss groundcover|moss carpet/);
assert.match(japaneseVariantPrompt, /stepping stone path|diagonal stepping stone route|offset stone path|offset stepping stones/);
assert.match(japaneseVariantPrompt, /priority user request/);
assert.match(japaneseVariantPrompt, /redesign intensity/);
assert.match(japaneseVariantPrompt, /moss groundcover, raked gravel, and natural stone groupings/);
assert.match(japaneseVariantPrompt, /diagonal stepping stone route|offset stone path|offset stepping stones|stone crossing/);
assert.doesNotMatch(japaneseVariantPrompt, /transformative|moss & stone|moss and stone garden redesign|garden redesign|design title|stone lantern-style garden ornament/);

const japaneseVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("japanese", index).toLowerCase()
);
assert.doesNotMatch(japaneseVariants.join(" "), /create a [^:]+ layout:/);
assert.doesNotMatch(japaneseVariants[0], /moss carpet layout|broad moss carpet|groundcover ribbons|replace ordinary planting beds/);
assert.doesNotMatch(
  japaneseVariants.join(" "),
  /composition|variants|must not|resemble|not the same|scene/,
  "Moss & Stone variants should use direct visual material language rather than caption-like option descriptions"
);
const shadePlantingVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("tropical", index).toLowerCase()
);
assert.doesNotMatch(
  shadePlantingVariants.join(" "),
  /create a shade planting borders|layout:|variants|must not|resemble|not the same/,
  "Shade Planting variants should use direct visual material language rather than caption-like option descriptions"
);
const floweringGardenVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("minimalist", index).toLowerCase()
);
assert.doesNotMatch(
  floweringGardenVariants.join(" "),
  /create a flowering garden refresh|layout:|variants|must not|resemble|not the same|design|option/,
  "Flowering Garden variants should use direct visual descriptions rather than presentation-board language"
);
const desertVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("desert", index).toLowerCase()
);
assert.doesNotMatch(
  desertVariants.join(" "),
  /create a desert|layout:|variants|must not|resemble|not the same|design option|comparison|diptych|split-screen/,
  "Desert variants should describe one photographic garden scene without presentation or comparison language"
);
assert.match(
  desertVariants[3],
  /one continuous garden|continuous ground plane|cohesive garden/,
  "Desert option 4 should explicitly remain one continuous garden scene"
);
const cleanGardenVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("modern", index).toLowerCase()
);
assert.equal(new Set(cleanGardenVariants).size, 4);
assert.match(cleanGardenVariants[0], /clipped|evergreen|geometric|ordered/);
assert.match(cleanGardenVariants[1], /low focal|stone basin|sculptural shrub|central/);
assert.match(cleanGardenVariants[2], /clean path|straight|geometric|stone fines|paving/);
assert.match(cleanGardenVariants[3], /stone bench|evergreen nook|seat/);
assert.doesNotMatch(cleanGardenVariants.join(" "), /large open lawn|large plain lawn|dominant turf|generous open lawn/);

const mediterraneanVariants = [0, 1, 2, 3].map((index) =>
  getLandscapeVariantInstruction("mediterranean", index).toLowerCase()
);
assert.equal(new Set(mediterraneanVariants).size, 4);
assert.notDeepEqual(mediterraneanVariants, cleanGardenVariants);
assert.match(mediterraneanVariants[0], /lavender|rosemary|silver foliage|gravel/);
assert.match(mediterraneanVariants[0], /irregular herb islands|asymmetrical planting islands|staggered planting islands/);
assert.match(mediterraneanVariants[0], /weaving gravel channels|varied island sizes/);
assert.match(mediterraneanVariants[1], /olive|terracotta|gravel court|central/);
assert.match(mediterraneanVariants[1], /single olive tree focal point|large terracotta urn focal point|one clear centerpiece/);
assert.match(mediterraneanVariants[1], /radial stone paving|ring of herb beds/);
assert.match(mediterraneanVariants[2], /clay paver|limestone|decomposed granite|warm gravel/);
assert.match(mediterraneanVariants[2], /crossing clay paver paths|diagonal clay paver paths|four distinct planting quadrants/);
assert.match(mediterraneanVariants[2], /not circular islands/);
assert.match(mediterraneanVariants[3], /stone bench|terracotta pots|agave|herb/);
assert.match(mediterraneanVariants[3], /stone water bowl|stone bench|terracotta seating nook/);
assert.match(mediterraneanVariants[3], /off-center vignette|small sitting court|not circular islands/);
assert.doesNotMatch(mediterraneanVariants.join(" "), /lawn|turf|green|grass/);
assert.match(mediterraneanVariants.join(" "), /not an empty gravel field|not a blank gravel field|not a bare gravel field/);
assert.match(mediterraneanVariants.join(" "), /must not resemble the other mediterranean options|different from the other mediterranean options/);

const styleSpecificVariantExpectations = {
  japanese: [
    /moss groundcover|moss planting|moss areas/,
    /raked gravel|gravel field/,
    /stepping stone|stone path|stone crossing/,
    /stone lantern|stone basin|natural stone grouping/,
  ],
  tropical: [
    /hosta|fern|broad-leaf/,
    /shade border|layered foliage|deep foliage/,
    /curved shaded path|woodland path|natural stone path/,
    /shaded seating|leafy nook|fern-framed/,
  ],
  "english-garden": [
    /rose|foxglove|salvia|catmint/,
    /herbaceous border|flower border|perennial drift/,
    /pea gravel|brick-edged|winding path/,
    /garden bench|romantic seating|flower-framed/,
  ],
  minimalist: [
    /hydrangea|camellia|flower color/,
    /seasonal flower|flower band|color block/,
    /stepping stone|reshaped path|gravel path/,
    /flowering shrub|specimen shrub|garden marker/,
  ],
  desert: [
    /agave|succulent|yucca/,
    /decomposed granite|gravel mulch|dry wash/,
    /boulder|rock garden|stone outcrop/,
    /dry seating|desert pot|sculptural accent/,
  ],
};

for (const [styleId, expectedVariantPatterns] of Object.entries(styleSpecificVariantExpectations)) {
  const styleVariants = [0, 1, 2, 3].map((index) =>
    getLandscapeVariantInstruction(styleId, index).toLowerCase()
  );

  assert.equal(new Set(styleVariants).size, 4, `${styleId} should define four distinct style-specific variants`);
  assert.notDeepEqual(styleVariants, variantInstructions, `${styleId} should not reuse the generic fallback variants`);
  assert.notDeepEqual(styleVariants, cleanGardenVariants, `${styleId} should not reuse Clean Garden variants`);
  assert.notDeepEqual(styleVariants, mediterraneanVariants, `${styleId} should not reuse Mediterranean variants`);
  if (styleId !== "japanese" && styleId !== "tropical" && styleId !== "minimalist" && styleId !== "desert") {
    assert.match(styleVariants.join(" "), /different from the other|must not resemble the other|not the same as the other/);
  }
  assert.doesNotMatch(styleVariants.join(" "), /signature|watermark|logo|overlaid text|design option/);

  expectedVariantPatterns.forEach((pattern, index) => {
    assert.match(styleVariants[index], pattern, `${styleId} variant ${index + 1} should carry its own style language`);
  });
}
const routeSource = readFileSync(new URL("../app/api/landscape/generate/route.ts", import.meta.url), "utf8");
assert.match(routeSource, /getOrCreateGardenMask/);
assert.match(routeSource, /gardenMaskUrl/);
assert.match(routeSource, /buildLandscapePrompt\(/);
assert.match(routeSource, /const variantInstruction = getLandscapeVariantInstruction\(styleId,\s*variantIndex\)/);
assert.match(routeSource, /getLandscapeVariantSeed\([\s\S]*variantInstruction[\s\S]*\)/);
assert.match(routeSource, /maskUrl:\s*gardenMaskUrl/);
assert.match(routeSource, /prompt:\s*variantPrompt/);
assert.doesNotMatch(routeSource, /const prompt = buildLandscapePrompt\(styleId, customDescription, intensity\)/);

const brief = getLandscapeDesignBrief("desert");
assert.equal(brief.styleName, "Desert / Xeriscape");
assert.match(brief.plantSuggestions.join(" ").toLowerCase(), /succulent|native grass|agave/);
assert.match(brief.maintenanceLevel.toLowerCase(), /low/);

const result = buildLandscapeDesignResult({
  resultImageUrl: "https://example.com/result.png",
  originalImageUrl: "https://example.com/original.jpg",
  styleId: "modern",
  variantIndex: 2,
});
assert.equal(result.variantIndex, 2);
assert.equal(result.designBrief.styleName, "Clean Garden");
assert.match(result.designBrief.designFocus.toLowerCase(), /tidier|clean/);

const pondResult = buildLandscapeDesignResult({
  resultImageUrl: "https://example.com/result.png",
  originalImageUrl: "https://example.com/original.jpg",
  styleId: "modern",
  variantIndex: 0,
  customDescription: "在院子中间加一个水池",
});
assert.match(pondResult.designBrief.designFocus.toLowerCase(), /water feature|pond|reflecting pool/);
assert.match(pondResult.designBrief.materialSuggestions.join(" ").toLowerCase(), /pond|water feature|stone edging/);

console.log("landscape generation planning behavior passed");




