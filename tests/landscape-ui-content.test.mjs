import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

function loadTsModule(relativePath, requireMap = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
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

const uploadForm = readFileSync(new URL("../components/product/upload/landscape-upload-form.tsx", import.meta.url), "utf8");
const beforeAfter = readFileSync(new URL("../components/product/results/before-after-display.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const demoSource = readFileSync(new URL("../lib/landscape-demo-results.ts", import.meta.url), "utf8");
const styles = loadTsModule("../lib/landscape-styles.ts");
const generation = loadTsModule("../lib/landscape-generation.ts", {
  "./landscape-styles": styles,
});
const demo = loadTsModule("../lib/landscape-demo-results.ts", {
  "./landscape-generation": generation,
});

assert.match(uploadForm, /Redesign intensity/);
assert.match(uploadForm, /Conservative/);
assert.match(uploadForm, /Balanced/);
assert.match(uploadForm, /Creative/);
assert.doesNotMatch(uploadForm, /without adding buildings or replacing focal objects/);
assert.doesNotMatch(uploadForm, /without replacing focal objects/);
assert.match(uploadForm, /Add or replace landscape elements/);
assert.match(uploadForm, /Generating 4 design options/);
assert.match(uploadForm, /Generate \$\{generationPlan\.variantCount\} Designs/);
assert.match(uploadForm, /Sign in to generate 4 options per run/);
assert.match(uploadForm, /className="w-full h-full"/);
assert.match(uploadForm, /h-full overflow-y-auto/);

assert.match(beforeAfter, /compact\?: boolean/);
assert.match(beforeAfter, /isDemo\?: boolean/);
assert.match(beforeAfter, /Example result/);
assert.match(beforeAfter, /Option \{index \+ 1\}/);
assert.match(beforeAfter, /Download Selected Design/);
assert.match(beforeAfter, /Design brief/);
assert.match(beforeAfter, /Recommended plants/);
assert.match(beforeAfter, /Materials/);
assert.match(beforeAfter, /Maintenance/);
assert.match(beforeAfter, /h-full min-h-0 flex flex-col/);
assert.match(beforeAfter, /overflow-y-auto/);
assert.match(beforeAfter, /flex min-h-0 flex-1 flex-col gap-4/);
assert.match(beforeAfter, /flex-1 overflow-y-auto/);
assert.doesNotMatch(beforeAfter, /max-h-\[180px\]/);
assert.match(beforeAfter, /aspect-\[16\/9\]/);
assert.match(beforeAfter, /space-y-4/);
assert.match(beforeAfter, /grid gap-3 sm:grid-cols-2 xl:grid-cols-4/);
assert.doesNotMatch(beforeAfter, /xl:grid-cols-\[minmax\(0,1\.25fr\)_minmax\(260px,0\.75fr\)\]/);

assert.match(homePage, /LANDSCAPE_DEMO_RESULT/);
assert.match(homePage, /lg:grid-cols-\[minmax\(380px,0\.9fr\)_minmax\(540px,1\.1fr\)\]/);
assert.match(homePage, /lg:h-\[760px\]/);
assert.match(homePage, /pb-40/);
assert.match(homePage, /lg:pb-56/);
assert.match(homePage, /lg:items-stretch/);
assert.match(homePage, /<LandscapeUploadForm/);
assert.match(homePage, /<BeforeAfterDisplay/);
assert.match(homePage, /result=\{result \?\? LANDSCAPE_DEMO_RESULT\}/);
assert.match(homePage, /isDemo=\{!result\}/);
assert.doesNotMatch(homePage, /result \? \(\s*<BeforeAfterDisplay[\s\S]*:\s*\(\s*<LandscapeUploadForm/);

assert.equal(demo.LANDSCAPE_DEMO_DESIGNS.length, 4);
for (const design of demo.LANDSCAPE_DEMO_DESIGNS) {
  assert.equal(design.originalImageUrl, "/examples/clean-garden-before.jpg");
  assert.match(design.resultImageUrl, /^\/examples\/clean-garden-option-[1-4]\.jpg$/);
  assert.equal(design.styleId, "modern");
  assert.equal(design.designBrief.styleName, "Clean Garden");
}
assert.match(demoSource, /clean-garden-before\.jpg/);

for (const fileName of [
  "clean-garden-before.jpg",
  "clean-garden-option-1.jpg",
  "clean-garden-option-2.jpg",
  "clean-garden-option-3.jpg",
  "clean-garden-option-4.jpg",
]) {
  assert.equal(
    existsSync(new URL(`../public/examples/${fileName}`, import.meta.url)),
    true,
    `${fileName} should exist`
  );
}

console.log("landscape UI content passed");









