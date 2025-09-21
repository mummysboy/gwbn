# AWS Transcribe Setup Guide

## Problem Solved

The application was using fallback transcription content instead of real AWS Transcribe service due to missing IAM permissions and incorrect endpoint configuration.

## Changes Made

### 1. Updated IAM Policy (`complete-iam-policy.json`)

Added the following permissions to enable AWS Transcribe and Bedrock:

```json
{
  "Sid": "TranscribeAccess",
  "Effect": "Allow",
  "Action": [
    "transcribe:StartTranscriptionJob",
    "transcribe:GetTranscriptionJob", 
    "transcribe:ListTranscriptionJobs"
  ],
  "Resource": [
    "arn:aws:transcribe:us-west-1:*:transcription-job/gwbn-*"
  ]
},
{
  "Sid": "BedrockAccess",
  "Effect": "Allow",
  "Action": [
    "bedrock:InvokeModel",
    "bedrock:InvokeModelWithResponseStream"
  ],
  "Resource": [
    "arn:aws:bedrock:us-west-1::foundation-model/amazon.titan-text-express-v1",
    "arn:aws:bedrock:us-west-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
  ]
}
```

### 2. Fixed Transcription Endpoint (`src/app/api/transcribe-local/route.ts`)

- Restored the import of `transcribeAudioSimple` from the transcription service
- Updated the endpoint to use the actual AWS Transcribe service instead of fallback content
- The service now tries AWS Transcribe first, then falls back to placeholder content if AWS fails

## Next Steps Required

### 1. Apply IAM Policy to AWS Account

The updated IAM policy needs to be applied to your AWS account. You have several options:

#### Option A: Apply to Amplify Service Role
```bash
# Get your Amplify app ID
aws amplify list-apps

# Update the service role with the new policy
aws iam put-role-policy --role-name AmplifySSRLoggingRole-YOUR_APP_ID --policy-name GWBNTranscribePolicy --policy-document file://complete-iam-policy.json
```

#### Option B: Create New IAM Role
```bash
# Create a new role with the updated policy
aws iam create-role --role-name GWBNTranscribeRole --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name GWBNTranscribeRole --policy-name GWBNTranscribePolicy --policy-document file://complete-iam-policy.json
```

#### Option C: Update via AWS Console
1. Go to AWS IAM Console
2. Find your Amplify service role or create a new role
3. Attach the updated policy from `complete-iam-policy.json`

### 2. Enable AWS Transcribe in Your Region

Make sure AWS Transcribe is available in your region (us-west-1):
1. Go to AWS Transcribe Console
2. Verify the service is available in us-west-1
3. If not available, either:
   - Switch to a supported region (us-east-1, us-west-2)
   - Update the region in your configuration

### 3. Enable AWS Bedrock Models

The AI enhancement feature uses AWS Bedrock. You need to:
1. Go to AWS Bedrock Console
2. Enable the models:
   - `amazon.titan-text-express-v1`
   - `anthropic.claude-3-sonnet-20240229-v1:0`
3. Accept the model usage agreements

### 4. Set Environment Variables

Make sure these environment variables are set in your AWS hosting environment:

```env
AWS_REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
S3_BUCKET_NAME=gwbn-storage
```

### 5. Test the Integration

After applying the IAM policy and enabling the services:

1. **Test Transcription**: Record audio and check if it uses real AWS Transcribe
2. **Test AI Enhancement**: Generate an article and verify it uses AWS Bedrock
3. **Check Logs**: Monitor AWS CloudWatch logs for any remaining errors

## Expected Behavior After Setup

- **Real Transcription**: Audio recordings will be transcribed using AWS Transcribe
- **AI Enhancement**: Articles will be enhanced using AWS Bedrock AI models
- **Fallback Protection**: If AWS services fail, the app gracefully falls back to placeholder content
- **No More 403 Errors**: Proper IAM permissions will resolve authentication issues

## Troubleshooting

If you still see 403 errors after applying the IAM policy:

1. **Check IAM Role**: Verify the role is attached to your Amplify app
2. **Check Region**: Ensure AWS Transcribe is available in your region
3. **Check Model Access**: Verify Bedrock models are enabled in your account
4. **Check Logs**: Review AWS CloudWatch logs for detailed error messages

## Files Modified

- `complete-iam-policy.json` - Added AWS Transcribe and Bedrock permissions
- `src/app/api/transcribe-local/route.ts` - Restored real AWS Transcribe integration
- `src/lib/transcription-service.ts` - Already had the correct AWS Transcribe implementation

The application is now configured to use real AWS services instead of fallback content!
