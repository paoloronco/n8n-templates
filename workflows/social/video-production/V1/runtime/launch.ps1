$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskConfig=if($env:LOCAL_VIDEO_WORKER_CONFIG){$env:LOCAL_VIDEO_WORKER_CONFIG}else{"$PSScriptRoot\worker.local.json"}
if(-not (Test-Path -LiteralPath $taskConfig)){throw 'Copy worker.example.json to worker.local.json or set LOCAL_VIDEO_WORKER_CONFIG to the private configuration path.'}
$taskSettings=Get-Content -LiteralPath $taskConfig -Raw | ConvertFrom-Json
$taskPort=if($taskSettings.port){$taskSettings.port}else{3850}
try { $taskHealth=Invoke-RestMethod -Uri "http://127.0.0.1:$taskPort/health" -TimeoutSec 2; if($taskHealth.ok){Write-Output 'Worker already running.';return} } catch { }
& node "$PSScriptRoot\worker.mjs"
if($LASTEXITCODE -ne 0){throw "Worker exited with code $LASTEXITCODE"}
