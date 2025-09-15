# AWS Bedrock Setup Guide

This guide will help you set up AWS Bedrock for the Golden West Business News application, replacing OpenAI with AWS Bedrock for AI-powered article generation.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured or IAM role with Bedrock access
3. Bedrock models enabled in your AWS account

## Step 1: Enable Bedrock Models

Before using Bedrock, you need to enable the models in your AWS account:

1. Go to the AWS Bedrock console: https://console.aws.amazon.com/bedrock/
2. Navigate to "Model access" in the left sidebar
3. Request access to the following models:
   - **Anthropic Claude 3 Sonnet** (recommended for article generation)
   - **Anthropic Claude 3 Haiku** (faster, cheaper alternative)
   - **Amazon Titan** (if you prefer Amazon's models)

## Step 2: Configure IAM Permissions

Your AWS user/role needs the following permissions:

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
            "Resource": [
                "arn:aws:bedrock:us-west-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
                "arn:aws:bedrock:us-west-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "transcribe:StartTranscriptionJob",
                "transcribe:GetTranscriptionJob",
                "transcribe:ListTranscriptionJobs"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::gwbn-storage/*",
                "arn:aws:s3:::gwbn-storage/transcriptions/*"
            ]
        }
    ]
}
```

## Step 3: Environment Configuration

Update your `.env.local` file with the following:

```bash
# AWS Configuration
AWS_REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here

# Bedrock Configuration
BEDROCK_MODEL_ID=amazon.titan-text-express-v1

# S3 Configuration (for transcription)
NEXT_PUBLIC_S3_BUCKET_NAME=gwbn-storage
NEXT_PUBLIC_S3_REGION=us-west-1
```

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test Bedrock connectivity:
   ```bash
   curl http://localhost:3000/api/test-bedrock
   ```

3. Test AWS Transcribe connectivity:
   ```bash
   curl http://localhost:3000/api/test-transcribe
   ```

## Step 5: Deploy to Production

### For AWS Amplify:

1. Add environment variables in Amplify console:
   - `AWS_REGION`: us-west-1
   - `BEDROCK_MODEL_ID`: anthropic.claude-3-sonnet-20240229-v1:0
   - `ACCESS_KEY_ID`: your production access key
   - `SECRET_ACCESS_KEY`: your production secret key

2. Update your IAM role to include Bedrock permissions

### For Vercel:

1. Add environment variables in Vercel dashboard
2. Ensure your deployment has access to AWS services

## Available Models

The application supports the following Bedrock models:

### Anthropic Claude Models:
- `anthropic.claude-3-sonnet-20240229-v1:0` (Recommended - Best quality)
- `anthropic.claude-3-haiku-20240307-v1:0` (Faster, cheaper)

### Amazon Titan Models:
- `amazon.titan-text-express-v1` (Amazon's model)

## Troubleshooting

### Common Issues:

1. **"AccessDenied" errors**: Ensure Bedrock models are enabled in your AWS account
2. **"Model not found"**: Check the model ID is correct and enabled
3. **"Region not supported"**: Ensure you're using a supported region (us-west-1, us-east-1, etc.)

### Testing Commands:

```bash
# Test Bedrock connection
curl http://localhost:3000/api/test-bedrock

# Test article generation
curl -X POST http://localhost:3000/api/generate-article \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Test interview transcript", "notes": "Test notes"}'

# Test transcription
curl -X POST http://localhost:3000/api/test-transcribe
```

## Cost Considerations

- **Claude 3 Sonnet**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Claude 3 Haiku**: ~$0.00025 per 1K input tokens, ~$0.00125 per 1K output tokens
- **AWS Transcribe**: ~$0.024 per minute of audio

## Migration from OpenAI

The application has been updated to use Bedrock instead of OpenAI:

- ✅ Article generation now uses Claude 3 Sonnet
- ✅ Transcription uses AWS Transcribe (with S3 integration)
- ✅ Fallback mechanisms for reliability
- ✅ Local development support

## Support

If you encounter issues:

1. Check AWS CloudTrail for detailed error logs
2. Verify IAM permissions are correctly configured
3. Ensure Bedrock models are enabled in your account
4. Test with the provided API endpoints

For additional help, refer to the AWS Bedrock documentation: https://docs.aws.amazon.com/bedrock/
