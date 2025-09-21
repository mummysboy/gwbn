# AWS Amplify Environment Variables

Set these environment variables in your Amplify console under **Environment variables**:

```
NEXT_PUBLIC_APP_NAME=Golden West Business News
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
AWS_REGION=us-west-1
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
NEXT_PUBLIC_S3_BUCKET_NAME=gwbn-storage
NEXT_PUBLIC_S3_REGION=us-west-1
ENABLE_BEDROCK=true
ENABLE_TRANSCRIBE=true
ENABLE_S3_UPLOAD=true
```

## Required AWS Credentials

**Important**: Set these in Amplify console (not in this file):

```
ACCESS_KEY_ID=your_actual_access_key_here
SECRET_ACCESS_KEY=your_actual_secret_key_here
```

## AWS Services Required

1. **Amazon Bedrock**: Enable required models in your AWS account
2. **Amazon Transcribe**: Ensure service is available in us-west-1
3. **Amazon S3**: Create bucket named 'gwbn-storage' in us-west-1
4. **AWS Secrets Manager**: Optional, for secure credential storage

## IAM Permissions Required

Your AWS user/role needs these permissions:
- `bedrock:InvokeModel`
- `transcribe:StartTranscriptionJob`
- `transcribe:GetTranscriptionJob`
- `s3:PutObject`
- `s3:GetObject`
- `secretsmanager:GetSecretValue` (if using Secrets Manager)

## Testing

After deployment, test these endpoints:
- `/api/test-env-complete` - Test environment configuration
- `/api/test-bedrock` - Test Bedrock connectivity
- `/api/debug-aws` - Test AWS services
