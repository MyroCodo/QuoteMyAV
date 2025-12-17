import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ApiStackProps extends cdk.StackProps {
  isProd: boolean;
  vpc: ec2.Vpc;
  database: rds.DatabaseInstance;
  databaseSecret: secretsmanager.ISecret;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const envPrefix = props.isProd ? 'prod' : 'dev';

    // Security group for Lambda
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for QuoteMyAV Lambda',
      allowAllOutbound: true,
    });
    // Note: Database security group already allows PostgreSQL from VPC CIDR

    // Create secrets for API keys
    const anthropicSecret = new secretsmanager.Secret(this, 'AnthropicSecret', {
      secretName: `quotemyav/${envPrefix}/anthropic`,
      description: 'Anthropic API key for Claude',
    });

    const stripeSecret = new secretsmanager.Secret(this, 'StripeSecret', {
      secretName: `quotemyav/${envPrefix}/stripe`,
      description: 'Stripe API keys',
    });

    // Lambda function for API
    this.apiFunction = new lambda.Function(this, 'ApiFunction', {
      functionName: `quotemyav-api-${envPrefix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      memorySize: props.isProd ? 1024 : 512,
      timeout: cdk.Duration.seconds(30),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: props.isProd
          ? ec2.SubnetType.PRIVATE_WITH_EGRESS
          : ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        NODE_ENV: props.isProd ? 'production' : 'development',
        DATABASE_SECRET_ARN: props.databaseSecret.secretArn,
        ANTHROPIC_SECRET_ARN: anthropicSecret.secretArn,
        STRIPE_SECRET_ARN: stripeSecret.secretArn,
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
        AWS_REGION_NAME: this.region,
        APP_URL: props.isProd ? 'https://quotemyav.com' : 'http://localhost:5173',
        SES_SENDER_EMAIL: 'quotes@quotemyav.com',
        SES_SENDER_NAME: 'QuoteMyAV',
      },
      logRetention: logs.RetentionDays.TWO_WEEKS,
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant Lambda access to secrets
    props.databaseSecret.grantRead(this.apiFunction);
    anthropicSecret.grantRead(this.apiFunction);
    stripeSecret.grantRead(this.apiFunction);

    // Grant Lambda SES permissions
    this.apiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );

    // API Gateway REST API
    this.api = new apigateway.RestApi(this, 'QuoteMyAVApi', {
      restApiName: `quotemyav-api-${envPrefix}`,
      description: `QuoteMyAV REST API - ${envPrefix}`,
      deployOptions: {
        stageName: 'v1',
        throttlingBurstLimit: props.isProd ? 500 : 100,
        throttlingRateLimit: props.isProd ? 100 : 20,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: !props.isProd,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: props.isProd
          ? ['https://quotemyav.com', 'https://www.quotemyav.com']
          : apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-API-Key',
          'X-Request-Id',
          'Idempotency-Key',
        ],
        exposeHeaders: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
          'X-Quota-Limit',
          'X-Quota-Used',
          'X-Quota-Reset',
          'X-Request-Id',
        ],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Cognito Authorizer
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [props.userPool],
        identitySource: 'method.request.header.Authorization',
      }
    );

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(this.apiFunction, {
      proxy: true,
    });

    // Health check endpoint (no auth)
    const healthResource = this.api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    // Proxy all other routes to Lambda with optional auth
    // Hono.js will handle routing internally
    const proxyResource = this.api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', lambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    // Note: OPTIONS is automatically handled by defaultCorsPreflightOptions above

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${this.stackName}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'ApiFunctionArn', {
      value: this.apiFunction.functionArn,
      description: 'API Lambda function ARN',
      exportName: `${this.stackName}-FunctionArn`,
    });

    new cdk.CfnOutput(this, 'AnthropicSecretArn', {
      value: anthropicSecret.secretArn,
      description: 'Anthropic API key secret ARN (set value in console)',
      exportName: `${this.stackName}-AnthropicSecretArn`,
    });

    new cdk.CfnOutput(this, 'StripeSecretArn', {
      value: stripeSecret.secretArn,
      description: 'Stripe API key secret ARN (set value in console)',
      exportName: `${this.stackName}-StripeSecretArn`,
    });

    // Export API Rest ID for cross-stack reference (used by Frontend stack)
    new cdk.CfnOutput(this, 'ApiRestId', {
      value: this.api.restApiId,
      description: 'API Gateway REST API ID',
      exportName: `${this.stackName}-ApiRestId`,
    });
  }
}
