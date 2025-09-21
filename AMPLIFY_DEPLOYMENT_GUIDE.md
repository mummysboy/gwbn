# AWS Amplify Deployment Guide

## Prerequisites

1. **AWS Account with proper permissions**
2. **AWS CLI configured** with appropriate credentials
3. **Environment variables set up** in Amplify console

## Required AWS Services & Permissions

### 1. AWS Bedrock
- **Service**: Amazon Bedrock
- **Required Permissions**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ],
        "Resource": "*"
      }
    ]
  }
  ```

### 2. AWS Transcribe
- **Service**: Amazon Transcribe
- **Required Permissions**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "transcribe:StartTranscriptionJob",
          "transcribe:GetTranscriptionJob",
          "transcribe:ListTranscriptionJobs"
        ],
        "Resource": "*"
      }
    ]
  }
  ```

### 3. AWS S3
- **Service**: Amazon S3 (for audio file storage)
- **Required Permissions**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::gwbn-storage/*"
      }
    ]
  }
  ```

## Environment Variables for Amplify

Set these in your Amplify console under **Environment variables**:

### Required Variables:
```
AWS_REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
NEXT_PUBLIC_S3_BUCKET_NAME=gwbn-storage
NEXT_PUBLIC_S3_REGION=us-west-1
```

### Optional Variables:
```
NEXT_PUBLIC_APP_NAME=Golden West Business News
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Deployment Steps

### 1. Prepare AWS Resources
```bash
# Create S3 bucket for audio storage
aws s3 mb s3://gwbn-storage --region us-west-1

# Enable Bedrock models (if not already enabled)
# Go to AWS Bedrock console and enable required models
```

### 2. Deploy to Amplify
```bash
# Initialize Amplify (if not already done)
amplify init

# Add hosting
amplify add hosting

# Configure build settings
amplify configure project

# Deploy
amplify publish
```

### 3. Set Environment Variables in Amplify Console
1. Go to your Amplify app in AWS Console
2. Navigate to **Environment variables**
3. Add all required variables listed above
4. Redeploy the app

## Testing on Amplify

### 1. Verify API Endpoints
Test these endpoints after deployment:
- `https://your-app.amplifyapp.com/api/generate-article-working`
- `https://your-app.amplifyapp.com/api/transcribe-local`
- `https://your-app.amplifyapp.com/api/test-bedrock`

### 2. Test AI Enhancement Feature
1. Navigate to admin page: `https://your-app.amplifyapp.com/admin`
2. Record a voice message
3. Click "Generate Article" button
4. Verify content appears in the form

## Troubleshooting

### Common Issues:

1. **403 Forbidden Errors**
   - Check AWS permissions
   - Verify environment variables are set correctly
   - Ensure Bedrock models are enabled in your AWS account

2. **API Routes Not Working**
   - Check Amplify build logs
   - Verify Next.js configuration
   - Ensure all dependencies are installed

3. **AWS SDK Errors**
   - Verify AWS credentials
   - Check region configuration
   - Ensure required AWS services are available in your region

### Debug Endpoints:
- `/api/debug-aws` - Test AWS connectivity
- `/api/test-bedrock` - Test Bedrock access
- `/api/env-check` - Check environment variables

## Fallback Behavior

The application is designed to work even if AWS services are unavailable:
- **AI Enhancement**: Falls back to local content generation
- **Transcription**: Falls back to placeholder transcripts
- **No external API dependencies**: Everything works offline

## Cost Considerations

- **AWS Bedrock**: Pay-per-use pricing for AI model invocations
- **AWS Transcribe**: Pay-per-minute for audio transcription
- **AWS S3**: Minimal storage costs for audio files
- **Amplify Hosting**: Free tier available for small projects

## Security Notes

- Never commit AWS credentials to version control
- Use IAM roles with minimal required permissions
- Enable CloudTrail for API call logging
- Consider using AWS Secrets Manager for sensitive data