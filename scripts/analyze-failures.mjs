import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.AI_MODEL || "gpt-4.1";

const readIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
};

const truncate = (text, max = 25000) => {
  if (!text) return "";
  return text.length > max
    ? `${text.slice(0, max)}\n\n[TRUNCATED: original length ${text.length}]`
    : text;
};

const imageToDataUrl = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "image/png";

  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${base64}`;
};

const junitFiles = await glob("cypress/results/**/*.xml", {
  windowsPathsNoEscape: true
});

const screenshotFiles = await glob("cypress/screenshots/**/*.{png,jpg,jpeg,webp}", {
  windowsPathsNoEscape: true
});

const logText = readIfExists("cypress-run.log");

const junitText = junitFiles
  .map((file) => `\n\n--- ${file} ---\n${readIfExists(file)}`)
  .join("");

const screenshotInputs = screenshotFiles.slice(0, 5).map((file) => ({
  type: "input_image",
  image_url: imageToDataUrl(file)
}));

const prompt = `
You are an expert QA automation failure root cause analyzer.

Analyze the failed Cypress automation run.

Return:
1. likely_reason_for_failure
2. classification: one of ["product_bug", "script_issue", "environment_issue", "test_data_issue", "unknown"]
3. confidence: number from 0 to 1
4. evidence: short bullet points from logs/screenshots/stack traces
5. suggested_fix
6. suggested_owner: one of ["QA automation", "Frontend dev", "Backend dev", "DevOps", "Needs triage"]

Decision rules:
- Product bug: app behavior is wrong, page has server/client error, valid user flow broken.
- Script issue: selector changed, wrong expected text, timing problem, bad assertion, test implementation issue.
- Environment issue: network/DNS/browser/dependency/CI issue.
- Test data issue: missing user, expired credentials, unavailable seed data.
- Unknown: evidence is insufficient.

CYPRESS TERMINAL LOG:
${truncate(logText)}

JUNIT REPORTS:
${truncate(junitText)}
`;

const response = await client.responses.create({
  model: MODEL,
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: prompt
        },
        ...screenshotInputs
      ]
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "failure_root_cause_analysis",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          likely_reason_for_failure: { type: "string" },
          classification: {
            type: "string",
            enum: [
              "product_bug",
              "script_issue",
              "environment_issue",
              "test_data_issue",
              "unknown"
            ]
          },
          confidence: { type: "number" },
          evidence: {
            type: "array",
            items: { type: "string" }
          },
          suggested_fix: { type: "string" },
          suggested_owner: {
            type: "string",
            enum: [
              "QA automation",
              "Frontend dev",
              "Backend dev",
              "DevOps",
              "Needs triage"
            ]
          }
        },
        required: [
          "likely_reason_for_failure",
          "classification",
          "confidence",
          "evidence",
          "suggested_fix",
          "suggested_owner"
        ]
      }
    }
  }
});

const analysis = response.output_text;

fs.mkdirSync("ai-analysis", { recursive: true });
fs.writeFileSync("ai-analysis/root-cause-analysis.json", analysis);

console.log("\nAI Root Cause Analysis:");
console.log(analysis);