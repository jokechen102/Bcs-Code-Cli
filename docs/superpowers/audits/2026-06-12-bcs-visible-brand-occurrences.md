# BCS Visible Brand Occurrence Audit

## Scan

Date: 2026-06-12

Context: repo root `/Users/joke/Documents/repo/Bcs-Code-Cli/.worktrees/codex-bcs-branding`, branch `codex/bcs-branding`, initial audit commit `67957ea`.

```bash
rg -n --glob '!node_modules' --glob '!dist' --glob '!bun.lock' --glob '!*.map' "MiMo|Mimo|mimo|MIMOCODE|mimocode|OpenCode|opencode|OPENCODE|@mimo-ai" README.md docs packages/opencode/src packages/opencode/deploy/windows script
```

## Completed Replacements

| File | Original | Replacement | Commit |
| --- | --- | --- | --- |
| `README.md` | `MiMo Auto` | `BCS Auto` | `0b160be` |
| `README.md` | `Xiaomi MiMo Platform` | `BCS Model Platform` | `0b160be` |
| `README.md` | `MiMo ASR` | `BCS Voice` | `0b160be` |
| `README.md` | `MiMo logged-in users` | `BCS logged-in users` | `0b160be` |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx` | `MiMo` | `BCS` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` | `MiMo Auto（MiMo-V2.5 限免中）` | `BCS Auto` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `Please log in to MiMo first` | `Please log in to BCS first` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `MiMo Auto (free)` | `BCS Auto` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `MiMo browser login` | `BCS browser login` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `请先登录 MiMo 账号` | `请先登录 BCS 账号` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo Auto (free)` | `BCS Auto` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo 浏览器登录` | `BCS 浏览器登录` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo 登录` | `BCS 登录` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `e.g. mimorouter` | `e.g. bcs-router` | `44cbfaa` |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `e.g. MiMo Router` | `e.g. BCS Router` | `44cbfaa` |
| `packages/opencode/src/cli/error.ts` | `opencode does not support MCP authentication yet` | `BCS Code does not support MCP authentication yet` | this commit |
| `packages/opencode/src/cli/error.ts` | ``mimo models`` | ``bcs-code models`` | this commit |
| `packages/opencode/src/cli/cmd/mcp.ts` | default MCP source label `opencode` | `bcs-code` | this commit |
| `packages/opencode/src/cli/cmd/providers.ts` | `MiMo auth plugin not found` | `BCS auth plugin not found` | this commit |
| `packages/opencode/src/cli/cmd/providers.ts` | provider selection label `MiMo` | `BCS` | this commit |
| `packages/opencode/src/cli/cmd/providers.ts` | provider selection label `MiMo Auto (free)` | `BCS Auto` | this commit |
| `packages/opencode/src/cli/cmd/providers.ts` | `Provider: MiMo` | `Provider: BCS` | this commit |
| `packages/opencode/src/config/config.ts` | `Server configuration for mimo serve and web commands` | `Server configuration for BCS Code serve and web commands` | this commit |
| `packages/opencode/src/config/config.ts` | generated description `every mimocode agent` / `mimocode agents` | `every BCS Code agent` / `BCS Code agents` | this commit |
| `packages/opencode/src/cli/cmd/pr.ts` | ``mimo import`` runtime invocation | ``bcs-code import`` | `b525a28` |
| `packages/opencode/src/cli/cmd/pr.ts` | spawned CLI binary `mimo` | `bcs-code` | `b525a28` |
| `packages/opencode/src/cli/bootstrap.ts` | ``Headless `mimo run` `` | ``Headless `bcs-code run` `` | `b525a28` |

## Replace

No pending high-confidence non-TUI CLI display-label replacements remain after the Task 4 cleanup. Ambiguous or policy-dependent CLI/TUI surfaces remain in `Confirm`.

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
| `packages/opencode/src/cli/cmd/tui/context/theme.tsx` `mimocode` | Theme key and stored preference compatibility |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` `mimo-auto` | Provider/model ID compatibility; display label is BCS Auto |
| `packages/opencode/src/cli/cmd/tui/context/theme/*.json` `https://opencode.ai/theme.json` | Existing theme schema URL |
| `packages/opencode/src/cli/cmd/tui/thread.ts` `http://opencode.internal` | Internal worker transport sentinel URL |
| `packages/opencode/src/cli/cmd/tui/attach.ts` `opencode:` | Basic-auth username compatibility for attach transport |
| `packages/opencode/src/cli/cmd/tui/config/tui.ts` `@opencode/TuiConfig` | Effect service tag compatibility |
| `packages/opencode/src/cli/cmd/tui/config/tui-migrate.ts` `https://opencode.ai/tui.json` | Existing TUI schema URL |
| `packages/opencode/src/cli/cmd/tui/component/dialog-mimo-login.tsx` and `app.tsx` `DialogMimoLogin` / `MimoOAuthFlow` | Internal component/import names; visible login text is localized through BCS labels |
| `packages/opencode/src/cli/cmd/tui/util/voice.ts` `X-Mimo-Source` and `mimocode-cli` | Xiaomi provider API header compatibility |
| `packages/opencode/src/cli/cmd/tui/util/sound.ts` and `util/clipboard.ts` `opencode-*` temp names | Local temporary file/cache naming compatibility |
| `packages/opencode/src/cli/cmd/tui/component/error-component.tsx` `https://github.com/anomalyco/opencode` and `opencode-version` | Upstream bug-report URL/query compatibility |
| `packages/opencode/src/cli/cmd/tui/**` `opencode` provider, command, and state IDs | Compatibility IDs; visible labels were changed only where classified as Replace |
| `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts` `.mimocode` and `MIMOCODE_PURE` | Plugin path and flag compatibility |
| `packages/opencode/src/config/**` `.mimocode`, `mimocode.json`, `MIMOCODE_*`, `@opencode/Config`, MCP origin labels, and `https://opencode.ai/config.json` | Config discovery, env var, service tag, origin metadata, and schema compatibility; display-only config descriptions listed in Completed Replacements were changed |
| `packages/opencode/src/project/**` `.mimocode-project-id` and `MIMOCODE_*` | Project identity and flag compatibility |
| `packages/opencode/deploy/windows/**` `mimocode.json`, `MIMOCODE_DISABLE_MODELS_FETCH`, and `https://opencode.ai/config.json` | Windows package compatibility config |
| `script/**` `@mimo-ai/script`, `packages/opencode`, `OPENCODE_VERSION`, and release-note filenames | Package wiring, release tooling, and upstream automation |
| `docs/superpowers/**` old-brand terms | Planning/spec/audit text that describes the cleanup itself |
| `docs/build-release.md` XiaomiMiMo/MiMo-Code and compatibility references | Release runbook and upstream relationship clarity |
| `docs/upstream-sync.md` XiaomiMiMo/MiMo-Code | Upstream sync instructions |
| `packages/opencode/src/cli/cmd/github.ts` `/opencode`, `opencode-agent`, and `opencode.yml` | External GitHub automation compatibility |
| `packages/opencode/src/cli/cmd/github.ts` `https://api.opencode.ai` and `https://github.com/apps/opencode-agent` | External GitHub app/API compatibility |
| `packages/opencode/src/cli/cmd/github.ts` generated workflow text `name: opencode`, `Run opencode`, `anomalyco/opencode/github@latest`, `/opencode`, `/oc`, branch prefixes, OIDC audience, and infrastructure prompt text | External GitHub automation compatibility |
| `packages/opencode/src/cli/cmd/run.ts` `MIMOCODE_SERVER_USERNAME`, default `mimocode`, and `http://opencode.internal` | Local attach/auth compatibility and internal worker transport sentinel URL |
| `packages/opencode/src/cli/cmd/models.ts` `opencode` provider sort variables | Provider ID compatibility |
| `packages/opencode/src/cli/cmd/providers.ts` `MimoFree` import/class references and `mimo-free`/`xiaomi` provider IDs | Plugin/provider ID compatibility; visible labels were changed to BCS |
| `packages/opencode/src/cli/cmd/providers.ts` `.well-known/opencode`, `opencode` provider ID, `https://opencode.ai/auth`, and Cloudflare docs URL | External provider discovery, provider ID, and upstream docs compatibility |
| `packages/opencode/src/cli/cmd/providers.ts` `mimocode.json` setup guidance | Existing config file compatibility |
| `packages/opencode/src/cli/cmd/mcp.ts` `.mimocode`, `mimocode.json`, `mimocode-debug`, and existing config-file setup guidance | Config path/file and OAuth debug client compatibility |
| `packages/opencode/src/cli/cmd/agent.ts` `.mimocode` | Existing project config directory compatibility |
| `packages/opencode/src/cli/cmd/plug.ts` `mimocode` file-kind argument | Plugin config file compatibility |
| `packages/opencode/src/cli/cmd/uninstall.ts` `.mimocode`, `# mimocode`, and unpublished package-manager comments | Backward-compatible cleanup of legacy install paths and comments |
| `packages/opencode/src/cli/cmd/run-completion.ts` and `packages/opencode/src/cli/cmd/upgrade.ts` `packages/opencode` paths / `OPENCODE_VERSION` | Repository/package path and release tooling compatibility |
| `packages/opencode/src/tool/websearch/mimo.ts` `api.xiaomimimo.com` and platform URLs | Xiaomi-hosted web search provider endpoint |
| `packages/opencode/src/tool/**` `mimo-v2.5-pro` comments/examples | Provider behavior notes and model examples |

