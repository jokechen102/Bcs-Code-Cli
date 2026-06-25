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
const ripgrepVersion = "15.1.0"
const ripgrepZip = `ripgrep-${ripgrepVersion}-x86_64-pc-windows-msvc.zip`
const ripgrepUrl = `https://github.com/BurntSushi/ripgrep/releases/download/${ripgrepVersion}/${ripgrepZip}`
const fullProviderId = process.env.BCS_CODE_FULL_PROVIDER_ID ?? process.env.BCS_CODE_PROVIDER_ID ?? "bcs-full"
const smallProviderId = process.env.BCS_CODE_SMALL_PROVIDER_ID ?? "bcs-lite"
const fullBaseURL = process.env.BCS_CODE_FULL_BASE_URL ?? process.env.BCS_CODE_BASE_URL ?? "http://100.89.126.33:8008/v1"
const smallBaseURL =
  process.env.BCS_CODE_SMALL_BASE_URL ?? "http://100.115.100.130:30279/8a620da96ee846738ddc72414be2c712/v1"
const model = process.env.BCS_CODE_MODEL ?? process.env.BCS_CODE_FULL_MODEL ?? "dsv4"
const smallModel = process.env.BCS_CODE_SMALL_MODEL ?? "Qwen-3.6-27B"

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

const ripgrepArchive = path.join(outRoot, ripgrepZip)
if (!(await Bun.file(ripgrepArchive).exists())) {
  await $`curl -L --fail --output ${ripgrepArchive} ${ripgrepUrl}`
}
const ripgrepExtract = path.join(outRoot, `ripgrep-${ripgrepVersion}-windows-x64`)
await fs.promises.rm(ripgrepExtract, { recursive: true, force: true })
await fs.promises.mkdir(ripgrepExtract, { recursive: true })
await $`unzip -q -o ${ripgrepArchive} -d ${ripgrepExtract}`
const ripgrepExe = path.join(ripgrepExtract, `ripgrep-${ripgrepVersion}-x86_64-pc-windows-msvc`, "rg.exe")
if (!(await Bun.file(ripgrepExe).exists())) {
  throw new Error(`ripgrep archive did not contain rg.exe: ${ripgrepExe}`)
}
await fs.promises.copyFile(ripgrepExe, path.join(staging, "payload", "bcs-code", "rg.exe"))
await fs.promises.rm(ripgrepExtract, { recursive: true, force: true })

await Bun.write(
  path.join(staging, "config", "install-settings.json"),
  JSON.stringify(
    {
      fullProviderId,
      fullProviderName: process.env.BCS_CODE_FULL_PROVIDER_NAME ?? process.env.BCS_CODE_PROVIDER_NAME ?? "BCS Full Model",
      fullBaseURL,
      fullApiKey: process.env.BCS_CODE_FULL_API_KEY ?? "",
      fullApiKeyRequired: process.env.BCS_CODE_FULL_API_KEY_REQUIRED === "1",
      fullApiKeyEnv: process.env.BCS_CODE_FULL_API_KEY_ENV ?? "BCS_CODE_FULL_API_KEY",
      smallProviderId,
      smallProviderName: process.env.BCS_CODE_SMALL_PROVIDER_NAME ?? "BCS Lite Model",
      smallBaseURL,
      smallApiKey: process.env.BCS_CODE_SMALL_API_KEY ?? process.env.BCS_CODE_API_KEY ?? "",
      smallApiKeyRequired: process.env.BCS_CODE_SMALL_API_KEY_REQUIRED !== "0",
      smallApiKeyEnv: process.env.BCS_CODE_SMALL_API_KEY_ENV ?? "BCS_CODE_SMALL_API_KEY",
      baseURL: fullBaseURL,
      apiKey: "",
      model,
      modelName: process.env.BCS_CODE_MODEL_NAME ?? model,
      smallModel,
      smallModelName: process.env.BCS_CODE_SMALL_MODEL_NAME ?? smallModel,
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
    `Full provider id: ${fullProviderId}`,
    `Default model: ${fullProviderId}/${model}`,
    `Full base URL: ${fullBaseURL}`,
    `Small provider id: ${smallProviderId}`,
    `Small model: ${smallProviderId}/${smallModel}`,
    `Small base URL: ${smallBaseURL}`,
    `Bundled tools: rg.exe`,
    "",
  ].join("\n"),
)

await $`rm -f ${path.join(outRoot, `${packageName}.zip`)}`
await $`zip -qr ${path.join(outRoot, `${packageName}.zip`)} ${packageName}`.cwd(outRoot)

if (fullBaseURL.includes("your-internal-llm-gateway") || smallBaseURL.includes("your-internal-llm-gateway")) {
  console.warn(
    "WARNING: install-settings.json contains a placeholder baseURL. Set BCS_CODE_FULL_BASE_URL and BCS_CODE_SMALL_BASE_URL before distributing.",
  )
}

console.log(path.join(outRoot, `${packageName}.zip`))
