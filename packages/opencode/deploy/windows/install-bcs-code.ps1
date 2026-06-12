param(
  [string]$InstallRoot = "$env:LOCALAPPDATA\Programs\BCS Code",
  [string]$WezTermRoot = "$env:LOCALAPPDATA\Programs\WezTerm",
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

function Read-Settings($PackageRoot) {
  $settingsPath = Join-Path $PackageRoot "config\install-settings.json"
  if (!(Test-Path $settingsPath)) {
    throw "Missing install settings: $settingsPath"
  }
  $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
  if (!$settings.baseURL -or $settings.baseURL -like "*your-internal-llm-gateway*") {
    throw "config\install-settings.json still has a placeholder baseURL. Fill it before distributing the package."
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
  Remove-Item $temp -Recurse -Force
  return Join-Path $WezTermRoot "wezterm.exe"
}

function Install-BcsCode($PackageRoot) {
  $source = Join-Path $PackageRoot "payload\bcs-code\bcs-code.exe"
  if (!(Test-Path $source)) {
    throw "Missing payload\bcs-code\bcs-code.exe."
  }

  Write-Step "Installing bcs-code.exe"
  $bin = Join-Path $InstallRoot "bin"
  New-Item -ItemType Directory -Path $bin -Force | Out-Null
  Copy-Item $source (Join-Path $bin "bcs-code.exe") -Force
  return Join-Path $bin "bcs-code.exe"
}

function Write-BcsConfig($Settings) {
  Write-Step "Writing BCS Code model configuration"
  $configDir = Join-Path $env:USERPROFILE ".config\mimocode"
  New-Item -ItemType Directory -Path $configDir -Force | Out-Null

  $providerId = if ($Settings.providerId) { $Settings.providerId } else { "bcs-internal" }
  $providerName = if ($Settings.providerName) { $Settings.providerName } else { "BCS Internal LLM" }
  $smallModel = if ($Settings.smallModel) { $Settings.smallModel } else { $Settings.model }
  $contextWindow = if ($Settings.contextWindow) { [int]$Settings.contextWindow } else { 262144 }
  $outputWindow = if ($Settings.outputWindow) { [int]$Settings.outputWindow } else { 8192 }

  $models = [ordered]@{}
  $models[$Settings.model] = [ordered]@{
    name = if ($Settings.modelName) { $Settings.modelName } else { $Settings.model }
    tool_call = $true
    reasoning = [bool]$Settings.reasoning
    limit = [ordered]@{
      context = $contextWindow
      output = $outputWindow
    }
  }
  if ($smallModel -ne $Settings.model) {
    $models[$smallModel] = [ordered]@{
      name = if ($Settings.smallModelName) { $Settings.smallModelName } else { $smallModel }
      tool_call = $true
      reasoning = [bool]$Settings.smallReasoning
      limit = [ordered]@{
        context = if ($Settings.smallContextWindow) { [int]$Settings.smallContextWindow } else { $contextWindow }
        output = if ($Settings.smallOutputWindow) { [int]$Settings.smallOutputWindow } else { $outputWindow }
      }
    }
  }

  $options = [ordered]@{
    baseURL = $Settings.baseURL
    setCacheKey = $true
  }
  if ($Settings.apiKey) {
    $options["apiKey"] = $Settings.apiKey
    [Environment]::SetEnvironmentVariable("BCS_CODE_API_KEY", [string]$Settings.apiKey, "User")
  }

  $provider = [ordered]@{}
  $provider[$providerId] = [ordered]@{
    name = $providerName
    npm = "@ai-sdk/openai-compatible"
    env = @("BCS_CODE_API_KEY")
    options = $options
    models = $models
  }

  $config = [ordered]@{
    '$schema' = "https://opencode.ai/config.json"
    enabled_providers = @($providerId)
    model = "$providerId/$($Settings.model)"
    small_model = "$providerId/$smallModel"
    provider = $provider
  }

  $config | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $configDir "mimocode.json") -Encoding UTF8
  [Environment]::SetEnvironmentVariable("MIMOCODE_DISABLE_MODELS_FETCH", "1", "User")
  $env:MIMOCODE_DISABLE_MODELS_FETCH = "1"
}

function Write-Launchers($WezTermExe, $BcsCodeExe) {
  Write-Step "Writing launchers"
  $launcher = Join-Path $InstallRoot "Start-BCS-Code.ps1"
  $wezConfig = Join-Path $InstallRoot "wezterm.lua"
  New-Item -ItemType Directory -Path $InstallRoot -Force | Out-Null

  @"
local wezterm = require 'wezterm'

return {
  font_size = 12.0,
  hide_tab_bar_if_only_one_tab = true,
  window_close_confirmation = 'NeverPrompt',
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

  @"
`$ErrorActionPreference = "Stop"
`$env:MIMOCODE_DISABLE_MODELS_FETCH = "1"
`$env:Path = "$((Split-Path $BcsCodeExe -Parent).Replace("`", "``"));$((Split-Path $WezTermExe -Parent).Replace("`", "``"));`$env:Path"
& "$($WezTermExe.Replace("`", "``"))" --config-file "$($wezConfig.Replace("`", "``"))" start --cwd "$env:USERPROFILE" -- "$($BcsCodeExe.Replace("`", "``"))"
"@ | Set-Content $launcher -Encoding UTF8

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
      $shortcut.IconLocation = "$WezTermExe,0"
      $shortcut.Save()
    }
  }
}

if (![Environment]::Is64BitOperatingSystem) {
  throw "This package supports Windows amd64/x64 only."
}

$packageRoot = Resolve-PackageRoot
$settings = Read-Settings $packageRoot
$wezTermExe = Install-WezTerm $packageRoot
$bcsCodeExe = Install-BcsCode $packageRoot
Write-BcsConfig $settings
Write-Launchers $wezTermExe $bcsCodeExe

if (!$SkipPath) {
  Add-UserPath (Split-Path $bcsCodeExe -Parent)
  Add-UserPath (Split-Path $wezTermExe -Parent)
}

Write-Step "Verifying bcs-code version"
& $bcsCodeExe --version
Write-Step "Installation complete. Use the BCS Code desktop shortcut or run bcs-code from a new terminal."
