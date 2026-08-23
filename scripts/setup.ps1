# Windows wrapper — run from repo root
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if ($args -contains "--live") {
  node scripts/setup.mjs --live
} else {
  node scripts/setup.mjs
}
