import { describe, expect, it } from "bun:test"
import { readLocalCapabilities } from "./local-capabilities"
import { mergeCapabilities, mergeCliPolicy } from "./merge-policy"
import { fetchPackageDownloadMetadata, fetchPackageRelease, fetchServerBootstrap } from "./server-bootstrap"
import { reportHeartbeat, reportUsage } from "./telemetry"
import { chooseUpgradePackage } from "./upgrade"

describe("BCS Code remote governance", () => {
  it("keeps local skill and MCP capabilities when remote policy is applied", () => {
    const local = readLocalCapabilities({
      clientVersion: "0.1.0-bcs.5",
      platform: "darwin-arm64",
      models: ["local-qwen"],
      skills: ["office-reader"],
      mcpServers: ["local-gerrit"],
    })

    const effective = mergeCliPolicy(local, {
      policyVersion: "2026.06.18-java-target",
      issuedAt: "2026-06-18T12:00:00Z",
      models: [{ provider: "bcs", model: "qwen3.6-coder", remoteManaged: true, localOverrideAllowed: true, priority: 100 }],
      usageLimit: { dailyTokenLimit: 200000, monthlyTokenLimit: 3000000, maxConcurrentTasks: 4 },
      remoteSkills: ["code-review"],
      remoteMcpServers: ["knowledge-base"],
      enabledLocalSkills: ["office-reader"],
      enabledLocalMcpServers: ["local-gerrit"],
      upgradePackage: {
        client: "bcs-code-cli",
        platform: "windows",
        arch: "amd64",
        version: "0.1.0-bcs.9",
        downloadUrl: "https://bcs-code.internal/packages/bcs-code-cli/0.1.0-bcs.9/windows-amd64.zip",
        sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
        sizeBytes: 486539264,
        releaseNotes: "Java AgentScope bootstrap and remote capability catalog support.",
        minSupportedVersion: "0.1.0-bcs.8",
        upgradePolicy: "recommended",
        publishedAt: "2026-06-18T00:00:00Z",
      },
    })

    expect(effective.sources).toEqual({ local: true, remote: true })
    expect(effective.models.map((item) => item.model)).toEqual(["qwen3.6-coder", "local-qwen"])
    expect(effective.skills).toEqual(["code-review", "office-reader"])
    expect(effective.mcpServers).toEqual(["knowledge-base", "local-gerrit"])
    expect(effective.upgradePackage?.version).toBe("0.1.0-bcs.9")
  })

  it("falls back to local-only policy when server bootstrap is absent", () => {
    const local = readLocalCapabilities({
      clientVersion: "0.1.0-bcs.5",
      models: ["local-qwen"],
      skills: ["office-reader"],
      mcpServers: ["local-gerrit"],
    })

    const effective = mergeCliPolicy(local)

    expect(effective.policyVersion).toBe("local-only")
    expect(effective.sources).toEqual({ local: true, remote: false })
    expect(effective.skills).toEqual(["office-reader"])
    expect(effective.mcpServers).toEqual(["local-gerrit"])
  })

  it("posts local capabilities to the server bootstrap endpoint", async () => {
    const requests: Request[] = []
    const response = await fetchServerBootstrap({
      serverUrl: "https://bcs-code.internal",
      userId: "zhangsan",
      deviceId: "macbook-dev-01",
      localCapabilities: readLocalCapabilities({ clientVersion: "0.1.0-bcs.5", skills: ["office-reader"] }),
      fetchImpl: (async (input, init) => {
        requests.push(new Request(input, init))
        return Response.json({
          policyVersion: "2026.06.18-java-target",
          issuedAt: "2026-06-18T12:00:00Z",
          models: [],
          usageLimit: { dailyTokenLimit: 1, monthlyTokenLimit: 2, maxConcurrentTasks: 3 },
          remoteSkills: [],
          remoteMcpServers: [],
          enabledLocalSkills: ["office-reader"],
          enabledLocalMcpServers: [],
        })
      }) as typeof fetch,
    })

    expect(requests[0].url).toBe("https://bcs-code.internal/api/v1/bcs-code-cli/bootstrap")
    expect(await requests[0].json()).toMatchObject({
      userId: "zhangsan",
      deviceId: "macbook-dev-01",
      localCapabilities: { localSkills: ["office-reader"] },
    })
    expect(response.enabledLocalSkills).toEqual(["office-reader"])
  })

  it("preserves local capability records and marks remote-disabled items", () => {
    const result = mergeCapabilities({
      local: {
        skills: [{ code: "local-review", source: "local_user" }],
        mcpServers: [{ code: "local-gerrit", source: "local_user" }],
        models: [],
      },
      remote: {
        skills: [{ code: "workload_estimation", source: "remote_nacos" }],
        mcpServers: [],
        models: [],
      },
      policy: { disabledSkillCodes: ["local-review"] },
    })

    expect(result.skills).toEqual([
      { code: "local-review", source: "local_user", status: "remote_disabled" },
      { code: "workload_estimation", source: "remote_nacos", status: "available" },
    ])
    expect(result.mcpServers[0]).toEqual({ code: "local-gerrit", source: "local_user", status: "available" })
  })

  it("selects matching upgrade package and tells whether it is required", () => {
    const decision = chooseUpgradePackage("0.1.0-bcs.5", "windows", "amd64", [{
      client: "bcs-code-cli",
      platform: "windows",
      arch: "amd64",
      version: "0.1.0-bcs.9",
      downloadUrl: "/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9/download",
      sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
      sizeBytes: 486539264,
      releaseNotes: "Java AgentScope bootstrap and remote capability catalog support.",
      minSupportedVersion: "0.1.0-bcs.8",
      upgradePolicy: "required",
      publishedAt: "2026-06-18T00:00:00Z",
    }])

    expect(decision.available).toBe(true)
    expect(decision.required).toBe(true)
    expect(decision.requiredForRemote).toBe(false)
    expect(decision.targetVersion).toBe("0.1.0-bcs.9")
  })

  it("treats required_for_remote as remote-only upgrade enforcement", () => {
    const decision = chooseUpgradePackage("0.1.0-bcs.5", "windows", "amd64", [{
      client: "bcs-code-cli",
      platform: "windows",
      arch: "amd64",
      version: "0.1.0-bcs.9",
      downloadUrl: "/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9/download",
      sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
      sizeBytes: 486539264,
      releaseNotes: "Java AgentScope bootstrap and remote capability catalog support.",
      minSupportedVersion: "0.1.0-bcs.8",
      upgradePolicy: "required_for_remote",
      publishedAt: "2026-06-18T00:00:00Z",
    }])

    expect(decision.available).toBe(true)
    expect(decision.required).toBe(false)
    expect(decision.requiredForRemote).toBe(true)
    expect(decision.reason).toBe("required_for_remote")
  })

  it("fetches package detail and download metadata from the server", async () => {
    const requests: string[] = []
    const fetchImpl = (async (input) => {
      requests.push(String(input))
      if (String(input).endsWith("/download")) {
        return Response.json({
          packageInfo: {
            client: "bcs-code-cli",
            platform: "windows",
            arch: "amd64",
            version: "0.1.0-bcs.9",
            downloadUrl: "/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9/download",
            sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
            sizeBytes: 486539264,
            releaseNotes: "Java AgentScope bootstrap and remote capability catalog support.",
            minSupportedVersion: "0.1.0-bcs.8",
            upgradePolicy: "recommended",
            publishedAt: "2026-06-18T00:00:00Z",
          },
          integrity: "sha256-9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
          sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
          sizeBytes: 486539264,
          upgradePolicy: "recommended",
          message: "verify before install",
        })
      }
      return Response.json({
        client: "bcs-code-cli",
        platform: "windows",
        arch: "amd64",
        version: "0.1.0-bcs.9",
        downloadUrl: "/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9/download",
        sha256: "9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11",
        sizeBytes: 486539264,
        releaseNotes: "Java AgentScope bootstrap and remote capability catalog support.",
        minSupportedVersion: "0.1.0-bcs.8",
        upgradePolicy: "recommended",
        publishedAt: "2026-06-18T00:00:00Z",
      })
    }) as typeof fetch

    const detail = await fetchPackageRelease("https://bcs-code.internal", "windows", "amd64", "0.1.0-bcs.9", fetchImpl)
    const download = await fetchPackageDownloadMetadata("https://bcs-code.internal", "windows", "amd64", "0.1.0-bcs.9", fetchImpl)

    expect(requests).toEqual([
      "https://bcs-code.internal/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9",
      "https://bcs-code.internal/api/v1/bcs-code-cli/packages/windows/amd64/0.1.0-bcs.9/download",
    ])
    expect(detail.version).toBe("0.1.0-bcs.9")
    expect(download.integrity).toBe("sha256-9b6f3a6d55d2cbef1f0d9a266ff4d5f77bb38ab071c4dfcd1e9f6d3b6f5e8a11")
  })

  it("reports usage and heartbeat telemetry to the server", async () => {
    const requests: Request[] = []
    const fetchImpl = (async (input, init) => {
      requests.push(new Request(input, init))
      return Response.json({
        accepted: true,
        reportId: `report-${requests.length}`,
        acceptedAt: "2026-06-18T12:00:00Z",
      })
    }) as typeof fetch

    const usage = await reportUsage("https://bcs-code.internal", {
      userId: "zhangsan",
      clientVersion: "0.1.0-bcs.9",
      sessionId: "session-1",
      modelCode: "bcs-full-dsv4",
      inputTokens: 120,
      outputTokens: 35,
      toolCalls: [{ name: "git.diff", status: "ok" }],
      error: { code: "none", message: "" },
    }, fetchImpl)
    const heartbeat = await reportHeartbeat("https://bcs-code.internal", {
      userId: "zhangsan",
      deviceId: "macbook-dev-01",
      clientVersion: "0.1.0-bcs.9",
      platform: "darwin-arm64",
      sessionId: "session-1",
      capabilitySnapshot: {
        localSkills: ["office-reader"],
        localMcpServers: ["local-gerrit"],
      },
    }, fetchImpl)

    expect(requests.map((request) => request.url)).toEqual([
      "https://bcs-code.internal/api/v1/bcs-code-cli/usage",
      "https://bcs-code.internal/api/v1/bcs-code-cli/heartbeat",
    ])
    expect(await requests[0].json()).toMatchObject({
      sessionId: "session-1",
      modelCode: "bcs-full-dsv4",
      inputTokens: 120,
      toolCalls: [{ name: "git.diff", status: "ok" }],
    })
    expect(await requests[1].json()).toMatchObject({
      deviceId: "macbook-dev-01",
      status: "online",
      capabilitySnapshot: { localSkills: ["office-reader"] },
    })
    expect(usage.reportId).toBe("report-1")
    expect(heartbeat.reportId).toBe("report-2")
  })
})
