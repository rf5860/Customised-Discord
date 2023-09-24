# ╔═══════════════════════════════╗
# ║  Discord Modification Script  ║
# ╚═══════════════════════════════╝
# Powershell Script to use Custom CSS with Discord.
# { Variables
$nodeJsVersion = "v20.6.0"
$nodeJsDownloadUrl = "https://nodejs.org/dist/$nodeJsVersion/node-$nodeJsVersion-x64.msi"
$jsFile = "mainScreen.js"
$asarFile = "core.asar"
$unpackDir = "unpacked"
$customDiscordDir = "$ENV:USERPROFILE\Downloads\custom_discord"
$patchText = "restoreMainWindowBounds\(mainWindow\);"
# }
# { Helper Functions
function InsertPatchText {
  param (
      [Parameter(Mandatory=$true)]
      [string]$FilePath,

      [Parameter(Mandatory=$true)]
      [string]$PatchFilePath,

      [Parameter(Mandatory=$true)]
      [string]$MatchText
  )

  # Read the text to insert from the patch file
  $textToInsert = Get-Content -Path $PatchFilePath -Raw

  # Ensure that new lines are appended before and after the patch text
  $textToInsert = "`n" + $textToInsert + "`n"

  # Read the contents of the file
  $fileContent = Get-Content -Path $FilePath

  # Initialize an array to hold the updated contents
  $newContent = @()

  # Process each line of the file
  foreach ($line in $fileContent) {
      # Add the current line to the updated contents
      $newContent += $line
      
      # Check if the line contains the specified text
      if ($line -match $MatchText) {
          $lineNumber = $fileContent.IndexOf($line)
          Write-Host "Patching at line number: $lineNumber"
          # Add the new text after the matching line
          $newContent += $textToInsert
      }
  }

  # Write the updated contents back to the file
  $newContent | Set-Content -Path $FilePath
}

#}
#   ┌──────────────────────────┐
#  {│  Install Pre-Requisites  │
#   └──────────────────────────┘
Write-Host "Installing Pre-Requisites" -ForegroundColor Magenta
Write-Host "Installing NodeJS and NPM" -ForegroundColor Yellow

Write-Host "Downloading NodeJS from $nodeJsDownloadUrl" -ForegroundColor Blue
Invoke-WebRequest -Uri $nodeJsDownloadUrl -OutFile "node-$nodeJsVersion-x64.msi"

Write-Output "Starting NodeJS installer..."
Start-Process -Wait -FilePath ".\node-v20.6.0-x64.msi"
Remove-Item ".\node-v20.6.0-x64.msi"

Set-Alias npm "C:\Program Files\nodejs\npm"

Write-Host "NPM is installed. Continuing..." -ForegroundColor Green
#  }
#   ┌────────────────┐
#  {│  Install asar  │
#   └────────────────┘
Write-Host "Installing asar" -ForegroundColor Blue
npm install -g asar
#   ┌──────────────────┐
#  {│  Change Discord  │
#   └──────────────────┘
Write-Host "Patching Discord" -ForegroundColor Magenta
Write-Host "Extracting Resources" -ForegroundColor Yellow

$discordLocation = "$ENV:LocalAppData\Discord"
Write-Host "Changing to Discord folder: " -NoNewline
Write-Host $discordLocation -ForegroundColor Blue

Set-Location $discordLocation

Write-Host "Locating " -NoNewline
Write-Host $asarFile -ForegroundColor Yellow

Set-Location (Get-ChildItem -Recurse -Filter "$asarFile").DirectoryName
$currentLocation = Get-Location
Write-Host "Found " -NoNewline
Write-Host $asarFile -ForegroundColor Yellow -NoNewline
Write-Host " at " -NoNewline
Write-Host $currentLocation -ForegroundColor Blue

Write-Host "Extracting $asarFile to ./$unpackDir" -ForegroundColor Yellow
& "$ENV:APPDATA\npm\asar.cmd" extract $asarFile ./$unpackDir

Write-Host "Backing up "
Write-Host $asarFile -ForegroundColor Yellow -NoNewline
Write-Host " to "
Write-Host $currentLocation -ForegroundColor Blue -NoNewline

Copy-Item -Path "./$asarFile" -Destination "./$asarFile.bak"

Write-Host "Copying custom files from " -NoNewline
Write-Host $customDiscordDir -ForegroundColor Blue -NoNewline
Write-Host " to " -NoNewline
Write-Host $discordLocation -ForegroundColor Magenta

Copy-Item -Path $customDiscordDir -Destination $discordLocation -Recurse

Write-Host "Backing up " -NoNewline
Write-Host $jsFile -ForegroundColor Yellow -NoNewline
Write-Host " to " -NoNewline
Write-Host "./$unpackDir/app/$jsFile.bak" -ForegroundColor Blue

Copy-Item -Path "./$unpackDir/app/$jsFile" -Destination "./$unpackDir/app/$jsFile.bak"

$installDir = "$ENV:LocalAppData/Discord/custom_discord"
Write-Host "Applying patch to " -NoNewline
Write-Host "./$unpackDir/app/$jsFile" -ForegroundColor Yellow

$patchFile  = "$installDir/customDiscord.patch.js"
InsertPatchText -FilePath ./$unpackDir/app/$jsFile -PatchFilePath $patchFile -MatchText $patchText

Write-Host "Repackaging $asarFile" -ForegroundColor Blue
asar pack unpacked "./$asarFile"
Write-Host "Done!" -ForegroundColor Magenta
# }