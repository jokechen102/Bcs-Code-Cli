# BCS Code Windows Internal Package

This folder contains the Windows one-click deployment resources used by
`script/package-windows-internal.ts`.

The generated package installs:

- WezTerm for the current Windows user from the bundled official Windows zip.
- `bcs-code.exe` under `%LOCALAPPDATA%\Programs\BCS Code\bin`.
- Global BCS Code provider config under `%USERPROFILE%\.config\mimocode\mimocode.json`.
- User environment variable `MIMOCODE_DISABLE_MODELS_FETCH=1`.
- Desktop and Start Menu launchers that open BCS Code inside WezTerm.

Build the package from the repository root:

```bash
BCS_CODE_BASE_URL=https://llm-gateway.example.com/v1 \
BCS_CODE_MODEL=qwen3-coder \
BCS_CODE_SMALL_MODEL=qwen3-coder-lite \
OPENCODE_VERSION=0.1.0-bcs.1 \
  ./script/package-windows-internal.ts
```

Optional package-time settings:

```bash
BCS_CODE_PROVIDER_ID=bcs-internal
BCS_CODE_PROVIDER_NAME="BCS Internal LLM"
BCS_CODE_MODEL_NAME="Qwen3 Coder"
BCS_CODE_SMALL_MODEL_NAME="Qwen3 Coder Lite"
BCS_CODE_CONTEXT_WINDOW=262144
BCS_CODE_OUTPUT_WINDOW=8192
BCS_CODE_API_KEY=...
```

Do not commit real API keys. Prefer gateway-side allowlists or distribute keys
through a separate internal channel.
