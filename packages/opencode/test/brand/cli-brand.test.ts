import { describe, expect, test } from "bun:test"
import { logo } from "../../src/cli/ui"
import { logo as classicLogo, logoThin } from "../../src/cli/logo"
import { Brand } from "../../src/brand"

describe("CLI visible brand", () => {
  test("non-tty logo contains BCS wordmark", () => {
    expect(logo()).toContain("BCS")
    expect(logo()).not.toContain("MIMO")
  })

  test("logo glyph rows have stable dimensions", () => {
    [classicLogo, logoThin].forEach((variant) => {
      expect(variant.left).toHaveLength(variant.right.length)
      expect(new Set(variant.left.map((row) => row.length)).size).toBe(1)
      expect(new Set(variant.right.map((row) => row.length)).size).toBe(1)
    })
  })

  test("brand constants use the shipped command name", () => {
    expect(Brand.cliName).toBe("bcs-code")
  })
})
