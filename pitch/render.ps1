# Export every slide of a .pptx to PNG through PowerPoint (true rendering) for visual QA.
#   powershell -File pitch/render.ps1 -Deck pitch/Deck.pptx [-Out pitch/render]
param([Parameter(Mandatory = $true)][string]$Deck, [string]$Out = "$PSScriptRoot\render")
$Deck = (Resolve-Path $Deck).Path
New-Item -ItemType Directory -Force $Out | Out-Null
Get-ChildItem $Out -Filter *.png -ErrorAction SilentlyContinue | Remove-Item -Force
$app = New-Object -ComObject PowerPoint.Application
$p = $app.Presentations.Open($Deck, $true, $false, $false)
foreach ($s in $p.Slides) { $s.Export((Join-Path $Out ("slide-{0:D2}.png" -f $s.SlideIndex)), "PNG", 1600, 900) }
$p.Close(); $app.Quit()
Get-ChildItem $Out -Filter *.png | ForEach-Object { $_.FullName }
