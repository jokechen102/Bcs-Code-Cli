
import { describe, expect, test } from "bun:test"
import { normalizeSystemMessages } from "../../src/session/llm"
import { type ModelMessage } from "ai"

describe("normalizeSystemMessages", () => {
  test("merges multiple system and developer messages into one system message at the start", () => {
    const messages: ModelMessage[] = [
      { role: "user", content: "user 1" },
      { role: "system", content: "system 1" },
      { role: "developer", content: "developer 1" } as any,
      { role: "assistant", content: "assistant 1" },
      { role: "system", content: "system 2" },
    ]

    const normalized = normalizeSystemMessages(messages)

    expect(normalized).toHaveLength(3)
    expect(normalized[0]).toEqual({
      role: "system",
      content: "system 1\ndeveloper 1\nsystem 2",
    })
    expect(normalized[1]).toEqual({ role: "user", content: "user 1" })
    expect(normalized[2]).toEqual({ role: "assistant", content: "assistant 1" })
  })

  test("handles single system message", () => {
    const messages: ModelMessage[] = [
      { role: "system", content: "system 1" },
      { role: "user", content: "user 1" },
    ]

    const normalized = normalizeSystemMessages(messages)

    expect(normalized).toEqual(messages)
  })

  test("handles no system messages", () => {
    const messages: ModelMessage[] = [
      { role: "user", content: "user 1" },
      { role: "assistant", content: "assistant 1" },
    ]

    const normalized = normalizeSystemMessages(messages)

    expect(normalized).toEqual(messages)
  })

  test("preserves metadata from the first system message", () => {
    const messages: ModelMessage[] = [
      { role: "system", content: "system 1", providerOptions: { test: { foo: "bar" } } } as any,
      { role: "developer", content: "developer 1" } as any,
    ]

    const normalized = normalizeSystemMessages(messages)

    expect(normalized).toHaveLength(1)
    expect(normalized[0]).toEqual({
      role: "system",
      content: "system 1\ndeveloper 1",
      providerOptions: { test: { foo: "bar" } },
    } as any)
  })

  test("handles array content correctly", () => {
    const messages: ModelMessage[] = [
      { role: "system", content: [{ type: "text", text: "part 1" }] } as any,
      { role: "system", content: "part 2" },
    ]

    const normalized = normalizeSystemMessages(messages)

    expect(normalized).toHaveLength(1)
    expect(normalized[0].content).toBe("part 1\npart 2")
  })
})
