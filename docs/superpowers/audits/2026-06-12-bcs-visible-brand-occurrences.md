# BCS Visible Brand Occurrence Audit

## Scan

Date: 2026-06-12

Context: repo root `/Users/joke/Documents/repo/Bcs-Code-Cli/.worktrees/codex-bcs-branding`, branch `codex/bcs-branding`, initial audit commit `67957ea`.

```bash
rg -n --glob '!node_modules' --glob '!dist' --glob '!bun.lock' --glob '!*.map' "MiMo|Mimo|mimo|MIMOCODE|mimocode|OpenCode|opencode|OPENCODE|@mimo-ai" README.md docs packages/opencode/src packages/opencode/deploy/windows script
```

Task 6 final focused scan:

```bash
rg -n --glob '!node_modules' --glob '!dist' --glob '!bun.lock' --glob '!*.map' "MiMo|Mimo|mimo|MIMOCODE|mimocode|OpenCode|opencode|OPENCODE|@mimo-ai" README.md docs packages/opencode/src packages/opencode/deploy/windows script packages/console packages/app 2>/dev/null
```

Final result: remaining matches are classified in `Keep`, resolved `Confirm`, Task 5 console/app classification, or the historical audit/plan records.

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
| `packages/opencode/src/cli/cmd/tui/component/dialog-status.tsx` | `Needs authentication (run: opencode mcp auth {key})` | `Needs authentication (run: bcs-code mcp auth {key})` | this commit |
| `packages/opencode/src/cli/cmd/tui/i18n/es.ts` | `Inicia sesión en MiMo primero` | `Inicia sesión en BCS primero` | this commit |
| `packages/opencode/src/cli/cmd/tui/i18n/fr.ts` | visible MiMo voice/login/free-channel labels | BCS voice/login/free-channel labels | this commit |
| `packages/opencode/src/cli/cmd/tui/i18n/ja.ts` | visible MiMo voice/login/free-channel labels | BCS voice/login/free-channel labels | this commit |
| `packages/opencode/src/cli/cmd/tui/i18n/ru.ts` | visible MiMo voice/login/free-channel labels | BCS voice/login/free-channel labels | this commit |
| `packages/opencode/src/cli/cmd/tui/i18n/zht.ts` | `請先登入 MiMo 帳號` | `請先登入 BCS 帳號` | this commit |
| `packages/opencode/src/mcp/index.ts` | `Run: opencode mcp auth ${key}` | `Run: bcs-code mcp auth ${key}` | this commit |
| `packages/opencode/src/mcp/oauth-callback.ts` | OAuth callback page `OpenCode` title/body copy | `BCS Code` title/body copy | this commit |
| `packages/opencode/src/mcp/oauth-provider.ts` | OAuth client metadata name `OpenCode` | `BCS Code` | this commit |
| `packages/opencode/src/session/prompt/codex.txt` | agent identity `You are OpenCode` | `You are BCS Code` | this commit |
| `packages/opencode/src/acp/agent.ts` | ACP login/display labels `opencode` / `OpenCode` | `bcs-code` / `BCS Code` labels | this commit |
| `packages/opencode/src/plugin/codex.ts` | Codex auth callback page `OpenCode` title/body copy | `BCS Code` title/body copy | this commit |
| `packages/opencode/src/plugin/mimo-free.ts` | provider/model display names `MiMo Auto (free)` / `MiMo Auto` | `BCS Auto` | this commit |
| `packages/opencode/src/server/routes/**` | OpenAPI route descriptions using `OpenCode` | `BCS Code` | this commit |
| `packages/opencode/src/command/template/initialize.txt` | generated instruction template `OpenCode` display copy | `BCS Code` | this commit |
| `packages/opencode/src/config/managed.ts` | comment `OpenCode config` | `BCS Code config` | this commit |

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
| `packages/opencode/src/mcp/**` `@opencode/*`, `mimocode`, `opencode` command env handling, and `https://opencode.ai` metadata URI | Effect service tags, MCP client compatibility, command compatibility shims, and upstream OAuth client URI where no BCS URI exists; visible command/page/client-name strings are listed in Completed Replacements |
| `packages/opencode/src/acp/README.md` `OpenCode` examples/headings and `packages/opencode/src/acp/agent.ts` implementation comments | ACP protocol documentation and internal comments, not internal trial UI labels; runtime ACP labels are listed in Completed Replacements |
| `packages/opencode/src/cli/cmd/agent.ts` `.mimocode` | Existing project config directory compatibility |
| `packages/opencode/src/cli/cmd/plug.ts` `mimocode` file-kind argument | Plugin config file compatibility |
| `packages/opencode/src/cli/cmd/uninstall.ts` `.mimocode`, `# mimocode`, and unpublished package-manager comments | Backward-compatible cleanup of legacy install paths and comments |
| `packages/opencode/src/cli/cmd/run-completion.ts` and `packages/opencode/src/cli/cmd/upgrade.ts` `packages/opencode` paths / `OPENCODE_VERSION` | Repository/package path and release tooling compatibility |
| `packages/opencode/src/tool/websearch/mimo.ts` `api.xiaomimimo.com` and platform URLs | Xiaomi-hosted web search provider endpoint |
| `packages/opencode/src/tool/**` `mimo-v2.5-pro` comments/examples | Provider behavior notes and model examples |
| `packages/opencode/src/agent/prompt/**` `.mimocode`, `mimocode.db`, `MIMOCODE_DB`, `.opencode`, and historical product names inside memory prompts | Agent internal prompt instructions that describe existing storage, compatibility, and adjacent tool ecosystems rather than BCS product display labels |
| `packages/opencode/src/installation/**` `OPENCODE_*`, `.mimocode`, and commented upstream package-manager channel names | Build-time version globals, legacy install detection, and unpublished upstream channel notes; visible upgrade guidance is already BCS-branded |
| `packages/opencode/src/session/**`, `packages/opencode/src/project/**`, `packages/opencode/src/lsp/**`, and service tags using `@opencode/*` | Internal Effect service tags, comments, temp paths, and compatibility flags rather than user-facing product copy |

