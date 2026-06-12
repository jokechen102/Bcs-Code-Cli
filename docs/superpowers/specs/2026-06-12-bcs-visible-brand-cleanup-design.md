# BCS Visible Brand Cleanup Design

## Goal

Make the internal trial build feel like a BCS product in all normal user-facing flows while preserving upstream compatibility and attribution. Runtime UI, CLI help, installer copy, shortcuts, and feature descriptions should present BCS branding. Compatibility identifiers, package names, config paths, schema URLs, tests, and legal/upstream attribution should remain stable unless they are only used as a display label.

## Chosen Scope

Use the "aggressive visible cleanup with attribution preserved" approach.

Replace user-visible MiMo/OpenCode branding in:

- CLI and TUI labels, command descriptions, status text, dialogs, prompts, model labels, and error messages.
- Windows internal package text, launcher text, install logs, shortcut names, README text bundled into the package, and internal trial docs.
- README feature descriptions and product-facing copy, except the explicit upstream relationship and attribution sections.
- Web or console surfaces only when they are reachable by the internal trial user or bundled into the BCS Code experience.

Preserve these compatibility and compliance surfaces:

- `.mimocode`, `mimocode.json`, `MIMOCODE_*`, and existing config discovery behavior.
- `@mimo-ai/*` workspace package names, imports, SDK package names, and internal module paths.
- Provider/model IDs such as `mimo_free` and `mimo-auto`, unless a separate display name is available.
- Theme file names, schema URLs, fixture names, tests, and comments that describe compatibility behavior.
- LICENSE, NOTICE, upstream links, and the README section that states BCS Code is based on Xiaomi MiMoCode and OpenCode.

## Brand Vocabulary

Use these display names consistently:

- Product name: `BCS Code`
- Command name: `bcs-code`
- Internal automatic model/channel display: `BCS Auto`
- Internal model platform display: `BCS Model Platform`
- Voice/ASR display: `BCS Voice`
- User-facing account/login display: `BCS account` or `BCS login`

Do not rename compatibility IDs to match the display text. For example, a provider ID can remain `mimo-auto` while its label is shown as `BCS Auto`.

## Audit Strategy

The audit should classify each `MiMo`, `mimo`, `OpenCode`, `opencode`, `MIMOCODE`, and `@mimo-ai` occurrence into one of three buckets:

- Replace: user-facing text that appears in normal product, install, or documentation flows.
- Keep: compatibility, package identity, schema, env var, config path, test fixture, attribution, or legal text.
- Confirm: ambiguous surface where the same string might be both an internal identifier and display copy.

The implementation should prioritize files likely to affect the internal trial package:

- `packages/opencode/src/cli`
- `packages/opencode/src/cli/cmd/tui`
- `packages/opencode/deploy/windows`
- `docs/internal-trial-release.md`
- `README.md`
- Any app/console surfaces that the packaged CLI can open or display.

Large console website/legal pages can be left unchanged unless they are bundled into the CLI experience or shown to internal trial users.

## Implementation Shape

Prefer small, visible-text changes over broad renames.

Where a display string repeats in multiple runtime places, route it through the existing brand constants or add a small label helper close to the current branding module. Avoid broad package renames, directory renames, env var renames, or migration of config paths.

Recommended sequence:

1. Build an occurrence inventory grouped by file and bucket.
2. Patch the high-confidence Replace bucket first.
3. Add display labels for preserved IDs where needed, for example mapping `mimo-auto` to `BCS Auto`.
4. Update README/internal docs so product-facing text is BCS-first while attribution stays explicit.
5. Re-scan and document any remaining visible MiMo/OpenCode occurrences as intentional keeps or follow-up questions.

## Error Handling And Migration

No data migration is required. Existing users keep the same config paths and environment variables.

If a visible string is backed by a provider ID or config key, change only the label shown to the user. Do not change stored config keys, provider IDs, file names, or environment variables unless a separate compatibility plan is approved.

## Verification

Recommended verification after implementation:

- Run a focused text scan for `MiMo`, `mimo`, `OpenCode`, `opencode`, `MIMOCODE`, and `@mimo-ai`.
- Review remaining matches and classify them as Keep or Confirm.
- Run `bun typecheck` from `packages/opencode`.
- Build the Windows internal package and inspect bundled README/install script/version text.
- Smoke-check CLI help and the TUI startup path if the environment supports it.

## Risks

The main risk is accidentally changing identifiers that are part of compatibility with existing configs, tests, or upstream package wiring. The mitigation is to treat UI display labels and persisted identifiers as separate layers.

Another risk is leaving OpenCode legal or hosted-service copy in console/web pages that are not part of the internal package. The implementation should avoid broad legal rewrites in this pass and focus on internal trial user-visible paths.

## Out Of Scope

- Renaming workspace packages from `@mimo-ai/*`.
- Migrating `.mimocode` or `MIMOCODE_*`.
- Rebranding LICENSE, NOTICE, or upstream attribution.
- Rewriting unrelated OpenCode hosted-service legal pages unless they are part of the internal BCS Code user journey.
- Changing provider/model IDs unless only their display label changes.
