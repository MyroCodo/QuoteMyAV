#!/bin/bash
# QuoteMyAV AWS Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "QuoteMyAV Deployment - $ENVIRONMENT"
echo "============================================"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "Error: AWS credentials not configured"
    echo "Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "AWS Account: $AWS_ACCOUNT"
echo "AWS Region: $AWS_REGION"
echo ""

# Step 1: Build the frontend
echo "[1/5] Building frontend..."
cd "$PROJECT_ROOT"
npm run build

# Step 2: Build Lambda function
echo "[2/5] Building Lambda function..."
npm run build:lambda

# Step 3: Deploy CDK infrastructure
echo "[3/5] Deploying CDK infrastructure..."
cd "$PROJECT_ROOT/infra"

# Install CDK dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install
fi

# Bootstrap CDK if needed (first time only)
if ! aws cloudformation describe-stacks --stack-name CDKToolkit > /dev/null 2>&1; then
    echo "Bootstrapping CDK..."
    npx cdk bootstrap aws://$AWS_ACCOUNT/$AWS_REGION
fi

# Deploy all stacks
npx cdk deploy --all --require-approval never -c environment=$ENVIRONMENT

# Step 4: Upload frontend to S3
echo "[4/5] Uploading frontend to S3..."
cd "$PROJECT_ROOT"

# Get S3 bucket name from CDK outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name QuoteMyAV-Frontend-$ENVIRONMENT \
    --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ]; then
    echo "Warning: Could not find S3 bucket name from stack outputs"
    echo "You may need to upload frontend manually"
else
    echo "Uploading to S3 bucket: $BUCKET_NAME"
    aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

    # Invalidate CloudFront cache
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name QuoteMyAV-Frontend-$ENVIRONMENT \
        --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
        --output text 2>/dev/null || echo "")

    if [ -n "$DISTRIBUTION_ID" ]; then
        echo "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id $DISTRIBUTION_ID \
            --paths "/*"
    fi
fi

# Step 5: Run database migrations
echo "[5/5] Database migrations..."
echo "Note: Run migrations manually using the guide at migrations/migrate-from-supabase.md"
echo ""

# Print deployment summary
echo "============================================"
echo "Deployment Complete!"
echo "============================================"

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name QuoteMyAV-Api-$ENVIRONMENT \
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
    --output text 2>/dev/null || echo "Not found")

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name QuoteMyAV-Frontend-$ENVIRONMENT \
    --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" \
    --output text 2>/dev/null || echo "Not found")

echo "API URL: $API_URL"
echo "Frontend URL: https://$CLOUDFRONT_URL"
echo ""
echo "Next steps:"
echo "1. Run database migrations if this is first deployment"
echo "2. Configure DNS in Route 53 (see docs/ops/production-checklist.md)"
echo "3. Test all functionality"
echo "============================================"
