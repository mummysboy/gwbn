# AWS Hosting 403 Error Troubleshooting Guide

## Problem Analysis

You're experiencing 403 errors on both `/api/transcribe-simple` and `/api/transcribe-direct` endpoints when hosted on AWS. This suggests a platform-specific configuration issue.

## AWS Hosting Platform Identification

First, let's identify which AWS service you're using:

1. **Visit**: `https://your-domain.com/api/diagnostic` 
2. **Check the response** to see which AWS platform is detected

## Common AWS Hosting Platforms & Solutions

### 1. AWS Amplify Hosting

**Problem**: Amplify may have restrictions on API routes or environment variables.

**Solutions**:
```bash
# Check Amplify environment variables
aws amplify get-app --app-id YOUR_APP_ID
aws amplify list-branches --app-id YOUR_APP_ID

# Add environment variables in Amplify Console:
# 1. Go to your Amplify app
# 2. Click "Environment variables" 
# 3. Add: OPENAI_API_KEY = your_key_here
```

**Amplify-specific fixes**:
- Ensure your `next.config.ts` doesn't have conflicting settings
- Check Amplify build logs for errors
- Verify API routes are properly deployed

### 2. AWS Lambda (Serverless)

**Problem**: Lambda may have timeout or memory issues with audio processing.

**Solutions**:
```bash
# Check Lambda function configuration
aws lambda get-function --function-name YOUR_FUNCTION_NAME

# Update Lambda environment variables:
aws lambda update-function-configuration \
  --function-name YOUR_FUNCTION_NAME \
  --environment Variables='{OPENAI_API_KEY=your_key_here}'
```

**Lambda-specific fixes**:
- Increase timeout (audio processing takes time)
- Increase memory allocation
- Check CloudWatch logs for errors

### 3. AWS EC2/ECS

**Problem**: Missing environment variables or IAM permissions.

**Solutions**:
```bash
# Check EC2 instance metadata
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Check ECS task definition
aws ecs describe-task-definition --task-definition YOUR_TASK_DEF
```

**EC2/ECS-specific fixes**:
- Add environment variables to your deployment configuration
- Ensure IAM role has proper permissions
- Check security group rules

### 4. AWS API Gateway + Lambda

**Problem**: API Gateway may be blocking requests or Lambda isn't configured properly.

**Solutions**:
```bash
# Check API Gateway configuration
aws apigateway get-rest-apis
aws apigateway get-resources --rest-api-id YOUR_API_ID
```

## Immediate Fixes to Try

### Fix 1: Environment Variables
Add these to your AWS hosting environment:
```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

### Fix 2: Check IAM Permissions
Ensure your AWS service has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Fix 3: Test with Diagnostic Endpoint
1. Deploy the diagnostic endpoint
2. Visit: `https://your-domain.com/api/diagnostic`
3. Check the response for environment variable status

### Fix 4: Use Client-Side Fallback
The updated VoiceRecorder now includes client-side speech recognition as a fallback when server-side transcription fails.

## Platform-Specific Configuration Files

### For AWS Amplify
Create `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### For AWS Lambda
Update `serverless.yml` or Lambda configuration:
```yaml
functions:
  api:
    handler: src/app/api/transcribe-simple/route.ts
    environment:
      OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    timeout: 30
    memorySize: 1024
```

## Testing Steps

1. **Deploy the diagnostic endpoint**
2. **Check environment variables**: Visit `/api/diagnostic`
3. **Test simple endpoint**: Try `/api/transcribe-simple` 
4. **Test client-side fallback**: The VoiceRecorder will automatically use browser speech recognition if server endpoints fail
5. **Check AWS CloudWatch logs** for detailed error messages

## Emergency Workaround

If all else fails, the VoiceRecorder component now includes client-side speech recognition that works entirely in the browser without requiring any server-side API calls.

## Next Steps

1. Identify your specific AWS hosting platform using the diagnostic endpoint
2. Apply the platform-specific fixes above
3. Test the transcription feature
4. Check AWS CloudWatch logs for any remaining errors

Let me know which AWS platform you're using and I can provide more specific guidance!
