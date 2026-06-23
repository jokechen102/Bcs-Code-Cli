export interface LocalCapabilities {
  clientVersion: string
  platform: string
  localModels: string[]
  localSkills: string[]
  localMcpServers: string[]
}

export interface LocalCapabilitySource {
  models?: string[]
  skills?: string[]
  mcpServers?: string[]
  clientVersion: string
  platform?: string
}

export function readLocalCapabilities(source: LocalCapabilitySource): LocalCapabilities {
  return {
    clientVersion: source.clientVersion,
    platform: source.platform ?? `${process.platform}-${process.arch}`,
    localModels: unique(source.models ?? []),
    localSkills: unique(source.skills ?? []),
    localMcpServers: unique(source.mcpServers ?? []),
  }
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort()
}
