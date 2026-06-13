import { describe, expect, test } from "bun:test"
import { spawn } from "child_process"
import path from "path"

const worker = path.join(import.meta.dir, "fixture", "flag-worker.ts")

type FlagResult = {
  authContent: string
  bcsCodeOnly: boolean
  client: string
  config: string
  disableModelsFetch: boolean
  disableShare: boolean
  home: string
  modelsUrl: string
  permission: string
  serverPassword: string
}

async function readFlags(env: Record<string, string>): Promise<FlagResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [worker], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`worker exited ${code}: ${stderr}`))
        return
      }
      resolve(JSON.parse(stdout.trim()) as FlagResult)
    })
  })
}

describe("BCS_CODE env aliases", () => {
  test("BCS_CODE_* variables drive legacy internal flags", async () => {
    const result = await readFlags({
      BCS_CODE_AUTH_CONTENT: '{"bcs":{"type":"api","key":"test"}}',
      BCS_CODE_BCS_CODE_ONLY: "1",
      BCS_CODE_CLIENT: "docs-test",
      BCS_CODE_CONFIG: "/tmp/bcs-code.json",
      BCS_CODE_DISABLE_MODELS_FETCH: "true",
      BCS_CODE_DISABLE_SHARE: "1",
      BCS_CODE_HOME: "/tmp/bcs-code-home",
      BCS_CODE_MODELS_URL: "https://bcs.example/models",
      BCS_CODE_PERMISSION: '{"edit":"ask"}',
      BCS_CODE_SERVER_PASSWORD: "secret",
    })

    expect(result).toEqual({
      authContent: '{"bcs":{"type":"api","key":"test"}}',
      bcsCodeOnly: true,
      client: "docs-test",
      config: "/tmp/bcs-code.json",
      disableModelsFetch: true,
      disableShare: true,
      home: "/tmp/bcs-code-home",
      modelsUrl: "https://bcs.example/models",
      permission: '{"edit":"ask"}',
      serverPassword: "secret",
    })
  })

  test("legacy MIMOCODE_* variables remain fallback aliases", async () => {
    const result = await readFlags({
      MIMOCODE_CLIENT: "legacy-client",
      MIMOCODE_CONFIG: "/tmp/mimocode.json",
      MIMOCODE_DISABLE_MODELS_FETCH: "1",
      MIMOCODE_HOME: "/tmp/mimocode-home",
      MIMOCODE_MODELS_URL: "https://legacy.example/models",
    })

    expect(result.client).toBe("legacy-client")
    expect(result.config).toBe("/tmp/mimocode.json")
    expect(result.disableModelsFetch).toBe(true)
    expect(result.home).toBe("/tmp/mimocode-home")
    expect(result.modelsUrl).toBe("https://legacy.example/models")
  })
})
