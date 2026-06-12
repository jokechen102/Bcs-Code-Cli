import { describe, expect, test } from "bun:test"
import { logo } from "../../src/cli/ui"
import { Brand } from "../../src/brand"

describe("CLI visible brand", () => {
  test("non-tty logo contains BCS wordmark", () => {
    expect(logo()).toContain("BCS")
    expect(logo()).not.toContain("MIMO")
  })

  test("brand constants use the shipped command name", () => {
    expect(Brand.cliName).toBe("bcs-code")
  })
})
