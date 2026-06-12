# BCS Code Windows Internal Package

This folder contains the Windows one-click deployment resources used by
`script/package-windows-internal.ts`.

The generated package installs:

- A private embedded WezTerm under `%LOCALAPPDATA%\Programs\BCS Code\wezterm`
  from the bundled official Windows zip. Existing user WezTerm installs and
  configs are not modified. If WezTerm installation fails, the installer warns
  and continues with a direct BCS Code console launcher.
- `bcs-code.exe` under `%LOCALAPPDATA%\Programs\BCS Code\bin`.
- Global BCS Code provider config under `%USERPROFILE%\.config\mimocode\mimocode.json`.
- User environment variable `MIMOCODE_DISABLE_MODELS_FETCH=1`.
- Desktop and Start Menu launchers that open BCS Code inside WezTerm when
  available, force WezTerm software rendering for VDI/cloud desktops, and fall
  back to a direct console launcher if WezTerm still fails to start.

Build the package from the repository root:

```bash
BCS_CODE_FULL_BASE_URL=http://100.89.126.33:8008/v1 \
BCS_CODE_MODEL=dsv4 \
BCS_CODE_SMALL_BASE_URL=http://100.115.100.130:30279/8a620da96ee846738ddc72414be2c712/v1 \
BCS_CODE_SMALL_MODEL=Qwen-3.6-27B \
OPENCODE_VERSION=0.1.0-bcs.4 \
  ./script/package-windows-internal.ts
```

Optional package-time settings:

```bash
BCS_CODE_FULL_PROVIDER_ID=bcs-full
BCS_CODE_FULL_PROVIDER_NAME="BCS Full Model"
BCS_CODE_SMALL_PROVIDER_ID=bcs-lite
BCS_CODE_SMALL_PROVIDER_NAME="BCS Lite Model"
BCS_CODE_MODEL_NAME=dsv4
BCS_CODE_SMALL_MODEL_NAME="Qwen 3.6 27B"
BCS_CODE_CONTEXT_WINDOW=262144
BCS_CODE_OUTPUT_WINDOW=8192
BCS_CODE_SMALL_API_KEY=...
```

Do not commit real API keys. Prefer gateway-side allowlists or distribute keys
through a separate internal channel. If `BCS_CODE_SMALL_API_KEY` is omitted, the
Windows installer prompts once and stores it in the user's environment.

If endpoint security temporarily locks files under `%TEMP%\bcs-code-wezterm-*`,
the installer may warn that the temporary directory could not be removed. The
installation can continue; users may delete that temporary directory later.