## Confirm

These need a local decision during implementation.

| File | Match | Decision |
| --- | --- | --- |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `OpenCode Zen` and `OpenCode Go` | Decide whether these hosted provider upsells are reachable in the BCS internal trial and should be rebranded or hidden |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `https://opencode.ai/zen` | Decide whether the BCS build should keep the upstream hosted billing link, replace it, or suppress the upsell |
| `packages/opencode/src/cli/cmd/tui/component/dialog-go-upsell.tsx` | `OpenCode Go` and `https://opencode.ai/go` | Decide whether this upsell appears in the internal trial TUI |
| `packages/opencode/src/cli/cmd/github.ts` | `shareBaseUrl`, `opencode-share`, and `[opencode session]` share comment generation | Decide whether GitHub share comments should keep upstream share URLs, be rebranded, or be disabled in the BCS internal trial |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `/share` copy mentioning `opencode.ai` | Decide whether public share links remain available in the internal trial |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | Docker tips using `ghcr.io/anomalyco/opencode` | Decide whether container tips should be BCS-specific, upstream-attributed, or removed from the internal trial UI |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | GitHub trigger tips using `/opencode` | Decide whether to keep upstream GitHub automation command text or introduce a BCS-specific trigger |
| `packages/opencode/src/cli/cmd/tui/i18n/{es,fr,ja,ru,zht}.ts` | Visible MiMo voice/login/free-channel strings including `MiMo Auto (free)`, `MiMo browser login`, and `MiMo account` equivalents | Decide whether non-primary locales are in scope for the same BCS display-label cleanup as `en` and `zh` |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `tui.command.opencode.status.title` | Key name should stay; confirm whether surrounding visible command/status text needs BCS wording |
| `packages/opencode/src/cli/cmd/tui/component/dialog-status.tsx` | `Needs authentication (run: opencode mcp auth {key})` | Visible command example; confirm whether BCS CLI command wording should replace upstream command text |
| `packages/opencode/src/cli/network.ts` | default mDNS service domain `mimocode.local` | Decide whether the BCS internal package should keep the existing network discovery domain or migrate to a BCS-specific default |
| `packages/opencode/src/config/config.ts` | upstream docs URLs under `opencode.ai/docs` in generated descriptions | Decide whether generated schema/help docs links should keep upstream documentation, point to internal docs, or be suppressed |

## Intentional Task 2 Scan Matches

The Task 2 verification scan can still match old-brand strings inside this audit because this file records originals and future cleanup candidates.

| File | Match | Reason |
| --- | --- | --- |
| `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md` | completed `Original` values | Historical record of replacements made in this task |
| `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md` | completed TUI `Original` values | Historical record of replacements made in `44cbfaa` |
| `docs/superpowers/plans/2026-06-12-bcs-visible-brand-cleanup.md` | historical task text and command examples | Planning/spec record outside the four-file docs-cleanup scope |
