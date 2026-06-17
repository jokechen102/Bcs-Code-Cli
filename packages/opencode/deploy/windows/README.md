# Windows 内网分发说明（BCS Code）

这个目录用于构建 Windows 安装包，面向内网快速发放。当前版本特性：

- 打包为 Windows x64 zip：`bcs-code-windows-amd64-<version>.zip`
- 安装脚本默认**只安装 `bcs-code.exe`** 并写入 `mimocode.json`
- 不会自动安装 WezTerm；把 WezTerm zip 放在包里，作为可选手动安装项放入用户
- 安装完成后直接从命令行使用 `bcs-code`

## 1) 制作安装包（仅 Windows）

从 `Bcs-Code-Cli` 仓库根目录执行：

```bash
cd /Users/joke/Documents/repo/bcs/Bcs-Code-Cli

BCS_CODE_FULL_BASE_URL=http://100.89.126.33:8008/v1 \
BCS_CODE_MODEL=dsv4 \
BCS_CODE_SMALL_BASE_URL=http://100.115.100.130:30279/8a620da96ee846738ddc72414be2c712/v1 \
BCS_CODE_SMALL_MODEL=Qwen-3.6-27B \
OPENCODE_VERSION=0.1.0-bcs.5 \
BCS_CODE_AUTO_INSTALL_WEZTERM=0 \
./script/package-windows-internal.ts
```

说明：`BCS_CODE_AUTO_INSTALL_WEZTERM=0` 表示打出的包里不自动执行 WezTerm 安装。

## 2) 安装包里包含什么

- `payload/bcs-code/bcs-code.exe`：主程序
- `payload/wezterm/WezTerm-windows-*.zip`：WezTerm 官方安装包（可选）
- `install-bcs-code.ps1` / `install-bcs-code.cmd`：安装脚本
- `config/install-settings.json`：用于生成用户模型配置
- `README.md`：本说明

## 3) 安装方式

解压 zip 后，进入包目录运行：

```powershell
./install-bcs-code.cmd
```

安装后会完成：

- 把 `bcs-code.exe` 放到 `%LOCALAPPDATA%\Programs\BCS Code\bin`
- 在用户环境变量 PATH 中加入该目录（可直接 `bcs-code`）
- 写入命令行配置目录下的 `mimocode.json`（通常是 `%APPDATA%\.config\mimocode\mimocode.json`，若设置了 `BCS_CODE_HOME` / `MIMOCODE_HOME` / `XDG_CONFIG_HOME` 则按对应路径）

重开命令行后执行：

```powershell
bcs-code --version
```

## 4) WezTerm 使用建议（不自动安装）

如果用户希望用 GUI 终端体验，建议安装 WezTerm：

1. 解压 `payload\wezterm\WezTerm-windows-*.zip`
2. 把 `wezterm.exe` 放到固定目录（例如 `%LOCALAPPDATA%\Programs\BCS Code\wezterm\`）
3. 直接运行 WezTerm，传参启动 `bcs-code.exe`

当前安装脚本已故意简化，不会替用户自动安装 WezTerm，避免分发环境权限/策略不一致导致失败。

## 5) 可选参数（不自动安装也可继续）

可在打包前环境变量里覆盖：

- `BCS_CODE_FULL_PROVIDER_ID`、`BCS_CODE_FULL_PROVIDER_NAME`
- `BCS_CODE_SMALL_PROVIDER_ID`、`BCS_CODE_SMALL_PROVIDER_NAME`
- `BCS_CODE_MODEL_NAME`、`BCS_CODE_SMALL_MODEL_NAME`
- `BCS_CODE_CONTEXT_WINDOW`、`BCS_CODE_OUTPUT_WINDOW`
- `BCS_CODE_SMALL_API_KEY`

```bash
BCS_CODE_SMALL_API_KEY=your_key ./script/package-windows-internal.ts
```

如不设置 API key，安装时会提示输入一次并写入用户环境变量。
如需分发，避免在文档里直接写真实 API key。

## 6) 图片附件支持（`empty output` 问题修复）

安装脚本会为 full/small 模型自动写入：

- `attachment: true`
- `modalities.input` 含 `text`、`image`
- `modalities.output` 含 `text`

因此用户在 BCS Code 中上传图片后不应再出现 `reason=empty output auto-continuing invalid output` 的误判。

## 7) 额外排查（需要逐步复现）

如果你改了配置后仍报 `empty output`，可以临时打开附件追踪日志：

```powershell
$env:BCS_CODE_TRACE_ATTACHMENTS = "1"
bcs-code --log-level DEBUG --print-logs
```

然后在同一会话里发一次“带图提问”，在日志里重点看：

- `provider transform summary`：是否在变换前后保留了 `image`/`file` 部分。
- `capability`：`input.image`、`attachment`、`providerID` 是否与你期望一致。
- `provider transform output`：发送到模型前的 `messageCount`、`userMessages` 是否正常。

关掉追踪可直接取消环境变量：`$env:BCS_CODE_TRACE_ATTACHMENTS = "0"` 或新开一个终端。

## 8) 仍然空输出？先抓 OpenAI 原始 SSE（本地 Proxy）

`--log-level DEBUG` 只打印 OpenCode 自身日志，不保证会 dump OpenAI 原始请求/响应体。  
如果你要确认 `bcs-code` 收到的是不是你说的那两包流，建议先加一层本地代理，强制先走这层再转发到真实 API。

启动代理（`Bcs-Code-Cli/packages/opencode/trace-openai-proxy.py`）：

```bash
cd /Users/joke/Documents/repo/bcs/Bcs-Code-Cli/packages/opencode
pip install fastapi uvicorn httpx

export OPENAI_UPSTREAM="https://你的真实接口域名/v1"
uvicorn trace-openai-proxy:app --host 127.0.0.1 --port 18080
```

然后改一次配置把 provider baseURL 指向本地代理：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "vl": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "VL Logging Proxy",
      "options": {
        "baseURL": "http://127.0.0.1:18080",
        "apiKey": "{env:VL_API_KEY}"
      },
      "models": {
        "qwen-vl-max": {
          "name": "Qwen VL Max",
          "attachment": true,
          "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
        }
      }
    }
  }
}
```

跑一遍：

```bash
bcs-code --log-level DEBUG --print-logs run -m vl/qwen-vl-max "只回复 OK"
```

代理窗口要重点看是否有：
- `POST /v1/chat/completions` 的 request body（`stream: true`）
- `data:` 包里是否有 `delta.content`（而不是只看到 `reasoning`、`output_text` 之类）
- `[DONE]` 后是否有完整 `choices[0].finish_reason`
- 当网关返回 `System message must be at the beginning.` 时，优先看 `proxy` 输出里的 `MESSAGE_ROLES:`：若出现 `system` 且不是第 0 位，说明前置系统提示被插到后面了。

如果代理看到 `delta.content = "图片"`，但 `bcs-code` 日志仍报 `auto-continuing invalid output`，下一步优先看：
- `processor` 里 `text-start`/`text-delta`/`text-end` 是否出现；
- `partSummary` 阶段最终保留的 `text` 长度；
- `experimental.text.complete` 插件是否把非空文本改为空。
