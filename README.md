# AeroCare

A browser-based prototype for organising flight preparation, medical-review documents and assistance requests before travel.

AeroCare helps passengers understand what to prepare, keep a fictional travel case together and follow a simulated airline review. It does not diagnose illness, determine fitness to fly or grant boarding permission.

## Implemented features

- Blank passenger and flight forms, including operating airline, route, departure time, flight number, fictional booking reference and optional seat.
- Autosaved drafts and separate saved cases in the same browser.
- A preparation dashboard with prioritised actions and responsibility labels.
- Source-linked example preparation rules for Air India and Emirates.
- Document receipts, explicit save confirmation and supported report-date checks.
- Browser-local previews for fictional PDF, PNG, JPEG and plain-text files up to 10 MB.
- A review-before-submission screen and explicit sharing permission.
- Simulated document-specific correction requests, replacement and explicit resubmission.
- Separate simulated medical-review and assistance statuses, with action buttons.
- Selective rechecks after journey changes, retaining existing document records.
- Timestamped case history and a previewable printable travel brief.

## Technology

Plain HTML, CSS and JavaScript. `localStorage` stores fictional case metadata and drafts; IndexedDB stores local fictional files for preview. There is no backend, external database server, airline API, authentication service or runtime AI model in this prototype.

## Run locally

No npm packages or build step are required to run the app.

With Python installed, run this command from the repository root:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000 in a modern browser. Alternatively, serve `dist/` with a static-server tool such as VS Code Live Server. Use localhost rather than opening the HTML as a file so browser storage works consistently.

Keep using the same browser and origin to recover your cases and local files. Clearing site data removes them.

## Demonstration

1. Start a new blank case and enter fictional passenger, flight and support details.
2. Enable sharing permission and save the journey.
3. Add fictional documents, enter any required report issue date and save document progress.
4. Review the preparation checklist and tick actions that have been completed.
5. Open Review & submit, inspect the summary and explicitly submit the case.
6. Switch to the airline demo. Use View document and request a correction for a specific document.
7. Return to Documents, replace the requested file and explicitly resubmit the case.
8. In the airline demo, update the simulated review and confirm assistance separately.
9. Review the case history and print or save the travel brief as PDF.

Old filename-only records need the fictional file attached again before preview becomes available. An initial incomplete case can be submitted for information review, but missing document checks block simulated review completion. No submission is sent to an actual airline.

## Source map

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Application shell, navigation, embedded CSS and document-preview dialog |
| `dist/style.css` | Canonical stylesheet, responsive layout and print styles |
| `dist/script.js` | Passenger/reviewer views, drafts, cases, checklist, corrections, submission and brief |
| `dist/rules.js` | Limited preparation rules and document-date checks |
| `dist/files.js` | Browser-local file validation and IndexedDB storage |
| `tests/workflow.test.cjs` | Targeted workflow and preview-rendering checks |
| `tests/files.test.cjs` | File-type and unavailable-storage checks |

The stylesheet is embedded in `index.html` for reliable rendering. If changing `style.css`, update the `aerocare-styles` block too, excluding the external font import. Current functionality runs from local assets with system-font fallbacks.

## Verification

Node.js is needed only for these development checks:

```sh
node --check dist/script.js
node --check dist/files.js
node --check dist/rules.js
node tests/workflow.test.cjs
node tests/files.test.cjs
```

Targeted checks cover selective resets, document retention, supported date rechecks, corrections and resubmission, reviewer safeguards, consent, draft persistence, preview rendering and file-type restrictions. Browser checks covered navigation, draft recovery, submission and reviewer requests. File selection and embedded PDF display still need a manual check on the demonstrator's browser because browser upload permission was declined during automated verification. The local tests are not evidence of clinical validation or a production security audit.

## Prototype boundaries

Use fictional information only. Medical content, authenticity, clinician signatures and booking details are not verified. Reviewer actions and assistance confirmations are simulated. Consent controls demo visibility rather than providing secure reviewer authentication. The application is unsuitable for real medical records.

The preparation rules are incomplete, stored examples, last reviewed on 5 November 2026. They are not a live airline-policy service. A date check passing is not medical clearance. Real requirements and travel acceptance must be determined by the operating airline and qualified clinicians.

## Reference guidance

- Air India: https://www.airindia.com/in/en/travel-information/health-medical-assistance/medical-needs-clearance.html
- Emirates: https://www.emirates.com/us/english/before-you-fly/health/medical-information-forms/
- National Kidney Foundation: https://www.kidney.org/kidney-topics/travel-tips-guide-kidney-patients

## AI assistance disclosure

ChatGPT assisted with brainstorming, implementation, styling, documentation and debugging. I am responsible for reviewing, testing and explaining the submitted work. The running prototype does not call an AI model.

## Future scope

Clinician-reviewed policy coverage, secure accounts, encrypted shared storage, authenticated reviewer access, consent auditing, document verification and formal airline integrations. No outcome or cost-saving claims have been measured by this prototype.
