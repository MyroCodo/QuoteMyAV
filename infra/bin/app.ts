#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { DatabaseStack } from '../lib/database-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { DnsStack } from '../lib/dns-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';
const isProd = environment === 'prod';

// Stack naming convention
const stackPrefix = `QuoteMyAV-${environment}`;

// Common tags for all resources
const commonTags = {
  Project: 'QuoteMyAV',
  Environment: environment,
  ManagedBy: 'CDK',
};

// AWS environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// 1. VPC Stack - Network foundation
const vpcStack = new VpcStack(app, `${stackPrefix}-VPC`, {
  env,
  isProd,
  tags: commonTags,
});

// 2. Database Stack - RDS PostgreSQL
const databaseStack = new DatabaseStack(app, `${stackPrefix}-Database`, {
  env,
  isProd,
  vpc: vpcStack.vpc,
  tags: commonTags,
});
databaseStack.addDependency(vpcStack);

// 3. Auth Stack - Cognito User Pool
const authStack = new AuthStack(app, `${stackPrefix}-Auth`, {
  env,
  isProd,
  tags: commonTags,
});

// 4. API Stack - Lambda + API Gateway
const apiStack = new ApiStack(app, `${stackPrefix}-API`, {
  env,
  isProd,
  vpc: vpcStack.vpc,
  database: databaseStack.database,
  databaseSecret: databaseStack.secret,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  tags: commonTags,
});
apiStack.addDependency(vpcStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(authStack);

// 5. Frontend Stack - S3 + CloudFront
const frontendStack = new FrontendStack(app, `${stackPrefix}-Frontend`, {
  env,
  isProd,
  api: apiStack.api,
  tags: commonTags,
});
frontendStack.addDependency(apiStack);

// 6. DNS Stack - Route 53 + ACM (only in prod with domain)
if (isProd) {
  const dnsStack = new DnsStack(app, `${stackPrefix}-DNS`, {
    env,
    distribution: frontendStack.distribution,
    api: apiStack.api,
    domainName: 'quotemyav.com',
    tags: commonTags,
  });
  dnsStack.addDependency(frontendStack);
}

app.synth();
