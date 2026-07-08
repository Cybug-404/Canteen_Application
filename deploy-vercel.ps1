# Deploy STQC Canteen to Vercel
# Set your token first (from https://vercel.com/account/tokens — NOT the OAuth client id):
#   $env:VERCEL_TOKEN = "your_token_here"
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $env:VERCEL_TOKEN) {
  Write-Host "Set VERCEL_TOKEN to your Vercel personal access token (Account Settings -> Tokens)."
  Write-Host "The value starting with cl_ is an OAuth client id and cannot be used for CLI deploy."
  exit 1
}

npm run vercel-build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx vercel deploy --prod --yes --scope kirans-projects-10ace2c8 --archive=tgz --token $env:VERCEL_TOKEN
