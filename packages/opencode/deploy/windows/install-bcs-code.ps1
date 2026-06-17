param(
  [string]$InstallRoot = "$env:LOCALAPPDATA\Programs\BCS Code",
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

  if ($null -eq $settings.autoInstallWezTerm) {
    $settings | Add-Member -NotePropertyName autoInstallWezTerm -NotePropertyValue $true
  } else {
    $settings.autoInstallWezTerm = [bool]$settings.autoInstallWezTerm
  }
  return $settings
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

function Print-WezTermNotice($PackageRoot) {
  $zip = Get-ChildItem (Join-Path $PackageRoot "payload\wezterm") -Filter "WezTerm-windows-*.zip" | Select-Object -First 1
  if ($zip) {
    Write-Step "WezTerm package is included for manual install: $($zip.Name)"
    Write-Host "If you want GUI launch, extract payload\wezterm\$($zip.Name) manually and point to wezterm.exe."
    Write-Host "The default installer in this package only installs bcs-code.exe."
  }
}

function Resolve-ConfigDirectory() {
  if ($env:BCS_CODE_HOME) {
    return Join-Path $env:BCS_CODE_HOME "config"
  }
  if ($env:MIMOCODE_HOME) {
    return Join-Path $env:MIMOCODE_HOME "config"
  }
  if ($env:XDG_CONFIG_HOME) {
    return Join-Path $env:XDG_CONFIG_HOME "mimocode"
  }
  if ($env:APPDATA) {
    return Join-Path $env:APPDATA ".config\mimocode"
  }
  return Join-Path $env:USERPROFILE "AppData\Roaming\.config\mimocode"
}

function Write-BcsConfig($Settings) {
  Write-Step "Writing BCS Code model configuration"
  $configDir = Resolve-ConfigDirectory
  New-Item -ItemType Directory -Path $configDir -Force | Out-Null
  Write-Step "Config directory: $configDir"

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
      attachment = $true
      reasoning = [bool]$Reasoning
      modalities = [ordered]@{
        input = @("text", "image")
        output = @("text")
      }
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

if (![Environment]::Is64BitOperatingSystem) {
  throw "This package supports Windows amd64/x64 only."
}

$packageRoot = Resolve-PackageRoot
$settings = Read-Settings $packageRoot
$settings.autoInstallWezTerm = [bool]$settings.autoInstallWezTerm
if ($settings.autoInstallWezTerm) {
  Write-Warning "autoInstallWezTerm is enabled in settings, but this installer intentionally skips automatic WezTerm installation."
}
$bcsCodeExe = Install-BcsCode $packageRoot
Write-BcsConfig $settings
Print-WezTermNotice $packageRoot

if (!$SkipPath) {
  Add-UserPath (Split-Path $bcsCodeExe -Parent)
}

Write-Step "Verifying bcs-code version"
& $bcsCodeExe --version
Write-Step "Installation complete. Use command line: bcs-code"
