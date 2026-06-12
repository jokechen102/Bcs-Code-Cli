# BCS Code Internal Trial Release

## Build current platform

Run from the repository root:

```bash
cd packages/opencode
OPENCODE_VERSION=0.1.0-bcs.1 ./script/build.ts --single
```

## Install locally from the built binary

On Apple Silicon macOS:

```bash
./install --binary packages/opencode/dist/bcs-code-darwin-arm64/bin/bcs-code
```

On Intel macOS:

```bash
./install --binary packages/opencode/dist/bcs-code-darwin-x64/bin/bcs-code
```

## Smoke test

```bash
bcs-code --version
bcs-code --help
```

Expected:

```text
0.1.0-bcs.1
```

The help output should use `bcs-code` as the command name and should show the BCS Code banner.

## Build Windows amd64 one-click package

Run from the repository root:

```bash
BCS_CODE_FULL_BASE_URL=http://100.89.126.33:8008/v1 \
BCS_CODE_MODEL=dsv4 \
BCS_CODE_SMALL_BASE_URL=http://100.115.100.130:30279/8a620da96ee846738ddc72414be2c712/v1 \
BCS_CODE_SMALL_MODEL=Qwen-3.6-27B \
OPENCODE_VERSION=0.1.0-bcs.2 \
  ./script/package-windows-internal.ts
```

The generated zip is written under `dist/internal/`. It bundles:

- `bcs-code.exe` for Windows x64
- WezTerm Windows zip
- `install-bcs-code.cmd`
- `install-bcs-code.ps1`
- `config/install-settings.json`

End users unzip the package and run `install-bcs-code.cmd`. The installer attempts to install a private embedded WezTerm under `%LOCALAPPDATA%\Programs\BCS Code\wezterm`, installs BCS Code, writes the default internal model config, disables public model-list fetching, updates the user PATH for `bcs-code`, and creates launch shortcuts. Existing user WezTerm installs and configs are not modified. If WezTerm installation fails, the installer warns and continues with a direct BCS Code console launcher.

The default config uses two OpenAI-compatible providers: `bcs-full/dsv4` for the main model and `bcs-lite/Qwen-3.6-27B` for the small model. If `BCS_CODE_SMALL_API_KEY` is omitted at package time, the Windows installer prompts once and stores it in the user's environment.

Do not distribute a package that still contains the placeholder `https://your-internal-llm-gateway.example.com/v1`. The installer blocks placeholder configs.

## Compatibility

The trial build keeps existing `.mimocode` project configuration and `MIMOCODE_HOME` profile isolation. This avoids data migration during early testing and keeps future upstream merges smaller.
