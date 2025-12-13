# QuoteMyAV AWS Deployment Script (PowerShell)
# Usage: .\scripts\deploy.ps1 -Environment staging|production

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "QuoteMyAV Deployment - $Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
    $AwsAccount = $identity.Account
} catch {
    Write-Host "Error: AWS credentials not configured" -ForegroundColor Red
    Write-Host "Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
}

$AwsRegion = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "AWS Account: $AwsAccount"
Write-Host "AWS Region: $AwsRegion"
Write-Host ""

# Step 1: Build the frontend
Write-Host "[1/5] Building frontend..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Step 2: Build Lambda function
Write-Host "[2/5] Building Lambda function..." -ForegroundColor Yellow
npm run build:lambda
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Step 3: Deploy CDK infrastructure
Write-Host "[3/5] Deploying CDK infrastructure..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\infra"

# Install CDK dependencies if needed
if (-not (Test-Path "node_modules")) {
    npm install
}

# Bootstrap CDK if needed (first time only)
$cdkToolkit = aws cloudformation describe-stacks --stack-name CDKToolkit 2>$null
if (-not $cdkToolkit) {
    Write-Host "Bootstrapping CDK..."
    npx cdk bootstrap "aws://$AwsAccount/$AwsRegion"
}

# Deploy all stacks
npx cdk deploy --all --require-approval never -c environment=$Environment
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Step 4: Upload frontend to S3
Write-Host "[4/5] Uploading frontend to S3..." -ForegroundColor Yellow
Set-Location $ProjectRoot

# Get S3 bucket name from CDK outputs
try {
    $stackOutputs = aws cloudformation describe-stacks `
        --stack-name "QuoteMyAV-Frontend-$Environment" `
        --query "Stacks[0].Outputs" | ConvertFrom-Json

    $BucketName = ($stackOutputs | Where-Object { $_.OutputKey -eq "BucketName" }).OutputValue
    $DistributionId = ($stackOutputs | Where-Object { $_.OutputKey -eq "DistributionId" }).OutputValue
} catch {
    $BucketName = $null
    $DistributionId = $null
}

if ($BucketName) {
    Write-Host "Uploading to S3 bucket: $BucketName"
    aws s3 sync dist/ "s3://$BucketName/" --delete

    if ($DistributionId) {
        Write-Host "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
    }
} else {
    Write-Host "Warning: Could not find S3 bucket name from stack outputs" -ForegroundColor Yellow
    Write-Host "You may need to upload frontend manually"
}

# Step 5: Database migrations note
Write-Host "[5/5] Database migrations..." -ForegroundColor Yellow
Write-Host "Note: Run migrations manually using the guide at migrations/migrate-from-supabase.md"
Write-Host ""

# Print deployment summary
Write-Host "============================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Get API Gateway URL
try {
    $apiStackOutputs = aws cloudformation describe-stacks `
        --stack-name "QuoteMyAV-Api-$Environment" `
        --query "Stacks[0].Outputs" | ConvertFrom-Json

    $ApiUrl = ($apiStackOutputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue
} catch {
    $ApiUrl = "Not found"
}

# Get CloudFront URL
try {
    $CloudFrontUrl = ($stackOutputs | Where-Object { $_.OutputKey -eq "DistributionDomainName" }).OutputValue
} catch {
    $CloudFrontUrl = "Not found"
}

Write-Host "API URL: $ApiUrl"
Write-Host "Frontend URL: https://$CloudFrontUrl"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run database migrations if this is first deployment"
Write-Host "2. Configure DNS in Route 53 (see docs/ops/production-checklist.md)"
Write-Host "3. Test all functionality"
Write-Host "============================================" -ForegroundColor Green