## Confirm

These were resolved during Task 6. Items kept here are intentional residuals because there is no BCS replacement service, they preserve upstream compatibility, or they are external hosted-service names rather than internal product branding.

| File | Match | Final decision |
| --- | --- | --- |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `OpenCode Zen` and `OpenCode Go` | Keep because these are upstream hosted paid-provider product names; changing or hiding them without a BCS billing/provider replacement would misdescribe the reachable service. |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `https://opencode.ai/zen` | Keep because this is the upstream hosted billing/key URL for the retained Zen/Go provider flow. |
| `packages/opencode/src/cli/cmd/tui/component/dialog-go-upsell.tsx` | `OpenCode Go` and `https://opencode.ai/go` | Keep because the upsell targets the upstream hosted Go product and has no BCS-hosted replacement URL. |
| `packages/opencode/src/cli/cmd/github.ts` | `shareBaseUrl`, `opencode-share`, and `[opencode session]` share comment generation | Keep because generated comments point to the upstream share-card service and image path; no internal share-card host is configured. |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `/share` copy mentioning `opencode.ai` | Keep because the command describes the existing public upstream share host. |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | Docker tips using `ghcr.io/anomalyco/opencode` | Keep because these tips reference the upstream container image; no BCS image replacement exists in this repo. |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | GitHub trigger tips using `/opencode` | Keep because `/opencode` is the existing upstream GitHub automation trigger and workflow compatibility surface. |
| `packages/opencode/src/cli/cmd/tui/i18n/{es,fr,ja,ru,zht}.ts` | Visible MiMo voice/login/free-channel strings including `MiMo Auto (free)`, `MiMo browser login`, and `MiMo account` equivalents | Replaced safe display labels with BCS wording; retained only provider/model IDs such as `mimo_free` and `mimo/mimo-auto`. |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `tui.command.opencode.status.title` | Keep because this is an i18n key/state identifier; visible status command labels were already BCS-branded where values required cleanup. |
| `packages/opencode/src/cli/cmd/tui/component/dialog-status.tsx` | `Needs authentication (run: opencode mcp auth {key})` | Replaced with `bcs-code mcp auth {key}` because it is a visible command example. |
| `packages/opencode/src/cli/network.ts` | default mDNS service domain `mimocode.local` | Keep because this is the existing discovery domain and changing it would create network compatibility risk without a migration. |
| `packages/opencode/src/config/config.ts` | upstream docs URLs under `opencode.ai/docs` in generated descriptions | Keep because these are upstream documentation links and no internal docs URL replacement is present. |

## Task 5 Console/Web/App Surface Classification

Task 5 scan:

```bash
rg -n "MiMo|Mimo|OpenCode|opencode" packages/console packages/app 2>/dev/null
```

Result before Task 5 app cleanup: 2,475 matches across hosted console website/legal/workspace pages, console mail templates, embedded app UI/i18n/test files, and compatibility identifiers.

