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

for (const prompt of [mediterraneanPrompt, englishPrompt]) {
  assert.ok(prompt.startsWith("critical edit boundary"), "hard preservation rules must lead the prompt before style text");
  assert.match(prompt, /copy the architecture, sky, lighting, and camera geometry from the input image/);
  assert.match(prompt, /do not apply whole-image style transfer/);
  assert.match(prompt, /edit only the ground-level garden plane/);
  assert.match(prompt, /redesign at least 60% of the editable ground-level garden area/);
  assert.match(prompt, /do not repeat the source layout/);
  assert.match(prompt, /building must align with the before image/);
}

assert.match(mediterraneanPrompt, /remove most plain lawn|reduce plain lawn/);
assert.match(mediterraneanPrompt, /limestone chips|terracotta-toned compacted earth|clay paver edging/);
assert.match(mediterraneanPrompt, /lavender bands|rosemary bands|olive focal planting/);
assert.match(mediterraneanPrompt, /style signature - mediterranean/);
assert.match(mediterraneanPrompt, /sun-warmed|aromatic|drought-tolerant|stone-and-herb/);

assert.match(englishPrompt, /dense layered herbaceous borders|romantic layered borders/);
assert.match(englishPrompt, /pale pea gravel|brick-edged paths/);
assert.match(englishPrompt, /roses|foxglove|salvia|catmint/);
assert.match(englishPrompt, /style signature - garden-only english/);
assert.match(englishPrompt, /romantic|informal|flower-heavy/);

for (const prompt of [japanesePrompt, modernPrompt, minimalistPrompt]) {
  assert.match(prompt, /preserve .*buildings/);
  assert.match(prompt, /building.*same apparent size|same apparent size.*building/);
  assert.match(prompt, /same position in the frame|do not move the building/);
  assert.match(prompt, /do not make the building appear closer or farther away/);
  assert.match(prompt, /visually overlap the original building|building must align with the before image/);
  assert.match(prompt, /preserve the original daylight|same brightness and color temperature/);
  assert.match(prompt, /do not darken the image|do not change the time of day/);
  assert.match(prompt, /garden paths.*may be redesigned|paths may be redesigned|redesign garden paths/);
  assert.match(prompt, /replace the original path material|change the path material/);
  assert.match(prompt, /do not keep the original path material unchanged/);
  assert.doesNotMatch(prompt, /garden lighting|garden lights|low garden lighting|ornamental garden lights/);
  assert.match(prompt, /daytime garden markers|daytime-visible ornaments|non-lighting garden markers/);
  assert.match(prompt, /do not add .*buildings/);
  assert.match(prompt, /only redesign the landscape layer/);
  assert.match(prompt, /treat the building and sky as locked background/);
  assert.match(prompt, /do not create dusk, evening, night, cinematic mood, dramatic shadows/);
  assert.match(prompt, /artificial lighting atmosphere/);
  assert.doesNotMatch(prompt, /keep the primary path route visible/);
  assert.doesNotMatch(prompt, /do not remove or replace existing focal objects/);
  assert.doesNotMatch(prompt, /preserve .*lamps/);
}

for (const style of LANDSCAPE_STYLES) {
  const fragment = style.promptFragment.toLowerCase();
  assert.doesNotMatch(fragment, /cottage|resort|villa|estate|courtyard|house|building|temple|pavilion|roof|terracotta tones/);
  assert.doesNotMatch(fragment, /same focal lamp|visible primary path route|primary path route/);
}

for (const prompt of [japanesePrompt, modernPrompt, minimalistPrompt]) {
  assert.match(prompt, /do not turn this garden path photo into .*courtyard/);
  assert.match(prompt, /residential property/);
  assert.match(prompt, /villa/);
  assert.match(prompt, /estate/);
  assert.match(prompt, /resort/);
  assert.match(prompt, /architectural scene/);
}

const stylesById = Object.fromEntries(LANDSCAPE_STYLES.map((style) => [style.id, style]));
const styleFragments = Object.fromEntries(
  LANDSCAPE_STYLES.map((style) => [style.id, style.promptFragment.toLowerCase()])
);

