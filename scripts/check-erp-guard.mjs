// Run: node --experimental-strip-types scripts/check-erp-guard.mjs
// Checks the ERP bearer guard and the email attachment rules. Tokens and files here are made up.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";

// The app's imports omit ".ts" ("./auth"), which the bundler resolves and plain Node does not.
registerHooks({
  resolve(specifier, context, next) {
    const bare = /^\.\.?\//.test(specifier) && !/\.\w+$/.test(specifier);
    return next(bare ? `${specifier}.ts` : specifier, context);
  },
});
const { isErp } = await import("../src/lib/admin-guard.ts");
const { parseAttachments } = await import("../src/lib/erp-mail.ts");

const req = (authorization) => ({ headers: new Headers(authorization ? { authorization } : {}) });
const TOKEN = "qa-erp-token-0123456789abcdefghijklmnop";

delete process.env.ERP_API_TOKEN;
assert.equal(isErp(req("Bearer ")), false, "no ERP_API_TOKEN refuses an empty bearer");
assert.equal(isErp(req(`Bearer ${TOKEN}`)), false, "no ERP_API_TOKEN refuses any bearer");

process.env.ERP_API_TOKEN = TOKEN.slice(0, 31);
assert.equal(isErp(req(`Bearer ${TOKEN.slice(0, 31)}`)), false, "a 31-character token refuses");

process.env.ERP_API_TOKEN = TOKEN;
assert.equal(isErp(req()), false, "no Authorization header refuses");
assert.equal(isErp(req(`Bearer ${TOKEN}x`)), false, "wrong bearer refuses");
assert.equal(isErp(req(TOKEN)), false, "token without the Bearer scheme refuses");
assert.equal(isErp(req(`Bearer ${TOKEN}`)), true, "right bearer passes");

const pdf = (n = 64) => Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(n)]).toString("base64");
const zip = Buffer.from("PK\x03\x04qa-not-a-pdf").toString("base64");
const refuses = (raw, why) => assert.throws(() => parseAttachments(raw), Error, why);

assert.deepEqual(parseAttachments(undefined), [], "no attachments is an empty list");
refuses([{ filename: "Offer.pdf", contentBase64: zip }], "a .pdf name with ZIP bytes refuses");
refuses([{ filename: "Offer.exe", contentBase64: pdf() }], "a non-.pdf name refuses");
refuses([1, 2, 3].map((i) => ({ filename: `QA-${i}.pdf`, contentBase64: pdf() })), "three files refuse");
refuses([1, 2].map((i) => ({ filename: `QA-${i}.pdf`, contentBase64: pdf(3 * 1024 * 1024) })), "6 MB in total refuses");
refuses("Offer.pdf", "a non-list refuses");
refuses([{ filename: "Offer.pdf" }], "missing content refuses");

const [one, ...rest] = parseAttachments([{ filename: "QA Offer (v1).pdf", contentBase64: pdf() }]);
assert.equal(rest.length, 0);
assert.equal(one.filename, "QA_Offer_v1_.pdf", "filename reduced to [\\w.-]");
assert.equal(one.content.subarray(0, 5).toString(), "%PDF-", "one small PDF passes with its bytes");

// Scope: the bearer opens the applicant routes only, and never DELETE.
const src = (p) => readFileSync(new URL(`../src/app/api/admin/${p}`, import.meta.url), "utf8");
const applicants = src("applicants/route.ts");
const del = applicants.slice(applicants.indexOf("export async function DELETE"));
assert.match(del.slice(0, del.indexOf("\n}\n")), /if \(!isAdmin\(req\)\) \{/, "DELETE checks isAdmin");
assert.doesNotMatch(del, /isErp/, "DELETE never accepts the ERP bearer");
assert.equal(applicants.match(/!isAdmin\(req\) && !isErp\(req\)/g)?.length, 3, "GET, PATCH and POST accept the ERP bearer");
for (const p of ["resume/[id]/route.ts", "emails/route.ts"]) {
  assert.match(src(p), /!isAdmin\(req\) && !isErp\(req\)/, `${p} accepts the ERP bearer`);
}
for (const p of ["login/route.ts", "questions/route.ts", "roles/route.ts", "settings/route.ts"]) {
  assert.doesNotMatch(src(p), /isErp/, `${p} stays admin only`);
}

console.log("check-erp-guard: all checks passed");
