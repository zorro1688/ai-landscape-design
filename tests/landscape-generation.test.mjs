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
assert.match(conservativePrompt, /conservative redesign intensity/);
assert.match(conservativePrompt, /keep existing layout/);

const balancedPrompt = buildLandscapePrompt("modern", undefined, "balanced").toLowerCase();
assert.match(balancedPrompt, /balanced redesign intensity/);
assert.match(balancedPrompt, /paths, planting beds, lawn, stones, water features, and daytime garden markers may change/);
assert.doesNotMatch(balancedPrompt, /garden lighting|garden lights/);
assert.match(balancedPrompt, /building must remain the same apparent size/);
assert.match(balancedPrompt, /do not make the building appear closer or farther away/);
assert.match(balancedPrompt, /treat the building and sky as locked background/);
assert.match(balancedPrompt, /preserve the original daylight/);
assert.match(balancedPrompt, /replace the original path material/);
assert.match(balancedPrompt, /add new style-specific plant varieties/);
assert.match(balancedPrompt, /benches|decorative planters|daytime garden markers/);

const creativePrompt = buildLandscapePrompt("modern", undefined, "creative").toLowerCase();
assert.match(creativePrompt, /creative redesign intensity/);
assert.match(creativePrompt, /do not add buildings/);
assert.match(creativePrompt, /paths may be redesigned or rerouted/);
assert.match(creativePrompt, /use a visibly different style-appropriate path material/);
assert.match(creativePrompt, /add new non-building landscape elements/);
assert.match(creativePrompt, /benches|daytime garden markers|stones|water features|decorative planters/);
assert.match(creativePrompt, /selected style signature must dominate/);
assert.match(creativePrompt, /do not produce a generic garden refresh/);
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

const { getLandscapeVariantInstruction } = loadTsModule("../lib/landscape-generation.ts", {
  "./landscape-styles": styles,
});
const variantInstructions = [0, 1, 2, 3].map((index) => getLandscapeVariantInstruction(index).toLowerCase());
assert.equal(new Set(variantInstructions).size, 4);
assert.match(variantInstructions.join(" "), /complete design brief/);
assert.match(variantInstructions.join(" "), /visibly different garden layout/);
assert.match(variantInstructions.join(" "), /must not resemble the other options/);
assert.match(variantInstructions.join(" "), /planting concept|planting-led redesign/);
assert.match(variantInstructions.join(" "), /central focal garden concept|central-focus redesign/);
assert.match(variantInstructions.join(" "), /flower color/);
assert.match(variantInstructions.join(" "), /rebuilt path and surface concept|path-led redesign/);
assert.match(variantInstructions.join(" "), /new circulation pattern|looping path|diagonal route/);
assert.doesNotMatch(variantInstructions.join(" "), /garden lighting|garden lights/);
assert.match(variantInstructions.join(" "), /daytime garden markers|non-building landscape elements/);
assert.match(variantInstructions.join(" "), /keep the building, sky, camera angle, exposure, and daylight unchanged/);
assert.match(variantInstructions.join(" "), /do not darken the image/);
assert.match(variantInstructions[0], /option 1 complete design brief/);
assert.match(variantInstructions[0], /new plant varieties|style-specific plants/);
assert.match(variantInstructions[0], /expanded border planting concept|expanded side borders/);
assert.match(variantInstructions[1], /option 2 complete design brief/);
assert.match(variantInstructions[1], /flower color|seasonal flower color/);
assert.match(variantInstructions[1], /central focal garden concept|central oval|circular bed|island planting feature/);
assert.match(variantInstructions[2], /option 3 complete design brief/);
assert.match(variantInstructions[2], /stepping-stone|gravel|path|clay pavers|raked gravel/);
assert.match(variantInstructions[2], /replace the original path material|visibly different style-appropriate surface/);
assert.match(variantInstructions[2], /looping path|diagonal route|stepping-stone route|new circulation pattern/);
assert.match(variantInstructions[3], /option 4 complete design brief/);
assert.match(variantInstructions[3], /bench|stone seat|daytime garden markers|water features|non-building landscape elements/);
assert.match(variantInstructions[3], /landscape feature nook concept|seating nook|feature-focused garden moment/);
assert.doesNotMatch(variantInstructions.join(" "), /keeping the primary path route visible|keep the primary path route visible/);

const routeSource = readFileSync(new URL("../app/api/landscape/generate/route.ts", import.meta.url), "utf8");
assert.match(routeSource, /getLandscapeVariantInstruction/);
assert.match(routeSource, /variantPrompt/);
assert.match(routeSource, /prompt:\s*variantPrompt/);
assert.doesNotMatch(routeSource, /\{ imageUrl, prompt, seed \}/);

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








