# Photo Upload Deployment Fix Guide

## Problem
Photo uploads work locally but fail when deployed to hosting platforms (Vercel, AWS Amplify, etc.).

## Root Cause
The deployment environment is missing required AWS environment variables and credentials.

## Required Environment Variables

### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
REGION=us-west-1
ACCESS_KEY_ID=your_actual_access_key_here
SECRET_ACCESS_KEY=your_actual_secret_key_here
NEXT_PUBLIC_S3_BUCKET_NAME=gwbn-storage
NEXT_PUBLIC_S3_REGION=us-west-1
```

### For AWS Amplify Deployment:
1. Go to your Amplify app dashboard
2. Navigate to App Settings → Environment Variables
3. Add the same variables as above

### For Other Platforms:
Add the same environment variables in your platform's environment variable settings.

## AWS Setup Requirements

### 1. Create S3 Bucket
```bash
aws s3 mb s3://gwbn-storage --region us-west-1
```

### 2. Configure Bucket Policy
Create a bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::gwbn-storage/*"
        }
    ]
}
```

### 3. Configure CORS
Add CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 4. IAM User/Role Permissions
Ensure your AWS credentials have the permissions defined in `complete-iam-policy-fixed.json`.

## Testing Your Deployment

### 1. Check Environment Variables
Visit: `https://your-domain.com/api/debug-env-detailed`

### 2. Check S3 Configuration
Visit: `https://your-domain.com/api/debug-s3`

### 3. Test Upload
Try uploading an image through your app's upload interface.

## Common Issues and Solutions

### Issue: "S3 client not configured"
**Solution**: Check that `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` are set in your deployment environment.

### Issue: "S3 bucket name not configured"
**Solution**: Ensure `NEXT_PUBLIC_S3_BUCKET_NAME` is set to `gwbn-storage`.

### Issue: "Access denied"
**Solution**: Verify your AWS credentials have the correct S3 permissions.

### Issue: "NoSuchBucket"
**Solution**: Create the S3 bucket `gwbn-storage` in the `us-west-1` region.

## Security Notes

- Never commit AWS credentials to your repository
- Use environment variables for all sensitive configuration
- Consider using IAM roles instead of access keys for production deployments
- Regularly rotate your AWS credentials

## Next Steps

1. Set up the environment variables in your deployment platform
2. Create the S3 bucket if it doesn't exist
3. Test the upload functionality
4. Monitor the debug endpoints to verify configuration
