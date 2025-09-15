# Transcription 403 Error Fix Guide

## Problem Summary
You're experiencing 403 errors on transcription API endpoints (`/api/transcribe-simple` and `/api/transcribe-direct`). This is typically caused by missing environment variables or AWS permissions issues.

## Quick Fix Steps

### 1. Check Current Environment Status
Visit your deployed site and go to: `https://your-domain.com/api/transcribe-debug`

This will show you:
- Whether OpenAI API key is configured
- Which AWS platform you're using
- Detailed diagnostic information

### 2. Add OpenAI API Key to Environment Variables

#### For AWS Amplify:
1. Go to AWS Amplify Console
2. Select your app
3. Go to "Environment variables"
4. Add: `OPENAI_API_KEY` = `your_openai_api_key_here`

#### For AWS Lambda:
```bash
aws lambda update-function-configuration \
  --function-name YOUR_FUNCTION_NAME \
  --environment Variables='{OPENAI_API_KEY=your_key_here}'
```

#### For Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add: `OPENAI_API_KEY` = `your_openai_api_key_here`

#### For Other Platforms:
Add to your deployment configuration:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Test the New Fallback Endpoint
The system now tries endpoints in this order:
1. `/api/transcribe-simple` (basic OpenAI)
2. `/api/transcribe-direct` (with AWS Secrets Manager)
3. `/api/transcribe-fallback` (enhanced error handling)

### 4. Use Client-Side Fallback
If all server endpoints fail, the VoiceRecorder automatically falls back to browser-based speech recognition.

## New Endpoints Created

### `/api/transcribe-debug` (GET)
- Diagnostic endpoint to check environment status
- Shows which AWS platform is detected
- Displays environment variable status

### `/api/transcribe-fallback` (POST)
- Enhanced transcription endpoint with better error handling
- Detailed debug information in responses
- 30-second timeout for audio processing
- File size validation (25MB limit)

## Environment Variables Required

```env
# Required for transcription
OPENAI_API_KEY=your_openai_api_key_here

# Optional AWS configuration
AWS_REGION=us-west-1
REGION=us-west-1
```

## Testing Steps

1. **Check diagnostics**: Visit `/api/transcribe-debug`
2. **Test transcription**: Try recording audio in the VoiceRecorder
3. **Check logs**: Look at AWS CloudWatch or your platform's logs
4. **Verify fallback**: If server fails, client-side speech recognition should work

## Common Issues & Solutions

### Issue: "OpenAI API key not configured"
**Solution**: Add `OPENAI_API_KEY` to your environment variables

### Issue: "403 Forbidden"
**Solution**: Check IAM permissions or platform-specific restrictions

### Issue: "Timeout errors"
**Solution**: The fallback endpoint has a 30-second timeout, increase if needed

### Issue: "File too large"
**Solution**: Audio files must be under 25MB (OpenAI limit)

## Platform-Specific Notes

### AWS Amplify
- Environment variables must be set in Amplify Console
- Check build logs for deployment issues
- Ensure API routes are properly deployed

### AWS Lambda
- Increase timeout for audio processing
- Check CloudWatch logs for detailed errors
- Verify IAM role permissions

### Vercel
- Environment variables work immediately after deployment
- Check Vercel function logs for errors
- Ensure proper Next.js API route configuration

## Emergency Workaround

If all server-side transcription fails, the VoiceRecorder component includes client-side speech recognition that works entirely in the browser without requiring any server API calls.

## Next Steps

1. Add `OPENAI_API_KEY` to your environment variables
2. Deploy the updated code
3. Test the transcription feature
4. Check the diagnostic endpoint for any remaining issues

The system now has multiple fallback layers to ensure transcription works even if some endpoints fail.
