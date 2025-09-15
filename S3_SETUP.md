# AWS S3 Setup Guide for Image Uploads

This guide will help you set up AWS S3 for image uploads in the Golden West Business News application.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured (optional)
3. Node.js and npm installed

## Step 1: Create S3 Bucket

### Using AWS Console:
1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Bucket name: `gwbn-storage` (must match your environment variable)
4. Region: `us-west-1` (must match your environment variable)
5. **Important**: Uncheck "Block all public access" 
6. Check "I acknowledge that the current settings might result in this bucket and the objects within it becoming public"
7. Click "Create bucket"

### Using AWS CLI:
```bash
aws s3 mb s3://gwbn-storage --region us-west-1
```

## Step 2: Configure Bucket Policy

Add this bucket policy to allow public read access to uploaded images:

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

### To add the policy:
1. Go to your S3 bucket
2. Click "Permissions" tab
3. Scroll down to "Bucket policy"
4. Click "Edit"
5. Paste the policy above
6. Click "Save changes"

## Step 3: Set Environment Variables

### For Local Development:
Create or update `.env.local`:

```env
# AWS Configuration
REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here

# S3 Configuration (REQUIRED for uploads)
NEXT_PUBLIC_S3_BUCKET_NAME=gwbn-storage
NEXT_PUBLIC_S3_REGION=us-west-1
```

### For AWS Deployment:

#### AWS Amplify:
1. Go to your Amplify app in AWS Console
2. Click "Environment variables"
3. Add these variables:
   - `NEXT_PUBLIC_S3_BUCKET_NAME` = `gwbn-storage`
   - `NEXT_PUBLIC_S3_REGION` = `us-west-1`
   - `REGION` = `us-west-1`
   - `ACCESS_KEY_ID` = your access key
   - `SECRET_ACCESS_KEY` = your secret key

#### Vercel:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add the same variables as above

## Step 4: Configure IAM Permissions

Your AWS user/role needs these permissions for S3:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::gwbn-storage",
                "arn:aws:s3:::gwbn-storage/*"
            ]
        }
    ]
}
```

## Step 5: Test Configuration

### Debug Endpoints:
Visit these URLs to test your configuration:

- **Local**: `http://localhost:3000/api/debug-s3`
- **Deployed**: `https://your-domain.com/api/debug-s3`

### Test Upload:
1. Go to your app's publish page
2. Try uploading an image
3. Check browser console for any errors
4. Check server logs for S3 service messages

## Troubleshooting

### Common Issues:

1. **"S3 not configured" error**
   - Check that `NEXT_PUBLIC_S3_BUCKET_NAME` is set
   - Verify bucket name matches exactly
   - Ensure region matches

2. **"Access Denied" error**
   - Check IAM permissions
   - Verify bucket policy allows public read
   - Ensure credentials are valid

3. **"Bucket does not exist" error**
   - Verify bucket name is correct
   - Check that bucket exists in the correct region
   - Ensure bucket name doesn't have typos

4. **Images upload but don't display**
   - Check bucket policy allows public read
   - Verify CORS configuration if needed
   - Check that ACL is set to 'public-read'

### Debug Steps:

1. **Check environment variables**:
   ```bash
   # Local
   curl http://localhost:3000/api/debug-s3
   
   # Deployed
   curl https://your-domain.com/api/debug-s3
   ```

2. **Check S3 service status**:
   Look for these log messages:
   - "S3 Service: Using access key credentials"
   - "S3 Service: Using IAM role/Lambda credentials"
   - "S3 Service: Successfully uploaded image"

3. **Test bucket access**:
   ```bash
   aws s3 ls s3://gwbn-storage/
   ```

## Security Best Practices

1. **Use IAM Roles** instead of access keys when possible
2. **Limit permissions** to only what's required
3. **Enable CloudTrail** for audit logging
4. **Set up lifecycle policies** for old images
5. **Monitor costs** with AWS Cost Explorer

## Cost Optimization

- S3 charges for storage and requests
- Consider lifecycle policies to move old images to cheaper storage classes
- Monitor usage through AWS Cost Explorer
- Set up billing alerts

## Next Steps

After setting up S3:

1. Test image uploads in your app
2. Verify images are publicly accessible
3. Set up monitoring and alerts
4. Consider implementing image optimization
5. Plan for backup and disaster recovery
