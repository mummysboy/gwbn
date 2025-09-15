# Transcription API 403 Error Troubleshooting Guide

## Problem Summary
You're experiencing 403 errors on transcription endpoints (`/api/transcribe-simple`, `/api/transcribe-direct`, `/api/transcribe-fallback`) when hosted on AWS. This indicates a permissions or configuration issue.

## Quick Diagnosis

### Step 1: Check Environment Variables
Visit your deployed site and go to: `https://your-domain.com/api/diagnostic`

This will show you:
- Which AWS platform you're using (Amplify, Lambda, EC2, etc.)
- Which environment variables are set/missing
- Platform-specific configuration

### Step 2: Check OpenAI API Key
The most common cause of 403 errors is missing `OPENAI_API_KEY`. Ensure it's set in your AWS environment.

## Platform-Specific Solutions

### AWS Amplify Hosting

**Problem**: Amplify may not have the environment variables configured.

**Solution**:
1. Go to AWS Amplify Console
2. Select your app
3. Go to "Environment variables" in the left sidebar
4. Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
5. Redeploy your app

**Amplify Build Configuration** (`amplify.yml`):
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

### AWS Lambda (Serverless)

**Problem**: Lambda function may not have the environment variables or proper permissions.

**Solution**:
1. Go to AWS Lambda Console
2. Find your function
3. Go to "Configuration" → "Environment variables"
4. Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
5. Update IAM role with the permissions from `complete-iam-policy.json`

**Lambda Configuration**:
- Timeout: 30 seconds (audio processing takes time)
- Memory: 1024 MB minimum
- Environment variables: `OPENAI_API_KEY`

### AWS EC2/ECS

**Problem**: Missing environment variables or IAM role permissions.

**Solution**:
1. Add environment variables to your deployment configuration
2. Ensure IAM role has permissions from `complete-iam-policy.json`
3. Check security group allows outbound HTTPS traffic

## Required Environment Variables

Make sure these are set in your AWS environment:

```env
# Required for transcription
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration
REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here

# Or use IAM roles instead of access keys
ROLE_ARN=arn:aws:iam::account:role/role-name
WEB_IDENTITY_TOKEN_FILE=/path/to/token/file
```

## Required IAM Permissions

Your AWS service needs these permissions (see `complete-iam-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:*:secret:gwbn-openai-api-key*"
      ]
    }
  ]
}
```

## Testing Steps

1. **Check diagnostic endpoint**: Visit `/api/diagnostic`
2. **Test simple endpoint**: Try `/api/transcribe-simple` with a small audio file
3. **Check AWS CloudWatch logs** for detailed error messages
4. **Verify OpenAI API key** is valid and has credits

## Emergency Workaround

If server-side transcription continues to fail, the VoiceRecorder component includes client-side speech recognition that works entirely in the browser without requiring any server-side API calls.

## Common Error Messages

- **403 Forbidden**: Missing environment variables or IAM permissions
- **500 Internal Server Error**: OpenAI API key invalid or network issues
- **Timeout**: Lambda function timeout (increase timeout to 30 seconds)

## Next Steps

1. Identify your AWS platform using `/api/diagnostic`
2. Apply platform-specific fixes above
3. Test transcription feature
4. Check AWS CloudWatch logs for any remaining errors

## Getting Help

If you continue to experience issues:
1. Check AWS CloudWatch logs for detailed error messages
2. Verify your OpenAI API key is valid and has credits
3. Ensure your AWS service has the required IAM permissions
4. Test with a simple audio file first

The diagnostic endpoint at `/api/diagnostic` will provide specific information about your AWS environment to help identify the exact issue.
