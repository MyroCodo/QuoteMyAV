# DNS Cutover Guide - QuoteMyAV

## Overview

This guide documents the process for cutting over DNS from Vercel to AWS for quotemyav.com.

## Pre-Cutover Checklist

### 1. Verify AWS Infrastructure
- [ ] All CDK stacks deployed successfully
- [ ] CloudFront distribution is working (test via distribution URL)
- [ ] API Gateway is responding (test via invoke URL)
- [ ] Lambda functions are executing correctly
- [ ] RDS database is accessible and migrated
- [ ] Cognito user pool is configured
- [ ] ACM certificates are issued and validated

### 2. Test Everything
- [ ] Frontend loads correctly from CloudFront
- [ ] User registration works via Cognito
- [ ] User login works via Cognito
- [ ] Quote creation works (API → RDS)
- [ ] AI quote generation works (Claude API)
- [ ] PDF export works
- [ ] Email sending works (SES)

### 3. Prepare Rollback
- [ ] Document current Vercel DNS settings
- [ ] Keep Vercel deployment active
- [ ] Have Supabase credentials handy
- [ ] Set DNS TTL to 5 minutes (300 seconds) 24 hours before cutover

---

## DNS Records to Change

### Current State (Vercel)
```
quotemyav.com           A      76.76.21.21  (Vercel)
www.quotemyav.com       CNAME  cname.vercel-dns.com
```

### Target State (AWS)
```
quotemyav.com           A      ALIAS to CloudFront distribution
www.quotemyav.com       CNAME  ALIAS to CloudFront distribution
api.quotemyav.com       CNAME  ALIAS to API Gateway custom domain
```

---

## Cutover Process

### Step 1: Lower DNS TTL (24 hours before)
If using external DNS provider:
1. Log in to your DNS provider
2. Find the A record for quotemyav.com
3. Change TTL from 3600 (or higher) to 300 seconds
4. Wait 24 hours for propagation

### Step 2: Create Route 53 Hosted Zone (if not already done)
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name quotemyav.com \
    --caller-reference "quotemyav-$(date +%s)"

# Get the nameservers from the output
# Update your domain registrar to use these nameservers
```

### Step 3: Get AWS Resource IDs
```bash
# Get CloudFront distribution domain
aws cloudformation describe-stacks \
    --stack-name QuoteMyAV-Frontend-production \
    --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" \
    --output text

# Get API Gateway custom domain
aws cloudformation describe-stacks \
    --stack-name QuoteMyAV-Api-production \
    --query "Stacks[0].Outputs[?OutputKey=='CustomDomainName'].OutputValue" \
    --output text
```

### Step 4: Create DNS Records in Route 53
```bash
# Create A record for apex domain (quotemyav.com)
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "quotemyav.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "YOUR_CLOUDFRONT_DOMAIN.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }]
    }'

# Create CNAME for www subdomain
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "www.quotemyav.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "YOUR_CLOUDFRONT_DOMAIN.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }]
    }'

# Create CNAME for API subdomain
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "api.quotemyav.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "YOUR_API_GATEWAY_HOSTED_ZONE",
            "DNSName": "YOUR_API_GATEWAY_DOMAIN.execute-api.us-east-1.amazonaws.com",
            "EvaluateTargetHealth": false
          }
        }
      }]
    }'
```

### Step 5: Verify DNS Propagation
```bash
# Check DNS resolution
dig quotemyav.com
dig www.quotemyav.com
dig api.quotemyav.com

# Or use online tools:
# - https://dnschecker.org
# - https://www.whatsmydns.net
```

### Step 6: Verify Site Functionality
1. Open https://quotemyav.com in browser
2. Check Network tab for any mixed content warnings
3. Test user registration
4. Test user login
5. Test quote creation
6. Test AI generation
7. Test PDF export

### Step 7: Monitor
- Watch CloudWatch metrics and alarms
- Monitor error rates in API Gateway
- Check Lambda function logs
- Monitor RDS connections and performance

---

## Rollback Procedure

If issues are detected during cutover:

### Quick Rollback (< 5 minutes)
```bash
# Delete Route 53 records (revert to registrar DNS)
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch '{
      "Changes": [{
        "Action": "DELETE",
        "ResourceRecordSet": {
          "Name": "quotemyav.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "YOUR_CLOUDFRONT_DOMAIN.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }]
    }'
```

### Full Rollback
1. Update domain registrar nameservers back to original
2. Restore original DNS records pointing to Vercel
3. Switch frontend .env to use Supabase auth
4. Redeploy frontend to Vercel

---

## Post-Cutover Tasks

### Day 1
- [ ] Monitor error rates and latency
- [ ] Verify all functionality works
- [ ] Check user feedback channels
- [ ] Verify email delivery

### Day 2-7
- [ ] Keep Vercel deployment running (standby)
- [ ] Monitor for any edge cases
- [ ] Address any reported issues
- [ ] Monitor costs

### Day 8+
- [ ] Decommission Vercel deployment
- [ ] Remove Supabase fallback code
- [ ] Update documentation
- [ ] Remove unused secrets

---

## Contacts

- **On-call Engineer:** [Your contact info]
- **AWS Support:** https://console.aws.amazon.com/support
- **Domain Registrar:** [Your registrar contact]

---

## Timeline

| Time | Action |
|------|--------|
| T-24h | Lower DNS TTL to 300s |
| T-1h | Final testing on staging |
| T-0 | Begin DNS cutover |
| T+5m | Verify DNS propagation starting |
| T+15m | First functionality tests |
| T+30m | Full functionality verification |
| T+1h | Monitor metrics |
| T+24h | First stability check |
| T+7d | Consider decommissioning Vercel |
