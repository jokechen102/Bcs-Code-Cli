#!/usr/bin/env bun

import { $ } from "bun"
import fs from "fs"
import path from "path"
import { Script } from "@mimo-ai/script"

const root = path.resolve(import.meta.dirname, "..")
const version = process.env.OPENCODE_VERSION ?? Script.version
const packageName = `bcs-code-windows-amd64-${version}`
const outRoot = path.join(root, "dist", "internal")
const staging = path.join(outRoot, packageName)
const wezTermVersion = "20240203-110809-5046fc22"
const wezTermZip = `WezTerm-windows-${wezTermVersion}.zip`
const wezTermUrl = `https://github.com/wez/wezterm/releases/download/${wezTermVersion}/${wezTermZip}`
const providerId = process.env.BCS_CODE_PROVIDER_ID ?? "bcs-internal"
const baseURL = process.env.BCS_CODE_BASE_URL ?? "https://your-internal-llm-gateway.example.com/v1"
const model = process.env.BCS_CODE_MODEL ?? "qwen3-coder"

process.chdir(root)

await $`OPENCODE_VERSION=${version} bun run packages/opencode/script/build.ts --target=windows-x64`

await fs.promises.rm(staging, { recursive: true, force: true })
await fs.promises.mkdir(path.join(staging, "payload", "bcs-code"), { recursive: true })
await fs.promises.mkdir(path.join(staging, "payload", "wezterm"), { recursive: true })
await fs.promises.mkdir(path.join(staging, "config"), { recursive: true })

await fs.promises.copyFile(
  path.join(root, "packages", "opencode", "dist", "bcs-code-windows-x64", "bin", "bcs-code.exe"),
  path.join(staging, "payload", "bcs-code", "bcs-code.exe"),
)
await fs.promises.copyFile(
  path.join(root, "packages", "opencode", "deploy", "windows", "install-bcs-code.ps1"),
  path.join(staging, "install-bcs-code.ps1"),
)
await fs.promises.copyFile(
  path.join(root, "packages", "opencode", "deploy", "windows", "README.md"),
  path.join(staging, "README.md"),
)

if (!(await Bun.file(path.join(staging, "payload", "wezterm", wezTermZip)).exists())) {
  await $`curl -L --fail --output ${path.join(staging, "payload", "wezterm", wezTermZip)} ${wezTermUrl}`
}

await Bun.write(
  path.join(staging, "config", "install-settings.json"),
  JSON.stringify(
    {
      providerId,
      providerName: process.env.BCS_CODE_PROVIDER_NAME ?? "BCS Internal LLM",
      baseURL,
      apiKey: process.env.BCS_CODE_API_KEY ?? "",
      model,
      modelName: process.env.BCS_CODE_MODEL_NAME ?? model,
      smallModel: process.env.BCS_CODE_SMALL_MODEL ?? model,
      smallModelName: process.env.BCS_CODE_SMALL_MODEL_NAME ?? process.env.BCS_CODE_SMALL_MODEL ?? model,
      reasoning: process.env.BCS_CODE_REASONING !== "0",
      smallReasoning: process.env.BCS_CODE_SMALL_REASONING === "1",
      contextWindow: Number(process.env.BCS_CODE_CONTEXT_WINDOW ?? 262144),
      outputWindow: Number(process.env.BCS_CODE_OUTPUT_WINDOW ?? 8192),
      smallContextWindow: Number(process.env.BCS_CODE_SMALL_CONTEXT_WINDOW ?? process.env.BCS_CODE_CONTEXT_WINDOW ?? 262144),
      smallOutputWindow: Number(process.env.BCS_CODE_SMALL_OUTPUT_WINDOW ?? process.env.BCS_CODE_OUTPUT_WINDOW ?? 8192),
    },
    null,
    2,
  ),
)

await Bun.write(
  path.join(staging, "install-bcs-code.cmd"),
  [
    "@echo off",
    "setlocal",
    'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-bcs-code.ps1" %*',
    "endlocal",
    "",
  ].join("\r\n"),
)

await Bun.write(
  path.join(staging, "VERSION.txt"),
  [
    `BCS Code version: ${version}`,
    `WezTerm version: ${wezTermVersion}`,
    `Provider id: ${providerId}`,
    `Default model: ${providerId}/${model}`,
    `Base URL: ${baseURL}`,
    "",
  ].join("\n"),
)

await $`rm -f ${path.join(outRoot, `${packageName}.zip`)}`
await $`zip -qr ${path.join(outRoot, `${packageName}.zip`)} ${packageName}`.cwd(outRoot)

if (baseURL.includes("your-internal-llm-gateway")) {
  console.warn("WARNING: install-settings.json contains a placeholder baseURL. Set BCS_CODE_BASE_URL before distributing.")
}

console.log(path.join(outRoot, `${packageName}.zip`))
