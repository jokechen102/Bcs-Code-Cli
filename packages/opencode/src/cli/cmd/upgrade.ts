import type { Argv } from "yargs"
import { UI } from "../ui"
import * as prompts from "@clack/prompts"
import { AppRuntime } from "@/effect/app-runtime"
import { Installation } from "../../installation"
import { InstallationVersion } from "../../installation/version"

export const UpgradeCommand = {
  command: "upgrade [target]",
  describe: "upgrade BCS Code to the latest or a specific version",
  builder: (yargs: Argv) => {
    return yargs
      .positional("target", {
        describe: "version to upgrade to, for ex '0.1.48' or 'v0.1.48'",
        type: "string",
      })
      .option("method", {
        alias: "m",
        describe: "installation method to use",
        type: "string",
        choices: ["curl", "npm", "pnpm", "bun", "brew", "choco", "scoop"],
      })
  },
  handler: async (args: { target?: string; method?: string }) => {
    UI.empty()
    UI.println(UI.logo("  "))
    UI.empty()
    prompts.intro("Upgrade")
    const detectedMethod = await AppRuntime.runPromise(Installation.Service.use((svc) => svc.method()))
    const method = (args.method as Installation.Method) ?? detectedMethod
    if (method === "unknown") {
      prompts.log.error(`BCS Code is installed to ${process.execPath} and may be managed by a package manager`)
      const install = await prompts.select({
        message: "Install anyways?",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
        initialValue: false,
      })
      if (!install) {
        prompts.outro("Done")
        return
      }
    }
    prompts.log.info("Using method: " + method)
    if (method === "curl" && !args.target) {
      prompts.log.error("BCS Code internal trial upgrades require a locally built binary.")
      prompts.log.info("Build first: cd packages/opencode && OPENCODE_VERSION=0.1.0-bcs.1 ./script/build.ts --single")
      prompts.log.info(
        "Then run from the repository root: ./install --binary packages/opencode/dist/bcs-code-darwin-arm64/bin/bcs-code",
      )
      prompts.outro("Done")
      return
    }
    const target = args.target
      ? args.target.replace(/^v/, "")
      : await AppRuntime.runPromise(Installation.Service.use((svc) => svc.latest()))

    if (InstallationVersion === target) {
      prompts.log.warn(`BCS Code upgrade skipped: ${target} is already installed`)
      prompts.outro("Done")
      return
    }

    prompts.log.info(`From ${InstallationVersion} → ${target}`)
    const spinner = prompts.spinner()
    spinner.start("Upgrading...")
    const err = await AppRuntime.runPromise(Installation.Service.use((svc) => svc.upgrade(method, target))).catch(
      (err) => err,
    )
    if (err) {
      spinner.stop("Upgrade failed", 1)
      if (err instanceof Installation.UpgradeFailedError) {
        // necessary because choco only allows install/upgrade in elevated terminals
        if (method === "choco" && err.stderr.includes("not running from an elevated command shell")) {
          prompts.log.error("Please run the terminal as Administrator and try again")
        } else {
          prompts.log.error(err.stderr)
        }
      } else if (err instanceof Error) prompts.log.error(err.message)
      prompts.outro("Done")
      return
    }
    spinner.stop("Upgrade complete")
    prompts.outro("Done")
  },
}