The Windows internal package path was checked through `script/package-windows-internal.ts`, `packages/opencode/script/build.ts`, `packages/opencode/src/server/routes/ui.ts`, `docs/internal-trial-release.md`, and `packages/opencode/deploy/windows/**`. The Windows package builds `bcs-code.exe` with `packages/opencode/script/build.ts --target=windows-x64`; unless `--skip-embed-web-ui` is passed, that build embeds `../../app`, serves it from `packages/opencode/src/server/routes/ui.ts`, and makes it reachable through `bcs-code web`. Therefore `packages/app/**` is an embedded/reachable surface and is classified separately from hosted `packages/console/**`.

Task 5 app-specific scan:

```bash
rg -n "MiMo|Mimo|OpenCode|opencode" packages/app 2>/dev/null
```

Result after Task 5 app cleanup: 291 matches. Patched directly visible embedded app display text in `packages/app/index.html` and `packages/app/src/i18n/*.ts`: document title, app name, server/settings/update/error/getting-started copy, provider connect copy, and free-model dialog copy now use `BCS Code` instead of `OpenCode`. Remaining app matches are classified below as compatibility identifiers, hosted endpoints/assets, tests/fixtures, local docs, or internal names.

| Surface | Match | Decision |
| --- | --- | --- |
| `packages/console/app/src/routes/legal/**` | `OpenCode` | Hosted legal copy; out of scope unless exposed in internal trial |
| `packages/console/mail/**` | `OpenCode` | Hosted email templates; out of scope unless internal trial sends them |
| `packages/console/app/src/routes/temp.tsx` | `opencode.ai/install` | Hosted website route; out of scope unless opened by BCS Code |
| `packages/console/app/src/routes/{index,download,enterprise,brand,changelog,go,zen,black,workspace}/**` and `packages/console/app/src/i18n/**` | `OpenCode`, `opencode`, `MiMo` | Hosted website, billing, docs, and workspace console surfaces; no direct internal package reachability found |
| `packages/console/function/**` and `packages/console/core/**` | `opencode`, `OpenCode` | Hosted auth/email/billing/service metadata; no direct internal package reachability found |
| `packages/app/index.html` | `<title>OpenCode</title>` | Embedded web UI document title; replaced with `BCS Code` |
| `packages/app/src/i18n/*.ts` | visible `OpenCode` display copy | Embedded web UI text; replaced with `BCS Code` across locales |
| `packages/app/src/i18n/*.ts` | `opencode.json` | Existing config filename; keep |
| `packages/app/src/i18n/*.ts` and `packages/app/src/components/**` | `opencode` / `opencode-go` provider IDs and `provider.connect.opencodeZen.*` keys | Provider/key compatibility; visible values were rebranded where they contained `OpenCode` |
| `packages/app/src/pages/layout/deep-links.ts` and tests | `opencode://` | Existing deep-link scheme compatibility; keep |
| `packages/app/src/utils/persist.ts`, `packages/app/public/oc-theme-preload.js`, and tests | `opencode.*` storage keys | Existing local storage compatibility; keep |
| `packages/app/src/pages/error.tsx`, `packages/app/src/pages/layout.tsx`, `packages/app/src/components/dialog-connect-provider.tsx`, `packages/app/src/components/dialog-custom-provider.tsx`, `packages/app/src/components/settings-general.tsx`, `packages/app/src/context/highlights.tsx`, `packages/app/src/entry.tsx`, `packages/app/src/pages/layout/sidebar-items.tsx` | `opencode.ai` URLs/assets | Hosted endpoints/assets/docs/feedback links; keep unless BCS-hosted replacements exist |
| `packages/app/src/pages/layout/deep-links.ts` | `OpenCodeWindow` | Internal type name only; keep |
| `packages/app/**/*.test.ts*`, `packages/app/README.md`, `packages/app/AGENTS.md`, `packages/app/vite.js` | `opencode` | Tests, local docs, dev plugin names, and fixtures; keep |

## Intentional Task 2 Scan Matches

The Task 2 verification scan can still match old-brand strings inside this audit because this file records originals and future cleanup candidates.

| File | Match | Reason |
| --- | --- | --- |
| `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md` | completed `Original` values | Historical record of replacements made in this task |
| `docs/superpowers/audits/2026-06-12-bcs-visible-brand-occurrences.md` | completed TUI `Original` values | Historical record of replacements made in `44cbfaa` |
| `docs/superpowers/plans/2026-06-12-bcs-visible-brand-cleanup.md` | historical task text and command examples | Planning/spec record outside the four-file docs-cleanup scope |
