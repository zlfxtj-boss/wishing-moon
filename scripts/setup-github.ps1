# Wishing Moon - GitHub Setup Script
# Run this script after creating the GitHub repository

# Instructions:
# 1. Go to https://github.com/new and create a new repository named "wishing-moon"
# 2. Make sure NOT to initialize with README (we already have one)
# 3. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/wishing-moon.git)
# 4. Replace YOUR_GITHUB_USERNAME below and run this script

$githubUsername = "YOUR_GITHUB_USERNAME"
$repoName = "wishing-moon"
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"

Set-Location "$PSScriptRoot\.."

# Add remote
git remote add origin $remoteUrl

# Verify
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "Done! Repository pushed to: $remoteUrl"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to https://vercel.com and log in"
Write-Host "2. Click 'Add New Project'"
Write-Host "3. Import from GitHub"
Write-Host "4. Add environment variables from .env.local"
Write-Host "5. Deploy!"
