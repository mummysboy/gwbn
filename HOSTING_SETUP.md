# Hosting Setup Guide for Golden West Business News

## Environment Variables Required

When deploying to AWS Amplify, Vercel, or other hosting platforms, you **MUST** set these environment variables:

### Required AWS Variables
```env
REGION=us-east-1
ACCESS_KEY_ID=your_actual_access_key
SECRET_ACCESS_KEY=your_actual_secret_key
```

### DynamoDB Table Names
```env
ARTICLES_TABLE=gwbn-articles
USERS_TABLE=gwbn-users
ANALYTICS_TABLE=gwbn-analytics
```

### Optional Variables
```env
OPENAI_API_KEY=your_openai_key_for_transcription
NEXT_PUBLIC_APP_NAME=Golden West Business News
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## AWS Amplify Setup

### 1. Set Environment Variables
1. Go to your Amplify app dashboard
2. Navigate to **App settings** → **Environment variables**
3. Add each variable listed above

### 2. Create DynamoDB Tables
You need to create the DynamoDB tables in your AWS account:

#### Option A: Use AWS Console
1. Go to DynamoDB in AWS Console
2. Create tables with these names:
   - `gwbn-articles`
   - `gwbn-users` 
   - `gwbn-analytics`

#### Option B: Use AWS CLI
```bash
# Set your AWS credentials
export ACCESS_KEY_ID=your_key
export SECRET_ACCESS_KEY=your_secret
export REGION=us-east-1

# Run the setup script
npm run setup-db
```

### 3. IAM Permissions
Your AWS user/role needs these DynamoDB permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/gwbn-*"
        }
    ]
}
```

## Vercel Setup

### 1. Set Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable listed above

### 2. Create DynamoDB Tables
Same as AWS Amplify - create tables in AWS Console or use CLI.

## Testing Connection

After deployment, test these endpoints:

1. **AWS Config Check**: `https://your-domain.com/api/debug-aws`
2. **Environment Check**: `https://your-domain.com/api/debug-env?key=debug123`
3. **Articles API**: `https://your-domain.com/api/articles`
4. **Users API**: `https://your-domain.com/api/users`

## Common Issues & Solutions

### Issue 1: "AWS DynamoDB client not configured"
**Cause**: Missing AWS credentials
**Solution**: Set `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` in hosting platform

### Issue 2: "Table not found"
**Cause**: DynamoDB tables don't exist
**Solution**: Create tables using AWS Console or run `npm run setup-db`

### Issue 3: "Access Denied"
**Cause**: Insufficient IAM permissions
**Solution**: Add DynamoDB permissions to your AWS user/role

### Issue 4: "Region mismatch"
**Cause**: Wrong AWS region
**Solution**: Set `REGION` environment variable to match your DynamoDB region

## Security Best Practices

1. **Never commit AWS credentials** to your repository
2. **Use IAM roles** instead of access keys when possible (for AWS services)
3. **Limit permissions** to only what's required
4. **Rotate credentials** regularly
5. **Monitor usage** through AWS CloudWatch

## Troubleshooting Steps

1. Check environment variables are set in hosting platform
2. Verify DynamoDB tables exist in correct region
3. Test AWS credentials have proper permissions
4. Check application logs for specific error messages
5. Use debug endpoints to verify configuration
