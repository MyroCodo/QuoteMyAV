import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  isProd: boolean;
  vpc: ec2.Vpc;
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly secret: secretsmanager.ISecret;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Security group for RDS
    this.securityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for QuoteMyAV RDS',
      allowAllOutbound: false,
    });

    // Allow inbound from Lambda security group (will be added by API stack)
    // For now, allow from VPC CIDR
    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from VPC'
    );

    // Create the database credentials secret
    this.secret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `quotemyav/${props.isProd ? 'prod' : 'dev'}/database`,
      description: 'QuoteMyAV RDS PostgreSQL credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'quotemyav_admin',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    // RDS PostgreSQL instance
    this.database = new rds.DatabaseInstance(this, 'QuoteMyAVDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        props.isProd ? ec2.InstanceSize.SMALL : ec2.InstanceSize.MICRO
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.securityGroup],
      databaseName: 'quotemyav',
      credentials: rds.Credentials.fromSecret(this.secret),

      // Storage configuration
      allocatedStorage: props.isProd ? 100 : 20,
      maxAllocatedStorage: props.isProd ? 500 : 50, // Auto-scaling
      storageType: props.isProd ? rds.StorageType.GP3 : rds.StorageType.GP2,

      // High availability
      multiAz: props.isProd,

      // Backup configuration
      backupRetention: props.isProd ? cdk.Duration.days(7) : cdk.Duration.days(1),
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'Sun:04:00-Sun:05:00',

      // Performance and monitoring
      enablePerformanceInsights: props.isProd,
      performanceInsightRetention: props.isProd
        ? rds.PerformanceInsightRetention.DEFAULT
        : undefined,
      cloudwatchLogsExports: ['postgresql'],

      // Deletion protection
      deletionProtection: props.isProd,
      removalPolicy: props.isProd
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,

      // Parameter group for tuning
      parameterGroup: new rds.ParameterGroup(this, 'ParameterGroup', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_15,
        }),
        parameters: {
          'log_statement': 'all',
          'log_min_duration_statement': '1000', // Log queries > 1 second
        },
      }),
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'RDS endpoint hostname',
      exportName: `${this.stackName}-Endpoint`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.secret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${this.stackName}-SecretArn`,
    });
  }
}
