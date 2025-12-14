# Script to download audio from YouTube
# Requires yt-dlp (install with: pip install yt-dlp)

$youtubeUrl = "https://www.youtube.com/watch?v=_IcH8afC_D8"
$outputPath = "client\public\audio\background-music.mp3"

# Create audio directory if it doesn't exist
if (-not (Test-Path "client\public\audio")) {
    New-Item -ItemType Directory -Path "client\public\audio" -Force
}

Write-Host "Downloading audio from YouTube..."
Write-Host "URL: $youtubeUrl"
Write-Host "Output: $outputPath"
Write-Host ""
Write-Host "To download, you need to install yt-dlp first:"
Write-Host "  pip install yt-dlp"
Write-Host ""
Write-Host "Then run:"
Write-Host "  yt-dlp -x --audio-format mp3 -o `"$outputPath`" $youtubeUrl"

