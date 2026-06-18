param(
  [string]$InstallRoot = "$env:LOCALAPPDATA\Programs\BCS Code",
  [string]$WezTermRoot = "$env:LOCALAPPDATA\Programs\BCS Code\wezterm",
  [switch]$SkipShortcut,
  [switch]$SkipPath
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host "[BCS Code] $Message"
}

function Resolve-PackageRoot {
  if ($PSScriptRoot) {
    return (Resolve-Path $PSScriptRoot).Path
  }
  return (Resolve-Path ".").Path
}

function Add-UserPath($PathToAdd) {
  $current = [Environment]::GetEnvironmentVariable("Path", "User")
  $parts = @()
  if ($current) {
    $parts = $current.Split(";") | Where-Object { $_ -and $_.Trim() }
  }
  if ($parts | Where-Object { $_.TrimEnd("\") -ieq $PathToAdd.TrimEnd("\") }) {
    return
  }
  [Environment]::SetEnvironmentVariable("Path", (($parts + $PathToAdd) -join ";"), "User")
  $env:Path = (($env:Path.Split(";") + $PathToAdd) | Where-Object { $_ -and $_.Trim() } | Select-Object -Unique) -join ";"
}

function Remove-DirectoryBestEffort($PathToRemove) {
  if (!(Test-Path $PathToRemove)) {
    return
  }
  foreach ($attempt in 1..3) {
    Remove-Item $PathToRemove -Recurse -Force -ErrorAction SilentlyContinue
    if (!(Test-Path $PathToRemove)) {
      return
    }
    Start-Sleep -Milliseconds (250 * $attempt)
  }
  Write-Warning "Could not remove temporary directory: $PathToRemove. You can delete it later."
}

function Read-Settings($PackageRoot) {
  $settingsPath = Join-Path $PackageRoot "config\install-settings.json"
  if (!(Test-Path $settingsPath)) {
    throw "Missing install settings: $settingsPath"
  }
  $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
  $fullBaseURL = if ($settings.fullBaseURL) { $settings.fullBaseURL } else { $settings.baseURL }
  $smallBaseURL = if ($settings.smallBaseURL) { $settings.smallBaseURL } else { $fullBaseURL }
  if (!$fullBaseURL -or $fullBaseURL -like "*your-internal-llm-gateway*") {
    throw "config\install-settings.json still has a placeholder fullBaseURL/baseURL. Fill it before distributing the package."
  }
  if (!$smallBaseURL -or $smallBaseURL -like "*your-internal-llm-gateway*") {
    throw "config\install-settings.json still has a placeholder smallBaseURL. Fill it before distributing the package."
  }
  if (!$settings.model) {
    throw "config\install-settings.json must define model."
  }
  return $settings
}

function Install-WezTerm($PackageRoot) {
  $zip = Get-ChildItem (Join-Path $PackageRoot "payload\wezterm") -Filter "WezTerm-windows-*.zip" | Select-Object -First 1
  if (!$zip) {
    throw "Missing WezTerm Windows zip under payload\wezterm."
  }

  Write-Step "Installing WezTerm from $($zip.Name)"
  $temp = Join-Path $env:TEMP ("bcs-code-wezterm-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $temp -Force | Out-Null
  Expand-Archive -Path $zip.FullName -DestinationPath $temp -Force
  $weztermExe = Get-ChildItem $temp -Recurse -Filter "wezterm.exe" | Select-Object -First 1
  if (!$weztermExe) {
    throw "WezTerm archive did not contain wezterm.exe."
  }

  if (Test-Path $WezTermRoot) {
    Remove-Item $WezTermRoot -Recurse -Force
  }
  New-Item -ItemType Directory -Path $WezTermRoot -Force | Out-Null
  Copy-Item (Join-Path $weztermExe.DirectoryName "*") $WezTermRoot -Recurse -Force
  Remove-DirectoryBestEffort $temp
  return Join-Path $WezTermRoot "wezterm.exe"
}

function Install-BcsCode($PackageRoot) {
  $sourceDir = Join-Path $PackageRoot "payload\bcs-code"
  $source = Join-Path $sourceDir "bcs-code.exe"
  if (!(Test-Path $source)) {
    throw "Missing payload\bcs-code\bcs-code.exe."
  }

  Write-Step "Installing bcs-code.exe"
  $bin = Join-Path $InstallRoot "bin"
  New-Item -ItemType Directory -Path $bin -Force | Out-Null
  Copy-Item (Join-Path $sourceDir "*") $bin -Force
  return Join-Path $bin "bcs-code.exe"
}

function Write-BcsConfig($Settings) {
  Write-Step "Writing BCS Code model configuration"
  $configDir = Join-Path $env:USERPROFILE ".config\mimocode"
  New-Item -ItemType Directory -Path $configDir -Force | Out-Null

  function ConvertFrom-SecureStringPlainText($Secure) {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try {
      return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  }

  function New-ModelConfig($Name, $Reasoning, $ContextWindow, $OutputWindow) {
    return [ordered]@{
      name = $Name
      tool_call = $true
      reasoning = [bool]$Reasoning
      limit = [ordered]@{
        context = [int]$ContextWindow
        output = [int]$OutputWindow
      }
    }
  }

  function Resolve-ApiKey($ApiKey, $EnvKey, $Required, $Label) {
    if ($ApiKey) {
      [Environment]::SetEnvironmentVariable($EnvKey, [string]$ApiKey, "User")
      [Environment]::SetEnvironmentVariable($EnvKey, [string]$ApiKey, "Process")
      return [string]$ApiKey
    }
    if ([Environment]::GetEnvironmentVariable($EnvKey, "User")) {
      return [Environment]::GetEnvironmentVariable($EnvKey, "User")
    }
    if ([Environment]::GetEnvironmentVariable($EnvKey, "Process")) {
      return [Environment]::GetEnvironmentVariable($EnvKey, "Process")
    }
    if (!$Required) {
      return ""
    }

    $secure = Read-Host "Enter API key for $Label" -AsSecureString
    $plain = ConvertFrom-SecureStringPlainText $secure
    if (!$plain) {
      throw "API key is required for $Label."
    }
    [Environment]::SetEnvironmentVariable($EnvKey, $plain, "User")
    [Environment]::SetEnvironmentVariable($EnvKey, $plain, "Process")
    return $plain
  }

  function New-ProviderConfig($Name, $BaseURL, $EnvKey, $ApiKey, $ApiKeyRequired, $Models) {
    $resolvedApiKey = Resolve-ApiKey $ApiKey $EnvKey $ApiKeyRequired $Name
    $options = [ordered]@{
      baseURL = $BaseURL
      setCacheKey = $true
    }
    if ($resolvedApiKey) {
      $options["apiKey"] = "{env:$EnvKey}"
    }

    $config = [ordered]@{
      name = $Name
      npm = "@ai-sdk/openai-compatible"
      options = $options
      models = $Models
    }
    if ($resolvedApiKey) {
      $config["env"] = @($EnvKey)
    }
    return $config
  }

  $fullProviderId = if ($Settings.fullProviderId) { $Settings.fullProviderId } elseif ($Settings.providerId) { $Settings.providerId } else { "bcs-full" }
  $smallProviderId = if ($Settings.smallProviderId) { $Settings.smallProviderId } else { "bcs-lite" }
  $fullProviderName = if ($Settings.fullProviderName) { $Settings.fullProviderName } elseif ($Settings.providerName) { $Settings.providerName } else { "BCS Full Model" }
  $smallProviderName = if ($Settings.smallProviderName) { $Settings.smallProviderName } else { "BCS Lite Model" }
  $fullBaseURL = if ($Settings.fullBaseURL) { $Settings.fullBaseURL } else { $Settings.baseURL }
  $smallBaseURL = if ($Settings.smallBaseURL) { $Settings.smallBaseURL } else { $fullBaseURL }
  $fullApiKey = if ($Settings.fullApiKey) { $Settings.fullApiKey } else { $Settings.apiKey }
  $smallApiKey = if ($Settings.smallApiKey) { $Settings.smallApiKey } else { $fullApiKey }
  $fullEnvKey = if ($Settings.fullApiKeyEnv) { $Settings.fullApiKeyEnv } else { "BCS_CODE_FULL_API_KEY" }
  $smallEnvKey = if ($Settings.smallApiKeyEnv) { $Settings.smallApiKeyEnv } else { "BCS_CODE_SMALL_API_KEY" }
  $fullApiKeyRequired = [bool]$Settings.fullApiKeyRequired
  $smallApiKeyRequired = [bool]$Settings.smallApiKeyRequired
  $smallModel = if ($Settings.smallModel) { $Settings.smallModel } else { $Settings.model }
  $contextWindow = if ($Settings.contextWindow) { [int]$Settings.contextWindow } else { 262144 }
  $outputWindow = if ($Settings.outputWindow) { [int]$Settings.outputWindow } else { 8192 }
  $smallContextWindow = if ($Settings.smallContextWindow) { [int]$Settings.smallContextWindow } else { $contextWindow }
  $smallOutputWindow = if ($Settings.smallOutputWindow) { [int]$Settings.smallOutputWindow } else { $outputWindow }
  $fullModelName = if ($Settings.modelName) { $Settings.modelName } else { $Settings.model }
  $smallModelName = if ($Settings.smallModelName) { $Settings.smallModelName } else { $smallModel }

  $provider = [ordered]@{}
  $fullModels = [ordered]@{}
  $fullModels[$Settings.model] = New-ModelConfig $fullModelName $Settings.reasoning $contextWindow $outputWindow

  if ($fullProviderId -eq $smallProviderId) {
    if ($smallModel -ne $Settings.model) {
      $fullModels[$smallModel] = New-ModelConfig $smallModelName $Settings.smallReasoning $smallContextWindow $smallOutputWindow
    }
    $provider[$fullProviderId] = New-ProviderConfig $fullProviderName $fullBaseURL $fullEnvKey $fullApiKey $fullApiKeyRequired $fullModels
  } else {
    $smallModels = [ordered]@{}
    $smallModels[$smallModel] = New-ModelConfig $smallModelName $Settings.smallReasoning $smallContextWindow $smallOutputWindow
    $provider[$fullProviderId] = New-ProviderConfig $fullProviderName $fullBaseURL $fullEnvKey $fullApiKey $fullApiKeyRequired $fullModels
    $provider[$smallProviderId] = New-ProviderConfig $smallProviderName $smallBaseURL $smallEnvKey $smallApiKey $smallApiKeyRequired $smallModels
  }

  $config = [ordered]@{
    '$schema' = "https://opencode.ai/config.json"
    enabled_providers = @($provider.Keys)
    model = "$fullProviderId/$($Settings.model)"
    small_model = "$smallProviderId/$smallModel"
    provider = $provider
  }

  $config | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $configDir "mimocode.json") -Encoding UTF8
  [Environment]::SetEnvironmentVariable("BCS_CODE_DISABLE_MODELS_FETCH", "1", "User")
  [Environment]::SetEnvironmentVariable("MIMOCODE_DISABLE_MODELS_FETCH", "1", "User")
  $env:BCS_CODE_DISABLE_MODELS_FETCH = "1"
  $env:MIMOCODE_DISABLE_MODELS_FETCH = "1"
}

function Write-Launchers($WezTermExe, $BcsCodeExe, $Settings) {
  Write-Step "Writing launchers"
  $launcher = Join-Path $InstallRoot "Start-BCS-Code.ps1"
  $wezConfig = Join-Path $InstallRoot "wezterm.lua"
  New-Item -ItemType Directory -Path $InstallRoot -Force | Out-Null
  $fullEnvKey = if ($Settings.fullApiKeyEnv) { $Settings.fullApiKeyEnv } else { "BCS_CODE_FULL_API_KEY" }
  $smallEnvKey = if ($Settings.smallApiKeyEnv) { $Settings.smallApiKeyEnv } else { "BCS_CODE_SMALL_API_KEY" }
  $wezTermAvailable = $WezTermExe -and (Test-Path $WezTermExe)

  function ConvertTo-PowerShellLiteral($Value) {
    return "'" + ([string]$Value).Replace("'", "''") + "'"
  }

  if ($wezTermAvailable) {
    @"
local wezterm = require 'wezterm'

return {
  font_size = 12.0,
  hide_tab_bar_if_only_one_tab = true,
  window_close_confirmation = 'NeverPrompt',
  front_end = 'Software',
  prefer_egl = true,
  colors = {
    foreground = '#F4F4F6',
    background = '#0F1013',
    cursor_bg = '#EF3434',
    cursor_fg = '#FFFFFF',
    selection_bg = '#C92128',
    selection_fg = '#FFFFFF',
  },
}
"@ | Set-Content $wezConfig -Encoding UTF8
  }

  $pathPrefix = if ($wezTermAvailable) {
    (Split-Path $BcsCodeExe -Parent) + ";" + (Split-Path $WezTermExe -Parent)
  } else {
    Split-Path $BcsCodeExe -Parent
  }
  $launchBcsCode = @(
    "`$launcherLog = Join-Path `$PSScriptRoot 'start-bcs-code.log'",
    'try {',
    "  if (`$args.Count -gt 0) {",
    "    & $(ConvertTo-PowerShellLiteral $BcsCodeExe) @args",
    '  } else {',
    "    & $(ConvertTo-PowerShellLiteral $BcsCodeExe)",
    '  }',
    '  `$exitCode = `$LASTEXITCODE',
    '  if (`$exitCode -ne 0) {',
    '    `$message = "BCS Code exited with code $exitCode"',
    '    Add-Content -Path `$launcherLog -Value ((Get-Date -Format o) + " " + `$message)',
    '    Write-Warning `$message',
    '    Write-Warning "Check log: $launcherLog"',
    '    [void][Console]::ReadLine()',
    '  }',
    '}',
    'catch {',
    '  `$message = "BCS Code launch failed: $($_.Exception.Message)"',
    '  Add-Content -Path `$launcherLog -Value ((Get-Date -Format o) + " " + `$message)',
    '  Write-Warning `$message',
    '  Write-Warning "Check log: $launcherLog"',
    '  [void][Console]::ReadLine()',
    '}'
  )
  $startCommands = if ($wezTermAvailable) {
    @(
      "& $(ConvertTo-PowerShellLiteral $WezTermExe) --config-file $(ConvertTo-PowerShellLiteral $wezConfig) start --cwd `$env:USERPROFILE -- $(ConvertTo-PowerShellLiteral $BcsCodeExe)"
      "if (`$LASTEXITCODE -ne 0) {"
      "  Write-Warning 'WezTerm failed to start. Falling back to the console launcher.'"
    ) + $launchBcsCode + @(
      "}"
    )
  } else {
    $launchBcsCode
  }

  (
  @(
    '$ErrorActionPreference = "Stop"'
    '$env:BCS_CODE_DISABLE_MODELS_FETCH = "1"'
    '$env:MIMOCODE_DISABLE_MODELS_FETCH = "1"'
    "`$fullApiKey = [Environment]::GetEnvironmentVariable($(ConvertTo-PowerShellLiteral $fullEnvKey), 'User')"
    "if (`$fullApiKey) { [Environment]::SetEnvironmentVariable($(ConvertTo-PowerShellLiteral $fullEnvKey), `$fullApiKey, 'Process') }"
    "`$smallApiKey = [Environment]::GetEnvironmentVariable($(ConvertTo-PowerShellLiteral $smallEnvKey), 'User')"
    "if (`$smallApiKey) { [Environment]::SetEnvironmentVariable($(ConvertTo-PowerShellLiteral $smallEnvKey), `$smallApiKey, 'Process') }"
    "`$env:Path = $(ConvertTo-PowerShellLiteral $pathPrefix) + ';' + `$env:Path"
    ) + $startCommands
  ) | Set-Content $launcher -Encoding UTF8

  $cmd = Join-Path $InstallRoot "BCS Code.cmd"
  @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%LOCALAPPDATA%\Programs\BCS Code\Start-BCS-Code.ps1" %*
"@ | Set-Content $cmd -Encoding ASCII

  if (!$SkipShortcut) {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $startMenu = Join-Path ([Environment]::GetFolderPath("Programs")) "BCS Code"
    New-Item -ItemType Directory -Path $startMenu -Force | Out-Null
    foreach ($shortcutPath in @((Join-Path $desktop "BCS Code.lnk"), (Join-Path $startMenu "BCS Code.lnk"))) {
      $shell = New-Object -ComObject WScript.Shell
      $shortcut = $shell.CreateShortcut($shortcutPath)
      $shortcut.TargetPath = "powershell.exe"
      $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
      $shortcut.WorkingDirectory = $env:USERPROFILE
      $shortcut.IconLocation = if ($wezTermAvailable) { "$WezTermExe,0" } else { "$BcsCodeExe,0" }
      $shortcut.Save()
    }
  }
}

if (![Environment]::Is64BitOperatingSystem) {
  throw "This package supports Windows amd64/x64 only."
}

$packageRoot = Resolve-PackageRoot
$settings = Read-Settings $packageRoot
$wezTermExe = ""
try {
  $wezTermExe = Install-WezTerm $packageRoot
} catch {
  Write-Warning "WezTerm installation failed: $($_.Exception.Message)"
  Write-Warning "Continuing with BCS Code console launcher."
}
$bcsCodeExe = Install-BcsCode $packageRoot
Write-BcsConfig $settings
Write-Launchers $wezTermExe $bcsCodeExe $settings

if (!$SkipPath) {
  Add-UserPath (Split-Path $bcsCodeExe -Parent)
}

Write-Step "Verifying bcs-code version"
& $bcsCodeExe --version
Write-Step "Installation complete. Use the BCS Code desktop shortcut or run bcs-code from a new terminal."
