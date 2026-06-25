import type { ModelMessage } from "ai"

function contentToText(content: unknown): string {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part
        if (part && typeof part === "object" && "type" in part && part.type === "text") {
          return typeof (part as { text?: unknown }).text === "string" ? (part as { text: string }).text : ""
        }
        return ""
      })
      .join("\n")
  }
  return ""
}

export function normalizeSystemMessages(messages: ModelMessage[]): ModelMessage[] {
  const system: ModelMessage[] = []
  const rest: ModelMessage[] = []
  for (const message of messages) {
    if (message.role === "system" || (message.role as string) === "developer") {
      system.push(message)
      continue
    }
    rest.push(message)
  }

  if (system.length === 0) return messages

  const mergedContent = system
    .map((message) => contentToText(message.content))
    .map((content) => content.trim())
    .filter(Boolean)
    .join("\n")

  const { role: _role, content: _content, ...metadata } = system[0] as Record<string, unknown>
  return [{ role: "system", content: mergedContent, ...(metadata as Record<string, unknown>) }, ...rest]
}
