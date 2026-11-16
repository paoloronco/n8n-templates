param([Parameter(Mandatory=$true)][string]$InputFile,[Parameter(Mandatory=$true)][string]$OutputFile)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$brief=Get-Content -LiteralPath $InputFile -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $voice=$speaker.GetInstalledVoices() | Where-Object {$_.Enabled -and $_.VoiceInfo.Culture.Name -eq $brief.language} | Select-Object -First 1
    if(-not $voice){throw "Install a Windows speech voice for $($brief.language), or choose an installed language."}
    $speaker.SelectVoice($voice.VoiceInfo.Name)
    $speaker.Rate=0
    $speaker.SetOutputToWaveFile($OutputFile)
    $speaker.Speak([string]$brief.narration)
} finally {$speaker.Dispose()}
