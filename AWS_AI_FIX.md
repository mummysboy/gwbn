# AWS Deployment Setup Guide

This guide will help you resolve the 403 error when using AI features on AWS hosting.

## Problem Analysis

The 403 error occurs because:
1. AWS credentials are not properly configured in the hosting environment
2. IAM permissions are missing or incorrect
3. The OpenAI API key is not accessible via AWS Secrets Manager

## Solution Steps

### 1. Environment Variables Setup

For **AWS Amplify** deployment:
1. Go to your Amplify app dashboard
2. Navigate to "Environment variables" in the left sidebar
3. Add the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
AWS_REGION=us-east-1
```

For **AWS Lambda** deployment:
1. Add environment variables in your Lambda function configuration
2. Or use AWS Systems Manager Parameter Store

For **AWS EC2/ECS** deployment:
1. Add environment variables to your deployment configuration
2. Or use AWS Systems Manager Parameter Store

### 2. IAM Policy Setup

If you're using AWS Secrets Manager (optional), apply the updated IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:DescribeTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/gwbn-articles",
        "arn:aws:dynamodb:us-east-1:*:table/gwbn-users",
        "arn:aws:dynamodb:us-east-1:*:table/gwbn-analytics"
      ]
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

### 3. AWS Secrets Manager Setup (Optional)

If you prefer to store the OpenAI API key in AWS Secrets Manager:

1. Create a secret in AWS Secrets Manager:
   - Name: `gwbn-openai-api-key`
   - Value: `{"apiKey": "your_openai_api_key_here"}`

2. Ensure your hosting service has the IAM permissions above

### 4. Testing the Fix

The application now has two transcription endpoints:
- `/api/transcribe-simple` - Uses environment variable directly (recommended)
- `/api/transcribe-direct` - Uses AWS Secrets Manager (fallback)

The VoiceRecorder component will try the simple endpoint first, then fall back to the direct endpoint.

### 5. Verification Steps

1. Check that `OPENAI_API_KEY` is set in your hosting environment
2. Verify the region matches your AWS resources (`us-east-1`)
3. Test the AI transcription feature
4. Check browser console for any remaining errors

## Quick Fix for Immediate Testing

The simplest solution is to:
1. Add `OPENAI_API_KEY=your_key_here` to your hosting environment variables
2. Redeploy your application
3. Test the AI transcription feature

This will use the `/api/transcribe-simple` endpoint which doesn't require AWS Secrets Manager.

## Troubleshooting

If you still get 403 errors:
1. Check browser network tab for the exact error response
2. Verify environment variables are properly set
3. Check AWS CloudWatch logs for server-side errors
4. Ensure your hosting service has the correct IAM permissions

## Security Notes

- Never commit API keys to your repository
- Use environment variables or AWS Secrets Manager
- Regularly rotate your API keys
- Monitor usage and set up billing alerts

