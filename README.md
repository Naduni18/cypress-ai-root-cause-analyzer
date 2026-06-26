# Cypress AI Root Cause Analyzer

This project demonstrates a Cypress automation framework for the ExpandTesting login page and an AI-powered root cause analyzer for failed test runs. The analyzer reads Cypress logs, screenshots, stack traces, console errors, and JUnit reports, then returns a concise failure diagnosis.

## What It Does

- Runs Cypress tests against `https://practice.expandtesting.com/login`
- Captures screenshots and videos for failed tests
- Generates JUnit XML test reports
- Collects browser console errors
- Uses AI to analyze failed GitHub Actions/Cypress artifacts
- Produces:
  - likely reason for failure
  - failure classification
  - whether it is likely a product bug or script issue
  - suggested fix
  - suggested owner

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── cypress-tests.yml
├── cypress/
│   ├── e2e/
│   │   └── login.cy.js
│   ├── fixtures/
│   └── support/
│       └── e2e.js
├── scripts/
│   └── analyze-failures.mjs
├── ai-analysis/
│   └── root-cause-analysis.json
├── cypress.config.js
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 20 or later
- npm
- GitHub repository
- OpenAI API key for AI failure analysis

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file for AI analysis:

```bash
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4.1
```

Do not commit `.env`.

## Cypress Test Target

Application URL:

```text
https://practice.expandtesting.com/login
```

Valid credentials:

```text
Username: practice
Password: SuperSecretPassword!
```

Expected successful login behavior:

- User is redirected to `/secure`
- Success message is visible
- Logout button is visible

## Run Tests Locally

Open Cypress runner:

```bash
npm run cy:open
```

Run tests in headless mode:

```bash
npm run cy:run
```

Capture terminal output to a log file:

```bash
npm run cy:run 2>&1 | tee cypress-run.log
```

On Windows PowerShell, use:

```powershell
npm run cy:run *>&1 | Tee-Object -FilePath cypress-run.log
```

## Run AI Failure Analysis Locally

After a failed Cypress run, execute:

```bash
npm run analyze:failures
```

The analyzer writes output to:

```text
ai-analysis/root-cause-analysis.json
```

Example output:

```json
{
  "likely_reason_for_failure": "The success login test expected /secure, but the application stayed on /login.",
  "classification": "script_issue",
  "confidence": 0.82,
  "evidence": [
    "JUnit report shows a path assertion failure.",
    "Screenshot shows the login page remained visible.",
    "Test credentials or assertion may be incorrect."
  ],
  "suggested_fix": "Verify credentials and update the test assertion or selectors if the page behavior changed.",
  "suggested_owner": "QA automation"
}
```

## GitHub Actions Setup

Add this repository secret:

```text
OPENAI_API_KEY
```

Path:

```text
GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

When Cypress fails in CI, the workflow runs the AI analyzer and uploads these artifacts:

- Cypress screenshots
- Cypress videos
- JUnit XML reports
- `cypress-run.log`
- AI root cause analysis JSON

## Failure Classification

The analyzer returns one of these classifications:

```text
product_bug
script_issue
environment_issue
test_data_issue
unknown
```

Use this classification as triage guidance, not as the final source of truth. A QA engineer or developer should confirm the finding before closing a defect.

## Useful npm Scripts

```json
{
  "cy:open": "cypress open",
  "cy:run": "cypress run",
  "analyze:failures": "node scripts/analyze-failures.mjs"
}
```

## Notes

- Keep screenshots, videos, reports, and AI analysis output out of Git.
- Store secrets only in `.env` locally or GitHub Actions secrets in CI.
- Review AI output before creating production defects.
- If screenshots include sensitive data, mask or avoid uploading them to external services.
