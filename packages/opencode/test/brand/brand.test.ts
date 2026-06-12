import { describe, expect, test } from "bun:test"
import { Brand } from "../../src/brand"

describe("Brand", () => {
  test("defines the internal trial identity", () => {
    expect(Brand.productName).toBe("BCS Code")
    expect(Brand.agentName).toBe("BCS Code Agent")
    expect(Brand.cliName).toBe("bcs-code")
    expect(Brand.legacyCliName).toBe("mimo")
    expect(Brand.binaryPrefix).toBe("bcs-code")
    expect(Brand.packageName).toBe("@bcs-code/cli")
  })
})
