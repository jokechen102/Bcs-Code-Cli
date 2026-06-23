import type { CliPackageRelease } from "./server-bootstrap"

export interface UpgradeDecision {
  available: boolean
  required: boolean
  requiredForRemote: boolean
  currentVersion: string
  targetVersion?: string
  package?: CliPackageRelease
  reason: "up_to_date" | "recommended" | "required_for_remote" | "required" | "no_matching_package"
}

export function chooseUpgradePackage(
  currentVersion: string,
  platform: string,
  arch: string,
  packages: CliPackageRelease[] = [],
): UpgradeDecision {
  const candidate = packages.find((item) => item.platform === platform && item.arch === arch)
  if (!candidate) {
    return { available: false, required: false, requiredForRemote: false, currentVersion, reason: "no_matching_package" }
  }

  if (candidate.version === currentVersion || candidate.upgradePolicy === "none") {
    return {
      available: false,
      required: false,
      requiredForRemote: false,
      currentVersion,
      targetVersion: candidate.version,
      package: candidate,
      reason: "up_to_date",
    }
  }

  const required = candidate.upgradePolicy === "required"
  const requiredForRemote = candidate.upgradePolicy === "required_for_remote"
  return {
    available: true,
    required,
    requiredForRemote,
    currentVersion,
    targetVersion: candidate.version,
    package: candidate,
    reason: required ? "required" : (requiredForRemote ? "required_for_remote" : "recommended"),
  }
}
