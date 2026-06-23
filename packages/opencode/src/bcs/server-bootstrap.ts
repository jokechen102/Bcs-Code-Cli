import type { LocalCapabilities } from "./local-capabilities"

export interface CliModelPolicy {
  provider: string
  model: string
  remoteManaged: boolean
  localOverrideAllowed: boolean
  priority: number
}

export interface CliUsageLimit {
  dailyTokenLimit: number
  monthlyTokenLimit: number
  maxConcurrentTasks: number
}

export interface CliPackageRelease {
  client: string
  platform: string
  arch: string
  version: string
  downloadUrl: string
  sha256: string
  sizeBytes: number
  releaseNotes: string
  minSupportedVersion: string
  upgradePolicy: "none" | "recommended" | "required_for_remote" | "required" | string
  publishedAt: string
}

export interface CliPackageDownload {
  packageInfo: CliPackageRelease
  downloadUrl: string
  sha256: string
  sizeBytes: number
  integrity: string
  upgradePolicy: string
  message: string
}

export interface CliBootstrapResponse {
  policyVersion: string
  issuedAt: string
  models: CliModelPolicy[]
  usageLimit: CliUsageLimit
  remoteSkills: string[]
  remoteMcpServers: string[]
  enabledLocalSkills: string[]
  enabledLocalMcpServers: string[]
  upgradePackage?: CliPackageRelease
  packages?: CliPackageRelease[]
}

export interface BootstrapOptions {
  serverUrl: string
  userId: string
  deviceId: string
  localCapabilities: LocalCapabilities
  fetchImpl?: typeof fetch
}

export async function fetchServerBootstrap(options: BootstrapOptions): Promise<CliBootstrapResponse> {
  const fetcher = options.fetchImpl ?? fetch
  const response = await fetcher(new URL("/api/v1/bcs-code-cli/bootstrap", options.serverUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userId: options.userId,
      deviceId: options.deviceId,
      localCapabilities: options.localCapabilities,
    }),
  })

  if (!response.ok) {
    throw new Error(`BCS Code server bootstrap failed: ${response.status}`)
  }

  return response.json() as Promise<CliBootstrapResponse>
}

export async function fetchPackageRelease(
  serverUrl: string,
  platform: string,
  arch: string,
  version: string,
  fetchImpl?: typeof fetch,
): Promise<CliPackageRelease> {
  const fetcher = fetchImpl ?? fetch
  const response = await fetcher(new URL(`/api/v1/bcs-code-cli/packages/${platform}/${arch}/${version}`, serverUrl))
  if (!response.ok) {
    throw new Error(`BCS Code package lookup failed: ${response.status}`)
  }
  return response.json() as Promise<CliPackageRelease>
}

export async function fetchPackageDownloadMetadata(
  serverUrl: string,
  platform: string,
  arch: string,
  version: string,
  fetchImpl?: typeof fetch,
): Promise<CliPackageDownload> {
  const fetcher = fetchImpl ?? fetch
  const response = await fetcher(new URL(`/api/v1/bcs-code-cli/packages/${platform}/${arch}/${version}/download`, serverUrl))
  if (!response.ok) {
    throw new Error(`BCS Code package download metadata failed: ${response.status}`)
  }
  return response.json() as Promise<CliPackageDownload>
}
