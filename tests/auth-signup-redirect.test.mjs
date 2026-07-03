import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/auth-signup.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { getSignUpRedirect } = await import(moduleUrl);

assert.deepEqual(getSignUpRedirect({ access_token: "token" }), {
  type: "success",
  path: "/dashboard",
  message: "Thanks for signing up!",
});

assert.deepEqual(getSignUpRedirect(null), {
  type: "success",
  path: "/sign-up",
  message: "Check your email to confirm your account before signing in.",
});

console.log("auth signup redirect behavior passed");
