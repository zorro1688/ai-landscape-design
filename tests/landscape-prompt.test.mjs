import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/landscape-styles.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { LANDSCAPE_STYLES, buildLandscapePrompt } = await import(moduleUrl);

const japanesePrompt = buildLandscapePrompt("japanese").toLowerCase();
const modernPrompt = buildLandscapePrompt("modern").toLowerCase();
const minimalistPrompt = buildLandscapePrompt("minimalist").toLowerCase();
const mediterraneanPrompt = buildLandscapePrompt("mediterranean", undefined, "creative").toLowerCase();
const englishPrompt = buildLandscapePrompt("english-garden", undefined, "creative").toLowerCase();

for (const prompt of [mediterraneanPrompt, englishPrompt, japanesePrompt, modernPrompt, minimalistPrompt]) {
  assert.ok(prompt.startsWith("hard boundary rule"), "mask-based prompt should start with the no-new-structures boundary rule");
  assert.match(prompt, /private residential garden/);
  assert.match(prompt, /no other structures of any kind/);
  assert.doesNotMatch(prompt, /signature|watermark|logo|overlaid text|design option/);
  assert.match(prompt, /redesign intensity/);
  assert.doesNotMatch(prompt, /critical edit boundary/);
  assert.doesNotMatch(prompt, /copy the architecture, sky, lighting, and camera geometry/);
  assert.doesNotMatch(prompt, /building must remain the same apparent size/);
  assert.doesNotMatch(prompt, /treat the building and sky as locked background/);
  assert.doesNotMatch(prompt, /garden lighting|garden lights|low garden lighting|ornamental garden lights/);
}

assert.match(mediterraneanPrompt, /warm gravel|stone-and-herb/);
assert.match(mediterraneanPrompt, /planting islands|terracotta pot grouping|stone paving pattern|focal feature/);
assert.match(mediterraneanPrompt, /avoid repeated circular planting islands|avoid repetitive round islands|distinct composition types/);
assert.match(mediterraneanPrompt, /not an empty gravel field|not a blank gravel field|not a bare gravel field/);
assert.doesNotMatch(mediterraneanPrompt, /lawn|turf|green|grass/);
assert.match(mediterraneanPrompt, /limestone chips|terracotta-toned compacted earth|clay paver edging/);
assert.match(mediterraneanPrompt, /lavender bands|rosemary bands|olive focal planting/);
assert.match(mediterraneanPrompt, /mediterranean garden-only redesign/);
assert.match(mediterraneanPrompt, /olive trees, lavender, terracotta pots, warm gravel, and stone herb planting/);
assert.match(mediterraneanPrompt, /sun-warmed|aromatic|drought-tolerant|gravel-and-stone|stone-and-herb/);

assert.match(englishPrompt, /dense layered herbaceous borders|romantic layered borders/);
assert.match(englishPrompt, /pale pea gravel|brick-edged paths/);
assert.match(englishPrompt, /roses|foxglove|salvia|catmint/);
assert.match(englishPrompt, /garden-only english ground-plane redesign/);
assert.match(englishPrompt, /romantic|informal|flower-heavy/);

const stylesById = Object.fromEntries(LANDSCAPE_STYLES.map((style) => [style.id, style]));
const styleFragments = Object.fromEntries(
  LANDSCAPE_STYLES.map((style) => [style.id, style.promptFragment.toLowerCase()])
);
const styleAnchors = Object.fromEntries(
  LANDSCAPE_STYLES.map((style) => [style.id, style.styleAnchor.toLowerCase()])
);

for (const style of LANDSCAPE_STYLES) {
  assert.equal(typeof style.styleAnchor, "string");
  assert.ok(style.styleAnchor.length > 20, `${style.id} should have a strong repeated style anchor`);
  const fragment = style.promptFragment.toLowerCase();
  assert.doesNotMatch(fragment, /resort|villa|estate|courtyard|house|building|temple|pavilion|roof|terracotta tones/);
  assert.doesNotMatch(fragment, /same focal lamp|visible primary path route|primary path route/);
}

assert.equal(stylesById.modern.label, "Clean Garden");
assert.match(styleFragments.modern, /orderly refined garden layout/);
assert.match(styleFragments.modern, /refreshed plant palette/);
assert.match(styleFragments.modern, /redesigned path layout|redesigned garden path/);
assert.match(styleFragments.modern, /clean light gravel|stone fines|crisp edging/);
assert.match(styleFragments.modern, /daytime garden markers|stone seat/);
assert.match(styleFragments.modern, /flowering shrub groups/);
assert.match(styleAnchors.modern, /clipped evergreen shrubs|clean light gravel/);

