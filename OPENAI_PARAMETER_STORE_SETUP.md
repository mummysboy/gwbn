# OpenAI Integration Setup Guide - Parameter Store

This guide explains how to securely configure OpenAI API access in your AWS-hosted Golden West Business News application using AWS Systems Manager Parameter Store.

## Overview

The application uses AWS Systems Manager Parameter Store to securely store the OpenAI API key, which is then accessed by Lambda functions at runtime. This approach ensures:

- ✅ Secrets are encrypted at rest using AWS KMS
- ✅ Access is controlled via IAM permissions
- ✅ Keys are not stored in code or environment variables in plain text
- ✅ Automatic rotation support (if needed)
- ✅ Lower cost compared to AWS Secrets Manager
- ✅ Better integration with AWS services

## Setup Steps

### 1. Store Your OpenAI API Key in Parameter Store

Before deploying your application, you need to store your OpenAI API key in AWS Systems Manager Parameter Store:

#### Option A: Using the Setup Script (Recommended)

```bash
# Run the setup script
node scripts/setup-openai-parameter.js

# Or provide the API key directly
node scripts/setup-openai-parameter.js your-actual-openai-api-key
```

#### Option B: Using AWS CLI

```bash
# Replace 'your-actual-openai-api-key' with your real API key
aws ssm put-parameter \
  --name "/gwbn/openai/api-key" \
  --value "your-actual-openai-api-key" \
  --type "SecureString" \
  --description "OpenAI API key for Golden West Business News application"
```

#### Option C: Using AWS Console

1. Go to AWS Systems Manager Parameter Store console
2. Click "Create parameter"
3. Fill in the details:
   - **Name**: `/gwbn/openai/api-key`
   - **Type**: `SecureString`
   - **Value**: Your OpenAI API key
   - **Description**: `OpenAI API key for Golden West Business News application`

**Important Notes:**
- Get your API key from: https://platform.openai.com/api-keys
- The parameter name must be exactly `/gwbn/openai/api-key`
- Use `SecureString` type for encryption
- Make sure you have the necessary AWS CLI permissions

### 2. Configure IAM Permissions

Ensure your Lambda execution role has the necessary permissions to read from Parameter Store:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": [
        "arn:aws:ssm:us-west-1:*:parameter/gwbn/openai/api-key"
      ]
    }
  ]
}
```

### 3. Deploy Your Application

After storing the API key and configuring permissions, deploy your application:

```bash
# For Amplify
amplify push

# For other deployment methods
npm run build
# Deploy using your preferred method
```

### 4. Using OpenAI in Your Application

The application automatically uses the Parameter Store integration through utility functions:

#### For Article Generation

```typescript
import { generateArticleFromTranscript } from '@/lib/openai-utils';

// In your API route
const articleData = await generateArticleFromTranscript(transcript, notes);
```

#### For Audio Transcription

```typescript
import { transcribeAudio } from '@/lib/openai-utils';

// In your API route
const transcription = await transcribeAudio(audioFile);
```

#### For Direct OpenAI Client Access

```typescript
import { getOpenAIClient } from '@/lib/openai-utils';

// Get OpenAI client with automatic API key retrieval
const openai = await getOpenAIClient();

// Use the client
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }]
});
```

## Security Best Practices

1. **Principle of Least Privilege**: Only the Lambda functions that need OpenAI access have permission to read the parameter.

2. **Parameter Encryption**: The API key is stored as a `SecureString` and encrypted using AWS KMS.

3. **No Hardcoding**: The API key is never stored in code, environment files, or plain text.

4. **Caching**: The utility caches the API key in memory during Lambda execution to reduce Parameter Store calls.

5. **Error Handling**: Proper error handling ensures that API key retrieval failures don't expose sensitive information.

6. **Fallback Support**: The system falls back to environment variables for local development.

## Environment-Specific Configuration

For different environments (dev, staging, prod), use different parameter paths:

```typescript
const env = process.env.ENVIRONMENT || 'dev';
const parameterName = `/gwbn/${env}/openai/api-key`;
```

## Troubleshooting

### "Parameter not found" Error
- Verify the parameter exists: `aws ssm get-parameter --name "/gwbn/openai/api-key"`
- Check the parameter name spelling
- Ensure you're in the correct AWS region

### "Access Denied" Error
- Verify your Lambda execution role has `ssm:GetParameter` permission
- Check that the IAM policy is correctly applied
- Review IAM roles in the AWS Console

### "OpenAI API Error"
- Verify your API key is valid on the OpenAI platform
- Check your OpenAI account billing and usage limits
- Review OpenAI API status page

### "Decryption Error"
- Ensure the parameter is stored as `SecureString`
- Verify your Lambda role has KMS decryption permissions
- Check that the KMS key is accessible

## Cost Considerations

- **Parameter Store**: Free for standard parameters, $0.05 per 10,000 API calls for advanced parameters
- **OpenAI API**: Costs vary by model and usage (see OpenAI pricing)
- **Lambda**: Pay per request and compute time
- **KMS**: $0.03 per 10,000 requests for encryption/decryption

## Migration from Secrets Manager

If you're migrating from AWS Secrets Manager:

1. **Create the Parameter Store parameter** using the setup script
2. **Update IAM policies** to use `ssm:GetParameter` instead of `secretsmanager:GetSecretValue`
3. **Deploy the updated code** that uses the new utility functions
4. **Test the integration** to ensure everything works
5. **Remove the old Secrets Manager secret** (optional, for cleanup)

## API Reference

### Utility Functions

#### `getOpenAIApiKey(): Promise<string>`
Retrieves the OpenAI API key from Parameter Store with caching.

#### `getOpenAIClient(): Promise<OpenAI>`
Returns a configured OpenAI client instance.

#### `generateArticleFromTranscript(transcript: string, notes?: string): Promise<{title: string, content: string}>`
Generates a newspaper article from interview transcript.

#### `transcribeAudio(audioFile: File): Promise<string>`
Transcribes audio using OpenAI Whisper.

#### `generateListingDescription(params: {...}): Promise<string>`
Generates real estate listing descriptions (for future use).

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs for detailed error messages
3. Verify your OpenAI API key and billing status
4. Ensure all IAM permissions are correctly configured

This setup ensures your OpenAI integration is secure, scalable, and follows AWS best practices!
