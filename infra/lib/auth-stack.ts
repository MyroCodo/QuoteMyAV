import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  isProd: boolean;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const envPrefix = props.isProd ? 'prod' : 'dev';

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'QuoteMyAVUserPool', {
      userPoolName: `quotemyav-users-${envPrefix}`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        company: new cognito.StringAttribute({ mutable: true }),
        tier: new cognito.StringAttribute({ mutable: true }),
        stripeCustomerId: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      // Email configuration
      email: cognito.UserPoolEmail.withCognito('noreply@quotemyav.com'),
      // Deletion protection
      deletionProtection: props.isProd,
      removalPolicy: props.isProd
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Domain (for hosted UI)
    this.userPoolDomain = this.userPool.addDomain('QuoteMyAVDomain', {
      cognitoDomain: {
        domainPrefix: `quotemyav-${envPrefix}`,
      },
    });

    // App Client for Web Application
    this.userPoolClient = this.userPool.addClient('QuoteMyAVWebClient', {
      userPoolClientName: 'quotemyav-web',
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: props.isProd
          ? ['https://quotemyav.com/auth/callback', 'https://www.quotemyav.com/auth/callback']
          : [
              'http://localhost:5173/auth/callback',
              'http://localhost:5174/auth/callback',
              'http://localhost:5175/auth/callback',
              'http://localhost:5176/auth/callback',
            ],
        logoutUrls: props.isProd
          ? ['https://quotemyav.com', 'https://www.quotemyav.com']
          : ['http://localhost:5173', 'http://localhost:5174'],
      },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      preventUserExistenceErrors: true,
      generateSecret: false, // Public client (SPA)
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${this.stackName}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${this.stackName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: this.userPoolDomain.domainName,
      description: 'Cognito User Pool Domain',
      exportName: `${this.stackName}-UserPoolDomain`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
      exportName: `${this.stackName}-UserPoolArn`,
    });
  }
}
