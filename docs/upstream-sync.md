# Upstream Sync Runbook

## Branch roles

- `upstream/main`: read-only Xiaomi MiMoCode upstream.
- `origin/dev`: internal integration branch and default branch.
- `codex/bcs-branding`: short-lived implementation branch for BCS branding work.
- `release/bcs-code-v0.1.0-bcs.1`: immutable release branch for this internal trial package.

## First-time setup

```bash
git remote add upstream git@github.com:XiaomiMiMo/MiMo-Code.git
git fetch upstream --tags
git config rerere.enabled true
```

## Regular upstream refresh

```bash
git fetch upstream --tags
git switch dev
git merge --no-ff upstream/main
bun install
cd packages/opencode
bun typecheck
```

Resolve conflicts by preserving upstream behavior first, then reapplying only the small BCS branding/distribution layer. Avoid mass-renaming upstream internals.

## Rebase current branding work after upstream refresh

```bash
git switch codex/bcs-branding
git rebase dev
cd packages/opencode
bun test test/brand/brand.test.ts test/brand/cli-brand.test.ts
bun typecheck
OPENCODE_VERSION=0.1.0-bcs.1 ./script/build.ts --single
```

## Release branch

```bash
git switch -c release/bcs-code-v0.1.0-bcs.1
git tag bcs-code-v0.1.0-bcs.1
```

Do not tag internal BCS builds as plain `v0.1.0`; keep upstream-compatible version tags separate from internal release tags.
