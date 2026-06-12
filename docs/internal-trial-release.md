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
BCS_CODE_BASE_URL=https://llm-gateway.example.com/v1 \
BCS_CODE_MODEL=qwen3-coder \
BCS_CODE_SMALL_MODEL=qwen3-coder-lite \
OPENCODE_VERSION=0.1.0-bcs.1 \
  ./script/package-windows-internal.ts
```

The generated zip is written under `dist/internal/`. It bundles:

- `bcs-code.exe` for Windows x64
- WezTerm Windows zip
- `install-bcs-code.cmd`
- `install-bcs-code.ps1`
- `config/install-settings.json`

End users unzip the package and run `install-bcs-code.cmd`. The installer installs WezTerm first, installs BCS Code, writes the default internal model config, disables public model-list fetching, updates the user PATH, and creates launch shortcuts.

Do not distribute a package that still contains the placeholder `https://your-internal-llm-gateway.example.com/v1`. The installer blocks placeholder configs.

## Compatibility

The trial build keeps existing `.mimocode` project configuration and `MIMOCODE_HOME` profile isolation. This avoids data migration during early testing and keeps future upstream merges smaller.
