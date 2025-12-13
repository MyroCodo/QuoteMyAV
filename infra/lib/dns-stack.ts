import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface DnsStackProps extends cdk.StackProps {
  distribution: cloudfront.Distribution;
  api: apigateway.RestApi;
  domainName: string;
}

export class DnsStack extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    // Look up existing hosted zone (must be created manually or via separate stack)
    // If you don't have a hosted zone yet, you'll need to create one in Route 53
    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    });

    // SSL Certificate (must be in us-east-1 for CloudFront)
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: props.domainName,
      subjectAlternativeNames: [`*.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    // A record for apex domain (quotemyav.com)
    new route53.ARecord(this, 'ApexRecord', {
      zone: this.hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'QuoteMyAV website',
    });

    // A record for www subdomain
    new route53.ARecord(this, 'WwwRecord', {
      zone: this.hostedZone,
      recordName: `www.${props.domainName}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'QuoteMyAV website (www)',
    });

    // AAAA records for IPv6
    new route53.AaaaRecord(this, 'ApexRecordIPv6', {
      zone: this.hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
    });

    new route53.AaaaRecord(this, 'WwwRecordIPv6', {
      zone: this.hostedZone,
      recordName: `www.${props.domainName}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
    });

    // API subdomain (optional - if using api.quotemyav.com)
    new route53.ARecord(this, 'ApiRecord', {
      zone: this.hostedZone,
      recordName: `api.${props.domainName}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(props.api)
      ),
      comment: 'QuoteMyAV API',
    });

    // Outputs
    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route 53 Hosted Zone ID',
      exportName: `${this.stackName}-HostedZoneId`,
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN',
      exportName: `${this.stackName}-CertificateArn`,
    });

    new cdk.CfnOutput(this, 'WebsiteDomain', {
      value: `https://${props.domainName}`,
      description: 'Production website URL',
      exportName: `${this.stackName}-WebsiteDomain`,
    });
  }
}
