<h1 align="center">BCS Code</h1>

<p align="center">
  <img src="assets/readme/bcs-code-banner.png" alt="BCS Code" width="700">
</p>

<p align="center"><strong>Internal trial AI coding agent distribution for BCS.</strong></p>

<p align="center">
  <a href="README.zh.md">中文</a> | English
</p>

<p align="center">
  <a href="https://mimo.xiaomi.com/en/mimocode">Upstream Website</a> | <a href="https://mimo.xiaomi.com/en/blog/mimo-code-long-horizon">Upstream Blog</a>
</p>

---

BCS Code is an internal trial distribution based on Xiaomi MiMoCode, which is itself built from OpenCode. The internal distribution keeps upstream capabilities while applying BCS-specific branding and packaging for controlled evaluation.

BCS Auto is built in as a free-for-limited-time channel, so you can start with zero configuration. BCS Code also supports connecting to any mainstream LLM provider API.

---

## Quick Start

```bash
# Build current-platform binary
cd packages/opencode
OPENCODE_VERSION=0.1.0-bcs.1 ./script/build.ts --single
cd ../..

# Install local binary on Apple Silicon macOS
./install --binary packages/opencode/dist/bcs-code-darwin-arm64/bin/bcs-code

# Planned internal npm registry path
npm install -g @bcs-code/cli
```

Run `bcs-code` after installation. The first launch guides you through configuration automatically. Supported options:
- **BCS Auto (free for a limited time)** — anonymous channel, zero configuration
- **BCS Model Platform** — OAuth login
- **Import from Claude Code** — migrate existing authentication in one step
- **Custom Provider** — add any OpenAI-compatible API in the TUI

---

## Core Features

### Multiple Agents

| Agent | Description |
|--------|------|
| **build** | Default. Full tool permissions for development |
| **plan** | Read-only analysis mode for code exploration and solution design |
| **compose** | Orchestration mode for specs-driven development and skill-driven workflows |

Press `Tab` to switch between primary agents. Subagents are created by the system as needed.

### Persistent Memory

Cross-session memory powered by SQLite FTS5 full-text search:

- **Project memory** (`MEMORY.md`) — persistent project knowledge, rules, and architecture decisions
- **Session checkpoint** (`checkpoint.md`) — structured state snapshots maintained automatically by the checkpoint-writer subagent
- **Scratch notes** (`notes.md`) — temporary note area for agents
- **Task progress** (`tasks/<id>/progress.md`) — per-task logs

Memory is injected automatically when a session resumes, so the agent does not need to relearn project context.

### Intelligent Context Management

- **Automatic checkpoints** — decides when to save session state based on the model context window
- **Context reconstruction** — when context approaches the limit, rebuilds it from the latest checkpoint, project memory, task progress, and retained recent messages so the agent can continue the current task
- **Budgeted injection** — uses a token budget to control how much checkpoint, memory, and notes content enters context, with importance ranking

### Task Tracking

A tree-shaped task system (`T1`, `T1.1`, `T1.2`, …) that integrates automatically with the checkpoint system, so task progress is preserved when sessions resume.

### Subagent System

The primary agent can create subagents on demand. Subagents share the current session context and can work in parallel, with lifecycle tracking, cancellation, and background execution.

### Goal / Stop Condition

The `/goal` command sets a stopping condition for a session. When the agent tries to stop, an independent judge model evaluates the conversation to decide whether the condition is truly satisfied — preventing premature "optimistic stops" during autonomous work.

### Compose Mode

Compose mode provides a structured workflow for specs-driven development. It includes built-in skills for planning, execution, code review, TDD, debugging, verification, and merging — orchestrating the full lifecycle from spec to shipped code.

### Voice Input

Real-time streaming voice input powered by TenVAD and BCS Voice. Activate with `/voice`, then speak — audio is segmented by pauses and transcribed incrementally into the input. Available for BCS logged-in users.

### Dream & Distill

- **`/dream`** — scans recent session traces, extracts persistent knowledge into project memory, and removes outdated entries
- **`/distill`** — discovers repeated manual workflows in recent work and packages high-confidence candidates into reusable skills, subagents, or commands

---

## Configuration

BCS Code uses `bcscode.json` for configuration: `.bcscode/bcscode.json` in the project directory, or `~/.config/bcscode/bcscode.json` globally. Legacy `.mimocode/mimocode.json` and `bcs-code.json` files are still read for compatibility. Key options include:

- Provider and model selection
- Agent permissions and custom agents
- Checkpoint and memory behavior
- MCP server connections
- Keybindings and theme

Max Mode (parallel best-of-N reasoning with judge selection) can be enabled via `experimental.maxMode` in the config.

---

## Development

```bash
bun install              # Install dependencies
bun run dev              # Run in development mode
bun turbo typecheck      # Type check
```

---

## Relationship to Xiaomi MiMoCode and OpenCode

BCS Code is based on Xiaomi MiMoCode, which is built as a fork of [OpenCode](https://github.com/anomalyco/opencode). It keeps the upstream core capabilities (multiple providers, TUI, LSP, MCP, plugins, memory, subagents, compose workflows, and dream/distill) while changing only the internal trial branding and packaging entrypoints.

---

## Community

Scan the QR code to join the community group chat:

<p align="center">
  <img src="assets/readme/community-qrcode-1.jpg" alt="Community group chat QR code 1" width="240">
  &nbsp;&nbsp;
  <img src="assets/readme/community-qrcode-2.jpg" alt="Community group chat QR code 2" width="240">
</p>

---

## License

Source code is licensed under the [MIT License](./LICENSE).

Use of BCS Code is also subject to the [Use Restrictions](./USE_RESTRICTIONS.md).
Use of Xiaomi MiMo-hosted services is subject to the [MiMo Terms of Service](https://platform.xiaomimimo.com/docs/terms/user-agreement).
Use of the MiMo name, logo, and trademarks is subject to the MiMo Trademark Policy.
