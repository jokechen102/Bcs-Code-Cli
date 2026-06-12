# Fork Sync Notes

## Preferred path

Use GitHub's **Sync fork** button on the fork repository page to keep the fork's default branch aligned with XiaomiMiMo/MiMo-Code.

This is enough for normal upstream refresh work. The default branch may be `main` on GitHub even if local integration work also uses `dev`, so treat the branch shown in GitHub as the source of truth for the button flow.

## Local follow-up for BCS branding work

After GitHub finishes syncing the fork, refresh the local trial branch and replay the small BCS branding layer:

```bash
git fetch origin
git switch codex/bcs-branding
git rebase origin/main
```

If the fork default branch is changed to `dev`, use `origin/dev` in the rebase command instead.

Resolve conflicts by preserving upstream behavior first, then reapplying only the BCS branding and internal packaging changes. Avoid mass-renaming upstream internals.

## Verification after replay

```bash
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
