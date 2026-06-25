import { describe, expect, test } from "bun:test"
import path from "path"
import { resolveMimocodeHome } from "@mimo-ai/shared/global"

describe("resolveMimocodeHome", () => {
  test("with BCS_CODE_HOME set, resolves 4 subdirs under root", () => {
    const result = resolveMimocodeHome({
      BCS_CODE_HOME: "/tmp/bcs-profile-a",
    })
    expect(result.mode).toBe("mimocode_home")
    expect(result.root).toBe("/tmp/bcs-profile-a")
    expect(result.config).toBe(path.join("/tmp/bcs-profile-a", "config"))
    expect(result.data).toBe(path.join("/tmp/bcs-profile-a", "data"))
    expect(result.state).toBe(path.join("/tmp/bcs-profile-a", "state"))
    expect(result.cache).toBe(path.join("/tmp/bcs-profile-a", "cache"))
  })

  test("BCS_CODE_HOME takes precedence over legacy MIMOCODE_HOME", () => {
    const result = resolveMimocodeHome({
      BCS_CODE_HOME: "/tmp/bcs-profile-a",
      MIMOCODE_HOME: "/tmp/legacy-profile-a",
    })
    expect(result.root).toBe("/tmp/bcs-profile-a")
  })

  test("with MIMOCODE_HOME set, resolves 4 subdirs under root", () => {
    const result = resolveMimocodeHome({
      MIMOCODE_HOME: "/tmp/profile-a",
    })
    expect(result.mode).toBe("mimocode_home")
    expect(result.root).toBe("/tmp/profile-a")
    expect(result.config).toBe(path.join("/tmp/profile-a", "config"))
    expect(result.data).toBe(path.join("/tmp/profile-a", "data"))
    expect(result.state).toBe(path.join("/tmp/profile-a", "state"))
    expect(result.cache).toBe(path.join("/tmp/profile-a", "cache"))
  })

  test("without MIMOCODE_HOME, falls through to xdg mode", () => {
    const result = resolveMimocodeHome({})
    expect(result.mode).toBe("xdg")
    expect(result.root).toBeUndefined()
    // The canonical config path is BCS-branded; data/cache/state stay on the legacy app path.
    expect(result.config.endsWith(path.join("", "bcscode"))).toBe(true)
    expect(result.data.endsWith(path.join("", "mimocode"))).toBe(true)
    expect(result.state.endsWith(path.join("", "mimocode"))).toBe(true)
    expect(result.cache.endsWith(path.join("", "mimocode"))).toBe(true)
  })

  test("empty MIMOCODE_HOME string is treated as unset (xdg mode)", () => {
    const result = resolveMimocodeHome({ MIMOCODE_HOME: "" })
    expect(result.mode).toBe("xdg")
  })

  test("relative MIMOCODE_HOME path throws with clear error", () => {
    expect(() => resolveMimocodeHome({ MIMOCODE_HOME: "./foo" })).toThrow(
      /MIMOCODE_HOME must be an absolute path/,
    )
    expect(() => resolveMimocodeHome({ MIMOCODE_HOME: "foo/bar" })).toThrow(
      /MIMOCODE_HOME must be an absolute path/,
    )
  })

  test("relative BCS_CODE_HOME path throws with clear error", () => {
    expect(() => resolveMimocodeHome({ BCS_CODE_HOME: "./foo" })).toThrow(
      /BCS_CODE_HOME must be an absolute path/,
    )
  })

  test("tilde-prefixed MIMOCODE_HOME throws (not treated as absolute)", () => {
    expect(() => resolveMimocodeHome({ MIMOCODE_HOME: "~/profiles/a" })).toThrow(
      /MIMOCODE_HOME must be an absolute path/,
    )
  })

  test("error message includes the offending value", () => {
    expect(() => resolveMimocodeHome({ MIMOCODE_HOME: "./relative" })).toThrow(
      /\.\/relative/,
    )
  })
})
