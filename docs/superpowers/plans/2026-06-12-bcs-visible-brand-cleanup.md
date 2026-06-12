# BCS Visible Brand Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace remaining user-visible MiMo/OpenCode branding with BCS branding while preserving compatibility identifiers, upstream attribution, package wiring, config paths, and legal/compliance text.

**Architecture:** Treat display text and persisted/internal identifiers as separate layers. First produce a focused occurrence inventory, then patch high-confidence user-visible surfaces, then re-scan and document intentional keeps. Avoid broad renames of package names, provider IDs, env vars, schema URLs, file paths, or test fixtures.

**Tech Stack:** TypeScript/TSX, Bun, Solid/TUI components, Markdown docs, PowerShell Windows installer scripts.

---

## File Structure

- Create: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`
  - Records Replace/Keep/Confirm classifications for remaining `MiMo`, `mimo`, `OpenCode`, `opencode`, `MIMOCODE`, and `@mimo-ai` matches.
- Modify: `README.md`
  - Rewrites product-facing feature descriptions to BCS-first language while preserving the upstream relationship, attribution, and legal sections.
- Modify: `docs/internal-trial-release.md`
  - Keeps Windows/package instructions BCS-first and consistent with the latest package version.
- Modify: `packages/opencode/deploy/windows/README.md`
  - Keeps bundled package README BCS-first.
- Modify: `packages/opencode/src/cli/**`
  - Replaces visible CLI/TUI labels, command descriptions, dialogs, status text, help text, and model display names.
- Modify: `packages/opencode/src/cli/cmd/tui/context/theme.tsx`
  - Keeps the existing `mimocode` theme key unless the change is display-only; do not migrate stored theme names.
- Modify: `packages/opencode/src/cli/cmd/tui/context/local.tsx`
  - Changes preserved model/provider IDs such as `mimo-auto` only at the display-label layer.
- Modify: `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx`
  - Replaces visible `MiMo` sidebar status text with `BCS`.

## Task 1: Build The Occurrence Inventory

**Files:**
- Create: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Run the focused occurrence scan**

Run from repo root:

```bash
rg -n --glob '!node_modules' --glob '!dist' --glob '!bun.lock' --glob '!*.map' "MiMo|Mimo|mimo|MIMOCODE|mimocode|OpenCode|opencode|OPENCODE|@mimo-ai" README.md docs packages/opencode/src packages/opencode/deploy/windows script
```

Expected: matches grouped across docs, CLI/TUI runtime, Windows package files, imports, tests, and compatibility IDs.

- [ ] **Step 2: Create the audit document**

Create `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md` with this structure:

```markdown
# BCS Visible Brand Occurrence Audit

## Replace

These are user-visible surfaces to patch in this implementation.

| File | Match | Replacement | Reason |
| --- | --- | --- | --- |
| `README.md` | `MiMo Auto` | `BCS Auto` | Product-facing feature copy |
| `README.md` | `MiMo ASR` | `BCS Voice` | Product-facing feature copy |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx` | `MiMo` | `BCS` | TUI status display |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` | `MiMo Auto（MiMo-V2.5 限免中）` | `BCS Auto` | Model display label only |

## Keep

These are compatibility, package wiring, tests, schemas, or attribution and must not be changed in this implementation.

| Pattern | Reason |
| --- | --- |
| `.mimocode` | Existing config path compatibility |
| `mimocode.json` | Existing config file compatibility |
| `MIMOCODE_*` | Existing environment variable compatibility |
| `@mimo-ai/*` | Workspace package/import identity |
| `mimo_free` | Provider ID compatibility |
| `mimo-auto` | Model/provider ID compatibility |
| `https://opencode.ai/config.json` | Existing schema URL |
| README upstream relationship section | Attribution and trademark clarity |

## Confirm

These need a local decision during implementation.

| File | Match | Decision |
| --- | --- | --- |
```

- [ ] **Step 3: Commit the audit**

```bash
git add docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md
git commit -m "docs: audit visible brand occurrences"
```

## Task 2: Clean Product-Facing README And Trial Docs

**Files:**
- Modify: `README.md`
- Modify: `docs/internal-trial-release.md`
- Modify: `packages/opencode/deploy/windows/README.md`
- Modify: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Patch README product-facing copy**

In `README.md`, make these display-text replacements outside the upstream relationship, legal, and attribution sections:

```text
MiMo Auto -> BCS Auto
Xiaomi MiMo Platform -> BCS Model Platform
MiMo ASR -> BCS Voice
MiMo logged-in users -> BCS logged-in users
MiMo name, logo, and trademarks -> keep unchanged in legal/trademark section
Xiaomi MiMoCode -> keep unchanged in relationship/attribution sections
OpenCode -> keep unchanged in relationship/attribution sections
```

Keep these lines conceptually intact:

```markdown
BCS Code is an internal trial distribution based on Xiaomi MiMoCode, which is itself built from OpenCode.
## Relationship to Xiaomi MiMoCode and OpenCode
Use of Xiaomi MiMo-hosted services is subject to ...
Use of the MiMo name, logo, and trademarks is subject to ...
```

- [ ] **Step 2: Patch trial/package docs only where product-facing**

In `docs/internal-trial-release.md` and `packages/opencode/deploy/windows/README.md`, keep compatibility path references such as `.mimocode`, `mimocode.json`, and `MIMOCODE_DISABLE_MODELS_FETCH`. Replace only product-facing labels if present:

```text
MiMo Auto -> BCS Auto
MiMo login -> BCS login
OpenCode command -> BCS Code command
```

- [ ] **Step 3: Update the audit document**

Move the README/doc entries that were replaced from `Replace` to a completed note:

```markdown
## Completed Replacements

| File | Original | Replacement | Commit |
| --- | --- | --- | --- |
| `README.md` | `MiMo Auto` | `BCS Auto` | pending |
```

- [ ] **Step 4: Verify docs scan for high-confidence copy**

Run:

```bash
rg -n "MiMo Auto|MiMo ASR|MiMo logged-in|Xiaomi MiMo Platform|OpenCode command" README.md docs packages/opencode/deploy/windows
```

Expected: no matches except intentional upstream attribution or legal/trademark text. Record intentional matches in the audit document.

- [ ] **Step 5: Commit docs cleanup**

```bash
git add README.md docs/internal-trial-release.md packages/opencode/deploy/windows/README.md docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md
git commit -m "docs: align visible trial branding with bcs"
```

## Task 3: Clean High-Confidence TUI Display Labels

**Files:**
- Modify: `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx`
- Modify: `packages/opencode/src/cli/cmd/tui/context/local.tsx`
- Modify: other `packages/opencode/src/cli/cmd/tui/**` files identified in the audit as Replace
- Modify: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Patch sidebar display text**

In `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx`, change only the visible label:

```tsx
<span style={{ fg: theme().success }}>•</span> <b>BCS</b>
```

Do not change provider IDs, data model keys, imports, or package names in this file.

- [ ] **Step 2: Patch model display label**

In `packages/opencode/src/cli/cmd/tui/context/local.tsx`, keep the stored `value.modelID === "mimo-auto"` condition and change only the display name:

```tsx
model: value.modelID === "mimo-auto" ? "BCS Auto" : (info?.name ?? value.modelID),
```

- [ ] **Step 3: Patch dialog/status/help copy identified as Replace**

For each audit row under `packages/opencode/src/cli/cmd/tui/**` classified as Replace, apply display-only substitutions:

```text
MiMo login -> BCS login
MiMo account -> BCS account
MiMo Auto -> BCS Auto
MiMo Platform -> BCS Model Platform
OpenCode Go -> BCS Code
opencode session -> BCS Code session
```

Before changing each occurrence, confirm it is rendered text or a user-facing URL/label. Do not change import paths, command IDs, provider IDs, env var names, schema URLs, or test fixtures.

- [ ] **Step 4: Run focused TUI scan**

Run:

```bash
rg -n "MiMo|Mimo|OpenCode|opencode" packages/opencode/src/cli/cmd/tui
```

Expected: remaining matches are imports, compatibility IDs, theme keys, command IDs, schema URLs, comments about compatibility, or rows documented in the audit `Keep`/`Confirm` sections.

- [ ] **Step 5: Update audit with remaining TUI keeps**

Add any remaining intentional TUI matches to `Keep`, for example:

```markdown
| `packages/opencode/src/cli/cmd/tui/context/theme.tsx` | `mimocode` | Theme key and stored preference compatibility |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` | `mimo-auto` | Provider/model ID compatibility; display label is BCS Auto |
```

- [ ] **Step 6: Commit TUI cleanup**

```bash
git add packages/opencode/src/cli/cmd/tui docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md
git commit -m "fix: align tui visible branding with bcs"
```

## Task 4: Clean CLI Help, Commands, And Runtime Text

**Files:**
- Modify: `packages/opencode/src/cli/**` files identified in the audit as Replace
- Modify: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Patch CLI help and command descriptions**

For rows under `packages/opencode/src/cli/**` outside `cmd/tui` classified as Replace, use these substitutions:

```text
OpenCode -> BCS Code
opencode -> bcs-code
MiMo -> BCS
MiMo Auto -> BCS Auto
MiMo login -> BCS login
```

Do not change GitHub workflow names, external app identifiers, provider IDs, env var names, package imports, or hardcoded URLs unless the audit marks them as user-facing and reachable by the BCS internal package.

- [ ] **Step 2: Leave GitHub/OpenCode automation identifiers alone unless explicitly in the package UI**

Classify these likely keeps in the audit:

```markdown
| `packages/opencode/src/cli/cmd/github.ts` | `/opencode`, `opencode-agent`, `opencode.yml` | External GitHub automation compatibility |
| `packages/opencode/src/cli/cmd/github.ts` | `https://api.opencode.ai` | External hosted service endpoint |
```

- [ ] **Step 3: Run focused CLI scan**

Run:

```bash
rg -n "MiMo|Mimo|OpenCode|opencode" packages/opencode/src/cli
```

Expected: remaining matches are either documented keeps or confirm items needing user decision.

- [ ] **Step 4: Commit CLI cleanup**

```bash
git add packages/opencode/src/cli docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md
git commit -m "fix: align cli visible branding with bcs"
```

## Task 5: Review Console/Web Surfaces For Internal Trial Reachability

**Files:**
- Modify: `packages/console/**` only if a surface is reachable from the BCS internal package
- Modify: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Scan console routes and mail templates**

Run:

```bash
rg -n "MiMo|Mimo|OpenCode|opencode" packages/console packages/app 2>/dev/null
```

Expected: many OpenCode website/legal/console matches.

- [ ] **Step 2: Classify console surfaces conservatively**

Use this rule in the audit:

```markdown
| `packages/console/app/src/routes/legal/**` | `OpenCode` | Hosted legal copy; out of scope unless exposed in internal trial |
| `packages/console/mail/**` | `OpenCode` | Hosted email templates; out of scope unless internal trial sends them |
| `packages/console/app/src/routes/temp.tsx` | `opencode.ai/install` | Hosted website route; out of scope unless opened by BCS Code |
```

- [ ] **Step 3: Patch only reachable surfaces**

If the audit finds a console/app string directly opened by the packaged CLI or shown inside BCS Code, patch display text with:

```text
OpenCode -> BCS Code
opencode -> bcs-code
MiMo -> BCS
```

If no reachable surface is found, do not modify `packages/console/**`.

- [ ] **Step 4: Commit console classification or cleanup**

```bash
git add docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md packages/console packages/app
git commit -m "docs: classify console brand surfaces"
```

If no code files changed, commit only the audit document.

## Task 6: Final Residual Scan And Verification

**Files:**
- Modify: `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md`

- [ ] **Step 1: Run final focused scan**

Run:

```bash
rg -n --glob '!node_modules' --glob '!dist' --glob '!bun.lock' --glob '!*.map' "MiMo|Mimo|mimo|MIMOCODE|mimocode|OpenCode|opencode|OPENCODE|@mimo-ai" README.md docs packages/opencode/src packages/opencode/deploy/windows script packages/console packages/app 2>/dev/null
```

Expected: remaining matches are documented in `Keep` or `Confirm`.

- [ ] **Step 2: Resolve Confirm items**

For each `Confirm` row:

```markdown
| File | Match | Final decision |
| --- | --- | --- |
| `path/to/file.tsx` | `example` | Keep because it is a stored ID |
```

If a Confirm item is genuinely user-visible and not a compatibility/legal surface, patch it and move it to `Completed Replacements`.

- [ ] **Step 3: Run package typecheck**

Run from `packages/opencode`:

```bash
bun typecheck
```

Expected: command exits 0 with `tsgo --noEmit`.

- [ ] **Step 4: Build Windows internal package**

Run from repo root:

```bash
BCS_CODE_FULL_BASE_URL=http://100.89.126.33:8008/v1 \
BCS_CODE_MODEL=dsv4 \
BCS_CODE_SMALL_BASE_URL=http://100.115.100.130:30279/8a620da96ee846738ddc72414be2c712/v1 \
BCS_CODE_SMALL_MODEL=Qwen-3.6-27B \
OPENCODE_VERSION=0.1.0-bcs.5 \
  ./script/package-windows-internal.ts
```

Expected: a zip under `dist/internal/bcs-code-windows-amd64-0.1.0-bcs.5.zip`.

- [ ] **Step 5: Inspect bundled package text**

Run:

```bash
unzip -p dist/internal/bcs-code-windows-amd64-0.1.0-bcs.5.zip bcs-code-windows-amd64-0.1.0-bcs.5/README.md | rg -n "MiMo Auto|MiMo ASR|OpenCode command|Xiaomi MiMo Platform" || true
unzip -p dist/internal/bcs-code-windows-amd64-0.1.0-bcs.5.zip bcs-code-windows-amd64-0.1.0-bcs.5/install-bcs-code.ps1 | rg -n "MiMo|OpenCode" || true
```

Expected: no matches unless documented as intentional attribution or compatibility.

- [ ] **Step 6: Commit final audit and package docs**

```bash
git add docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md README.md docs/internal-trial-release.md packages/opencode/deploy/windows/README.md
git commit -m "docs: record remaining intentional brand identifiers"
```

If all modified files were already committed in prior tasks, skip this commit and note that there were no remaining audit/doc changes.

## Task 7: Push Implementation Branch

**Files:**
- No file modifications expected.

- [ ] **Step 1: Check branch status**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/bcs-branding`; working tree is clean or only generated package artifacts under ignored `dist`.

- [ ] **Step 2: Push branch**

Run:

```bash
git push origin codex/bcs-branding
```

Expected: push succeeds. If the repo pre-push hook runs typecheck, it should exit 0.