assert.match(styleFragments.mediterranean, /garden-only mediterranean|mediterranean garden-only/);
assert.match(styleFragments.mediterranean, /limestone chips|terracotta-toned compacted earth|clay paver edging/);
assert.match(styleAnchors.mediterranean, /olive trees|lavender|terracotta pots|warm gravel|stone herb planting/);
assert.doesNotMatch(styleFragments.mediterranean, /low garden lighting|warm low garden lighting|villa|facade|house|building|roof|dusk|evening/);

assert.equal(stylesById.minimalist.label, "Flowering Garden Refresh");
assert.match(styleFragments.minimalist, /bright seasonal flowers/);
assert.match(styleFragments.minimalist, /expanded layered flowering shrubs/);
assert.match(styleFragments.minimalist, /curved fine-gravel|stepping-stone path/);
assert.match(styleFragments.minimalist, /colorful, fresh, floral/);
assert.match(styleAnchors.minimalist, /hydrangea|camellia|flower color blocks/);
assert.doesNotMatch(
  styleFragments.minimalist,
  /flowering garden redesign|layout language|garden markers/,
  "Flowering Garden style prompt should not resemble a case-study heading or annotated presentation"
);

assert.match(styleFragments["english-garden"], /garden-only english ground-plane redesign/);
assert.match(styleFragments["english-garden"], /garden-only views/);
assert.match(styleFragments["english-garden"], /brick-edged|pale pea gravel|herbaceous border/);
assert.match(styleAnchors["english-garden"], /roses|herbaceous borders|flower-heavy/);
assert.doesNotMatch(styleFragments["english-garden"], /facade|house|cottage|building|roof|dusk|evening/);

assert.match(styleFragments.desert, /gravel-mulch fields|decomposed-granite paths/);
assert.match(styleFragments.desert, /gravel mulch|decomposed granite|agave|succulent/);
assert.match(styleAnchors.desert, /agave|succulent rosettes|gravel mulch/);
assert.doesNotMatch(styleFragments.desert, /courtyard|wall|patio|villa|estate/);
assert.doesNotMatch(
  styleFragments.desert,
  /create a low-water dry garden layout|layout language|garden markers/,
  "Desert style prompt should use direct scene language rather than presentation language"
);

const japanese = stylesById.japanese;
const japaneseStyle = japanese.promptFragment.toLowerCase();
assert.equal(japanese.label, "Moss & Stone Garden");
assert.match(japaneseStyle, /moss groundcover|moss carpet/);
assert.doesNotMatch(japaneseStyle, /transformative|moss and stone garden redesign|garden redesign|design title|stone lantern-style garden ornament/);
assert.match(japaneseStyle, /raked gravel/);
assert.match(japaneseStyle, /stone stepping paths|raked gravel paths/);
assert.match(japaneseStyle, /stone lantern form|natural stone groupings/);
assert.match(styleAnchors.japanese, /moss groundcover|raked gravel|natural stone groupings/);
assert.doesNotMatch(japaneseStyle, /garden light|lighting|glowing/);

const tropical = stylesById.tropical;
const tropicalStyle = tropical.promptFragment.toLowerCase();
assert.equal(tropical.label, "Shade Planting Borders");
assert.match(tropicalStyle, /broad-leaf planting|hosta|ferns/);
assert.match(tropicalStyle, /curved shaded path|natural stone path/);
assert.match(styleAnchors.tropical, /hosta|ferns|shade borders/);
assert.doesNotMatch(tropicalStyle, /garden lighting|garden lights|border lights|glowing/);
assert.doesNotMatch(
  tropicalStyle,
  /shade planting border redesign|cool layered shade garden layout|layout language/,
  "Shade Planting style prompt should not resemble a case-study title or caption"
);

const waterFeaturePrompt = buildLandscapePrompt("modern", "在院子中间加一个水池", "creative").toLowerCase();
assert.match(waterFeaturePrompt, /priority user request/);
assert.match(waterFeaturePrompt, /birdbath|fountain basin|stone water bowl/);
assert.match(waterFeaturePrompt, /center of the yard|middle of the yard/);
assert.ok(
  waterFeaturePrompt.indexOf("priority user request") < waterFeaturePrompt.indexOf("redesign intensity"),
  "user request should be placed before intensity so it remains visible"
);

const variantPrompt = buildLandscapePrompt(
  "japanese",
  "在院子中间加一个水池",
  "creative",
  "Create a diagonal stepping-stone route."
).toLowerCase();
assert.doesNotMatch(variantPrompt, /design option|signature|watermark|logo|overlaid text/);
assert.match(variantPrompt, /diagonal stepping-stone route/);
assert.ok(variantPrompt.indexOf("moss groundcover") < variantPrompt.indexOf("create a diagonal stepping-stone route"));
assert.ok(variantPrompt.indexOf("create a diagonal stepping-stone route") < variantPrompt.indexOf("priority user request"));
assert.ok(variantPrompt.lastIndexOf("hard boundary rule") > variantPrompt.indexOf("redesign intensity"));

console.log("landscape prompt mask-based behavior passed");
