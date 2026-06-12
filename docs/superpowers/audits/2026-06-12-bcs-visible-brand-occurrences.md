# BCS Visible Brand Occurrence Audit

## Replace

These are user-visible surfaces to patch in this implementation.

| File | Match | Replacement | Reason |
| --- | --- | --- | --- |
| `README.md` | `MiMo Auto` | `BCS Auto` | Product-facing feature copy |
| `README.md` | `Xiaomi MiMo Platform` | `BCS Model Platform` | Product-facing provider option |
| `README.md` | `MiMo ASR` | `BCS Voice` | Product-facing feature copy |
| `README.md` | `MiMo logged-in users` | `BCS logged-in users` | Product-facing voice feature copy |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/sidebar/footer.tsx` | `MiMo` | `BCS` | TUI status display |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` | `MiMo Auto（MiMo-V2.5 限免中）` | `BCS Auto` | Model display label only |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `Please log in to MiMo first` | `Please log in to BCS first` | TUI voice auth error |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `MiMo Auto (free)` | `BCS Auto` | TUI free-channel display label |
| `packages/opencode/src/cli/cmd/tui/i18n/en.ts` | `MiMo browser login` | `BCS browser login` | TUI provider usage copy |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `请先登录 MiMo 账号` | `请先登录 BCS 账号` | TUI voice auth error |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo Auto (free)` | `BCS Auto` | TUI free-channel display label |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo 浏览器登录` | `BCS 浏览器登录` | TUI provider usage copy |
| `packages/opencode/src/cli/cmd/tui/i18n/zh.ts` | `MiMo 登录` | `BCS 登录` | TUI login dialog title |
| `packages/opencode/src/cli/cmd/tui/i18n/{fr,ja,ru}.ts` | `MiMo Auto (free)` | `BCS Auto` | Localized TUI free-channel display labels |

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
| `packages/opencode/src/cli/cmd/tui/context/theme/*.json` `https://opencode.ai/theme.json` | Existing theme schema URL |
| `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts` `.mimocode` and `MIMOCODE_PURE` | Plugin path and flag compatibility |
| `packages/opencode/src/config/**` `.mimocode`, `mimocode.json`, `MIMOCODE_*`, and `https://opencode.ai/config.json` | Config discovery, env var, and schema compatibility |
| `packages/opencode/src/project/**` `.mimocode-project-id` and `MIMOCODE_*` | Project identity and flag compatibility |
| `packages/opencode/deploy/windows/**` `mimocode.json`, `MIMOCODE_DISABLE_MODELS_FETCH`, and `https://opencode.ai/config.json` | Windows package compatibility config |
| `script/**` `@mimo-ai/script`, `packages/opencode`, `OPENCODE_VERSION`, and release-note filenames | Package wiring, release tooling, and upstream automation |
| `docs/superpowers/**` old-brand terms | Planning/spec/audit text that describes the cleanup itself |
| `docs/build-release.md` XiaomiMiMo/MiMo-Code and compatibility references | Release runbook and upstream relationship clarity |
| `docs/upstream-sync.md` XiaomiMiMo/MiMo-Code | Upstream sync instructions |
| `packages/opencode/src/cli/cmd/github.ts` `/opencode`, `opencode-agent`, and `opencode.yml` | External GitHub automation compatibility |
| `packages/opencode/src/cli/cmd/github.ts` `https://api.opencode.ai` and `https://opencode.ai` | External hosted service endpoints and share links |
| `packages/opencode/src/tool/websearch/mimo.ts` `api.xiaomimimo.com` and platform URLs | Xiaomi-hosted web search provider endpoint |
| `packages/opencode/src/tool/**` `mimo-v2.5-pro` comments/examples | Provider behavior notes and model examples |

## Confirm

These need a local decision during implementation.

| File | Match | Decision |
| --- | --- | --- |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `OpenCode Zen` and `OpenCode Go` | Decide whether these hosted provider upsells are reachable in the BCS internal trial and should be rebranded or hidden |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | `https://opencode.ai/zen` | Decide whether the BCS build should keep the upstream hosted billing link, replace it, or suppress the upsell |
| `packages/opencode/src/cli/cmd/tui/component/dialog-go-upsell.tsx` | `OpenCode Go` and `https://opencode.ai/go` | Decide whether this upsell appears in the internal trial TUI |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `/share` copy mentioning `opencode.ai` | Decide whether public share links remain available in the internal trial |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | Docker tips using `ghcr.io/anomalyco/opencode` | Decide whether container tips should be BCS-specific, upstream-attributed, or removed from the internal trial UI |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | GitHub trigger tips using `/opencode` | Decide whether to keep upstream GitHub automation command text or introduce a BCS-specific trigger |
| `packages/opencode/src/cli/cmd/tui/i18n/{es,fr,ja,ru,zht}.ts` | Voice/login strings that still mention `MiMo` | Decide whether non-primary locales are in scope for the same BCS display-label cleanup as `en` and `zh` |
| `packages/opencode/src/cli/cmd/tui/i18n/*` | `tui.command.opencode.status.title` | Key name should stay; confirm whether surrounding visible command/status text needs BCS wording |