assert.equal(stylesById.modern.label, "Clean Garden");
assert.doesNotMatch(styleFragments.modern, /modern|minimalist|geometric|hardscape|paving|contemporary|architectural|concrete|wall|courtyard|corridor|side yard|alley|building passage/);
assert.match(styleFragments.modern, /refreshed plant palette/);
assert.match(styleFragments.modern, /redesigned path layout|redesigned garden path/);
assert.match(styleFragments.modern, /clean light gravel|stone fines|crisp edging/);
assert.doesNotMatch(styleFragments.modern, /garden lighting|garden lights|low garden lighting|glowing/);
assert.match(styleFragments.modern, /daytime garden markers|stone seat/);
assert.match(styleFragments.modern, /flowering shrub groups/);
assert.match(styleFragments.modern, /seasonal flower color/);
assert.match(styleFragments.modern, /style signature - clean garden/);
assert.match(styleFragments.modern, /orderly refined garden layout|crisp clipped shrubs|organized planting blocks/);

const mediterraneanStyle = styleFragments.mediterranean;
assert.match(mediterraneanStyle, /garden-only mediterranean|mediterranean garden-only/);
assert.match(mediterraneanStyle, /limestone chips|terracotta-toned compacted earth|clay paver edging/);
assert.doesNotMatch(mediterraneanStyle, /low garden lighting|warm low garden lighting|villa|facade|house|building|roof|dusk|evening/);

assert.equal(stylesById.minimalist.label, "Flowering Garden Refresh");
assert.doesNotMatch(styleFragments.minimalist, /modern|minimalist|low-maintenance|low maintenance|negative space|neutral material palette|concrete|wall|courtyard|architectural|corridor|side yard|alley|building passage/);
assert.match(styleFragments.minimalist, /expanded layered flowering shrubs/);
assert.match(styleFragments.minimalist, /reshaped path layout|redesigned path layout/);
assert.doesNotMatch(styleFragments.minimalist, /garden lighting|garden lights|low garden lighting|glowing/);
assert.match(styleFragments.minimalist, /daytime garden markers|natural edging/);
assert.match(styleFragments.minimalist, /flowering shrubs|flowering shrub/);
assert.match(styleFragments.minimalist, /style signature - flowering garden refresh/);
assert.match(styleFragments.minimalist, /flowering garden redesign/);
assert.match(styleFragments.minimalist, /layered flowering shrubs/);
assert.match(styleFragments.minimalist, /style signature - flowering garden refresh/);
assert.match(styleFragments.minimalist, /bright seasonal flowering layout|colorful, fresh, floral/);
assert.doesNotMatch(styleFragments.minimalist, /fewer but natural planting beds|hardy evergreen shrubs|tidy mulch/);

assert.doesNotMatch(styleFragments["english-garden"], /facade|house|cottage|building/);
assert.match(styleFragments["english-garden"], /garden-only views/);
assert.match(styleFragments["english-garden"], /garden-only english|english garden-only/);
assert.match(styleFragments["english-garden"], /brick-edged|pale pea gravel|herbaceous border/);
assert.doesNotMatch(styleFragments["english-garden"], /facade|house|cottage|building|roof|dusk|evening/);

assert.doesNotMatch(styleFragments.desert, /courtyard|wall|patio|villa|estate/);
assert.match(styleFragments.desert, /reworked bed outlines/);
assert.match(styleFragments.desert, /decomposed granite path layout|redesigned gravel path/);
assert.match(styleFragments.desert, /gravel mulch|decomposed granite/);

for (const prompt of [modernPrompt, minimalistPrompt, japanesePrompt]) {
  assert.match(prompt, /do not create tall blank walls/);
  assert.match(prompt, /do not create a narrow passage between buildings/);
  assert.match(prompt, /keep the scene as an outdoor garden path/);
  assert.match(prompt, /do not reinterpret the scene as a side yard, alley, corridor, courtyard, building passage, or narrow walled garden/);
  assert.match(prompt, /keep the original open planted garden character/);
  assert.match(prompt, /increase visible plant variety/);
  assert.match(prompt, /if the source image has no visible building facade, do not introduce any building facade, windows, roofline, or brick wall/);
  assert.match(prompt, /building footprint, roofline, facade, windows, doors, visible wall edges.*must stay fixed/);
  assert.match(prompt, /do not replace flowering shrubs or colored blossoms with plain green hedges or plain lawn/);
  assert.match(prompt, /do not erase all walkable circulation/);
  assert.match(prompt, /gravel, brick, stepping stone, decomposed granite, natural stone, or compacted earth walking surface/);
}

