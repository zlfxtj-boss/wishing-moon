# Vercel Setup for Wishing Moon
# Run after GitHub repo is set up

Write-Host "Vercel Setup for Wishing Moon"
Write-Host "================================"
Write-Host ""

# Check if Vercel CLI is installed
$v = vercel --version 2>$null
if ($v) {
    Write-Host "Vercel CLI installed: $v"
} else {
    Write-Host "Installing Vercel CLI..."
    npm install -g vercel
}

Write-Host ""
Write-Host "Steps:"
Write-Host "1. Run 'vercel login' to log in to Vercel"
Write-Host "2. Run 'vercel' in the project directory"
Write-Host "3. Follow the prompts to link to GitHub"
Write-Host "4. Add these environment variables in Vercel dashboard:"
Write-Host ""
Write-Host "   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url"
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key"
Write-Host ""
Write-Host "5. After first deploy, run 'vercel --prod' for production"
Write-Host ""
