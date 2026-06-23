import type { LocalCapabilities } from "./local-capabilities"
import type { CliBootstrapResponse, CliModelPolicy, CliPackageRelease, CliUsageLimit } from "./server-bootstrap"

export interface Capability {
  code: string
  source: string
  status?: string
}

export interface CapabilitySet {
  skills: Capability[]
  mcpServers: Capability[]
  models: Capability[]
}

export interface CapabilityMergeInput {
  local: CapabilitySet
  remote: CapabilitySet
  policy: {
    disabledSkillCodes?: string[]
    disabledMcpCodes?: string[]
    disabledModelCodes?: string[]
  }
}

export interface EffectiveCliPolicy {
  policyVersion: string
  models: CliModelPolicy[]
  skills: string[]
  mcpServers: string[]
  usageLimit?: CliUsageLimit
  upgradePackage?: CliPackageRelease
  sources: {
    local: boolean
    remote: boolean
  }
}

export function mergeCapabilities(input: CapabilityMergeInput): CapabilitySet {
  return {
    skills: mergeCapabilityList(input.local.skills, input.remote.skills, input.policy.disabledSkillCodes),
    mcpServers: mergeCapabilityList(input.local.mcpServers, input.remote.mcpServers, input.policy.disabledMcpCodes),
    models: mergeCapabilityList(input.local.models, input.remote.models, input.policy.disabledModelCodes),
  }
}

export function mergeCliPolicy(
  localCapabilities: LocalCapabilities,
  remote?: CliBootstrapResponse,
): EffectiveCliPolicy {
  const localModels = localCapabilities.localModels.map((model, index) => ({
    provider: "local",
    model,
    remoteManaged: false,
    localOverrideAllowed: true,
    priority: 10 - index,
  }))

  if (!remote) {
    return {
      policyVersion: "local-only",
      models: localModels,
      skills: localCapabilities.localSkills,
      mcpServers: localCapabilities.localMcpServers,
      sources: { local: true, remote: false },
    }
  }

  return {
    policyVersion: remote.policyVersion,
    models: mergeModels(localModels, remote.models),
    skills: unique([...remote.remoteSkills, ...remote.enabledLocalSkills, ...localCapabilities.localSkills]),
    mcpServers: unique([
      ...remote.remoteMcpServers,
      ...remote.enabledLocalMcpServers,
      ...localCapabilities.localMcpServers,
    ]),
    usageLimit: remote.usageLimit,
    upgradePackage: remote.upgradePackage,
    sources: { local: true, remote: true },
  }
}

function mergeModels(localModels: CliModelPolicy[], remoteModels: CliModelPolicy[]) {
  const byModel = new Map<string, CliModelPolicy>()
  for (const model of localModels) byModel.set(model.model, model)
  for (const model of remoteModels) {
    const local = byModel.get(model.model)
    if (!local || model.priority >= local.priority) {
      byModel.set(model.model, model)
    }
  }
  return Array.from(byModel.values()).sort((a, b) => b.priority - a.priority || a.model.localeCompare(b.model))
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort()
}

function mergeCapabilityList(localItems: Capability[], remoteItems: Capability[], disabledCodes: string[] = []) {
  const seen = new Set<string>()
  const merged: Capability[] = []
  for (const item of [...localItems, ...remoteItems]) {
    if (seen.has(item.code)) continue
    seen.add(item.code)
    merged.push({
      ...item,
      status: disabledCodes.includes(item.code) ? "remote_disabled" : (item.status ?? "available"),
    })
  }
  return merged
}
