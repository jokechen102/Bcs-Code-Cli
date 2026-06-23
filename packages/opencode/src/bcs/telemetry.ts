import type { LocalCapabilities } from "./local-capabilities"

export interface UsageReport {
  userId: string
  clientVersion: string
  sessionId: string
  modelCode: string
  inputTokens: number
  outputTokens: number
  toolCalls?: Array<Record<string, unknown>>
  error?: {
    code: string
    message: string
  }
}

export interface HeartbeatReport {
  userId: string
  deviceId: string
  clientVersion: string
  platform: string
  sessionId: string
  status?: "online" | "idle" | "offline" | string
  capabilitySnapshot?: Partial<LocalCapabilities> & Record<string, unknown>
}

export interface TelemetryAccepted {
  accepted: boolean
  reportId: string
  acceptedAt: string
}

export async function reportUsage(
  serverUrl: string,
  report: UsageReport,
  fetchImpl?: typeof fetch,
): Promise<TelemetryAccepted> {
  return postTelemetry(serverUrl, "/api/v1/bcs-code-cli/usage", report, fetchImpl)
}

export async function reportHeartbeat(
  serverUrl: string,
  report: HeartbeatReport,
  fetchImpl?: typeof fetch,
): Promise<TelemetryAccepted> {
  return postTelemetry(serverUrl, "/api/v1/bcs-code-cli/heartbeat", {
    ...report,
    status: report.status ?? "online",
  }, fetchImpl)
}

async function postTelemetry(
  serverUrl: string,
  path: string,
  payload: object,
  fetchImpl?: typeof fetch,
): Promise<TelemetryAccepted> {
  const fetcher = fetchImpl ?? fetch
  const response = await fetcher(new URL(path, serverUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`BCS Code telemetry report failed: ${response.status}`)
  }

  return response.json() as Promise<TelemetryAccepted>
}
