import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadTsModule(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "module", compiled)(module.exports, module);
  return module.exports;
}

const { generateLandscapeDesign, downloadImageBuffer } = loadTsModule("../lib/replicate.ts");

process.env.REPLICATE_API_TOKEN = "test-token";
process.env.REPLICATE_RETRY_DELAY_MS = "1";

function createTimeoutError() {
  const error = new TypeError("fetch failed");
  error.cause = { code: "UND_ERR_CONNECT_TIMEOUT" };
  return error;
}

const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const warnings = [];

try {
  console.warn = (...args) => warnings.push(args.join(" "));

  let createCalls = 0;
  globalThis.fetch = async (url, init) => {
    createCalls += 1;
    assert.match(String(url), /\/models\/black-forest-labs\/flux-kontext-pro\/predictions/);
    assert.equal(init?.method, "POST");

    if (createCalls === 1) {
      throw createTimeoutError();
    }

    return new Response(
      JSON.stringify({
        id: "prediction-1",
        status: "succeeded",
        output: "https://example.com/result.png",
        error: null,
      }),
      { status: 201, headers: { "content-type": "application/json" } }
    );
  };

  const result = await generateLandscapeDesign({
    imageUrl: "https://example.com/source.jpg",
    prompt: "test prompt",
    seed: 123,
  });

  assert.equal(result, "https://example.com/result.png");
  assert.equal(createCalls, 2, "create prediction should retry once after a connect timeout");

  let downloadCalls = 0;
  globalThis.fetch = async () => {
    downloadCalls += 1;
    if (downloadCalls === 1) {
      throw createTimeoutError();
    }
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "content-type": "image/png" },
    });
  };

  const downloaded = await downloadImageBuffer("https://example.com/result.png");
  assert.equal(downloaded.contentType, "image/png");
  assert.deepEqual([...downloaded.buffer], [1, 2, 3]);
  assert.equal(downloadCalls, 2, "generated image download should retry once after a connect timeout");
  assert.equal(warnings.length, 2);
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
  delete process.env.REPLICATE_API_TOKEN;
  delete process.env.REPLICATE_RETRY_DELAY_MS;
}

console.log("replicate retry behavior passed");
