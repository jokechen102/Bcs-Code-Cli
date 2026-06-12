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

## Compatibility

The trial build keeps existing `.mimocode` project configuration and `MIMOCODE_HOME` profile isolation. This avoids data migration during early testing and keeps future upstream merges smaller.
