# Meeting Action Tracker™

**Product SemVer:** 1.0.0  
**Public-package SemVer (planned):** 1.0.1

Meeting Action Tracker turns meeting notes into explicit actions with stable IDs, owners, due dates, completion state, deterministic overdue state, and local CSV generation.

## What this is
A lightweight public-safe accountability method implemented as a dependency-free browser application.

## What this is not
It is not an AI agent, CRM, email sender, calendar writer, task-system integration, or autonomous assignment system. It does not use real customer data in its included fixtures.

## Run
Open `index.html` in a modern browser, or run `python -m http.server` in this folder and open the local URL.

## Data and network
Actions are persisted in browser `localStorage`. The product executable code contains no network-request mechanism. Export is generated locally as CSV.

## Measured evidence
Producer tests pass for create/edit/complete/reopen business logic, owner/due-date validation, deterministic overdue boundaries, stable identity, deterministic sorting, CSV generation/escaping, invalid-input handling, security/privacy/no-network checks, and static accessibility/readability checks. Final-size public proof assets were also rendered and inspected. Human live-browser review remains a separate required gate before public behavioral claims are finalized.

## UBuildOS value
This build demonstrates the UBuildOS workflow discipline around a small product: preserve a locked scope, bind a deterministic requirement/test/evidence trail, repair discovered claim defects without hiding predecessor evidence, and keep Fresh IQA, owner acceptance, and publication as separate gates.

See `START_HERE.md`, `docs/`, `proof/`, and `tests/` for the evidence surface.

## LinkedIn document / PP-08
The candidate includes the required pre-IQA LinkedIn carousel/document at `marketing/LINKEDIN_CAROUSEL.pdf`, with editable source at `marketing/LINKEDIN_CAROUSEL.md`. The later post copy, verified public URL, and CTA remain downstream publication-gate work and are not claimed complete here.