const japanese = stylesById.japanese;
const japaneseStyle = japanese.promptFragment.toLowerCase();
assert.equal(japanese.label, "Moss & Stone Garden");
assert.doesNotMatch(japaneseStyle, /japanese|house|building|temple|pavilion|roof|teahouse|gazebo|torii/);
assert.match(japaneseStyle, /transformative moss and stone garden redesign/);
assert.match(japaneseStyle, /raked gravel/);
assert.match(japaneseStyle, /stone stepping paths|raked gravel paths/);
assert.match(japaneseStyle, /replace the original path surface|raked gravel path surface/);
assert.match(japaneseStyle, /stone lantern-style garden ornament|natural stone groupings/);
assert.match(japaneseStyle, /style signature - moss & stone garden/);
assert.match(japaneseStyle, /asymmetrical moss-and-stone|raked gravel fields|quiet, mineral, mossy/);
assert.doesNotMatch(japaneseStyle, /garden light|lighting|glowing/);

const tropical = stylesById.tropical;
const tropicalStyle = tropical.promptFragment.toLowerCase();
assert.equal(tropical.label, "Shade Planting Borders");
assert.doesNotMatch(tropicalStyle, /tropical|resort|villa|house|building|patio|courtyard|wall|roof/);
assert.match(tropicalStyle, /shade planting border redesign/);
assert.match(tropicalStyle, /broad-leaf planting/);
assert.match(tropicalStyle, /curved shaded path layout|redesigned shaded path/);
assert.doesNotMatch(tropicalStyle, /garden lighting|garden lights|border lights|glowing/);
assert.match(tropicalStyle, /daytime garden markers|stone edging|daytime-visible border markers/);
assert.match(tropicalStyle, /style signature - shade planting borders/);
assert.match(tropicalStyle, /cool layered shade garden layout|lush, leafy/);
assert.doesNotMatch(tropicalStyle, /lawn path|grass path/);

const waterFeaturePrompt = buildLandscapePrompt("modern", "在院子中间加一个水池", "creative").toLowerCase();
assert.match(waterFeaturePrompt, /priority user request/);
assert.match(waterFeaturePrompt, /small garden pond|reflecting pool|water feature/);
assert.match(waterFeaturePrompt, /center of the yard|middle of the yard/);
assert.match(waterFeaturePrompt, /non-building landscape feature|non-building landscape elements/);
assert.ok(
  waterFeaturePrompt.indexOf("priority user request") < waterFeaturePrompt.indexOf("preserve the same camera angle"),
  "user request should be placed before preservation rules so the model does not ignore it"
);

const creativeLandscapePrompt = buildLandscapePrompt("japanese", "在院子中间加一个水池", "creative").toLowerCase();
assert.match(creativeLandscapePrompt, /noticeable .*redesign/);
assert.match(creativeLandscapePrompt, /replace and reshape planting beds|reshape planting beds/);
assert.match(creativeLandscapePrompt, /new plant palette|distinct plant palette/);
assert.match(creativeLandscapePrompt, /change flower colors|seasonal flower color/);
assert.match(creativeLandscapePrompt, /paths may be redesigned|redesigned or rerouted/);
assert.doesNotMatch(creativeLandscapePrompt, /garden lights may be replaced|garden lighting/);
assert.match(creativeLandscapePrompt, /daytime garden markers|non-lighting garden markers/);
assert.doesNotMatch(creativeLandscapePrompt, /keep the primary path route visible/);
assert.doesNotMatch(creativeLandscapePrompt, /keep existing layout, path alignment/);

assert.match(styleFragments.japanese, /style signature - moss & stone garden/);
assert.match(styleFragments.modern, /style signature - clean garden/);
assert.match(styleFragments.minimalist, /style signature - flowering garden refresh/);
assert.match(mediterraneanPrompt, /follow the option-specific complete design brief appended after this base prompt/);
console.log("landscape prompt preservation behavior passed");













