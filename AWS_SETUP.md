# AWS Setup Guide for Golden West Business News

This guide will help you set up AWS services for the Golden West Business News application.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed

## AWS Services Used

### 1. DynamoDB
- **Articles Table**: Stores all news articles
- **Users Table**: Stores user information
- **Analytics Table**: Stores analytics and metrics data

### 2. AWS Transcribe (Optional)
- Real-time audio transcription for voice recordings
- Fallback to OpenAI Whisper if AWS Transcribe is not configured

### 3. AWS S3 (Future)
- Image and media storage
- File uploads for articles

### 4. AWS Cognito (Future)
- User authentication and management
- Role-based access control

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file and update with your AWS credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your AWS configuration:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Tables
DYNAMODB_ARTICLES_TABLE=gwbn-articles
DYNAMODB_USERS_TABLE=gwbn-users
DYNAMODB_ANALYTICS_TABLE=gwbn-analytics

# OpenAI Configuration (for transcription fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Create DynamoDB Tables

Run the setup script to create the required DynamoDB tables:

```bash
npm run setup-db
```

This will create three tables:
- `gwbn-articles`: Stores news articles
- `gwbn-users`: Stores user information
- `gwbn-analytics`: Stores analytics data

### 3. Verify Setup

Start the development server:

```bash
npm run dev
```

Visit the admin dashboard at `http://localhost:3000/admin` to verify that:
- Articles are loaded from DynamoDB
- User management works with real data
- Analytics are calculated from real data

## Data Migration

If you have existing mock data, you can migrate it to DynamoDB by:

1. **Articles**: The API automatically creates articles in DynamoDB when published
2. **Users**: Add users through the admin interface or API
3. **Analytics**: Analytics are automatically calculated from real data

## API Endpoints

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles?status=published` - Get published articles
- `POST /api/articles` - Create new article
- `GET /api/articles/[id]` - Get specific article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Analytics
- `GET /api/analytics?type=dashboard` - Get dashboard analytics
- `POST /api/analytics` - Update analytics data

### Transcription
- `POST /api/transcribe` - Transcribe audio (uses OpenAI Whisper with AWS fallback)

## Troubleshooting

### Common Issues

1. **DynamoDB Access Denied**
   - Ensure your AWS credentials have DynamoDB permissions
   - Check that the region is correct

2. **Tables Not Found**
   - Run `npm run setup-db` to create tables
   - Verify table names in environment variables

3. **API Errors**
   - Check AWS credentials are valid
   - Ensure environment variables are set correctly
   - Check AWS service limits and quotas

### AWS Permissions Required

Your AWS user/role needs the following permissions:

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

## Production Deployment

For production deployment:

1. **Use IAM Roles**: Instead of access keys, use IAM roles for EC2/Lambda
2. **Environment Variables**: Set all environment variables in your deployment platform
3. **Database**: Ensure DynamoDB tables are in the correct region
4. **Monitoring**: Set up CloudWatch monitoring for API usage and errors

## Cost Optimization

- DynamoDB tables use **Pay Per Request** billing mode
- Monitor usage through AWS Cost Explorer
- Set up billing alerts for unexpected costs
- Consider reserved capacity for high-traffic applications

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** instead of access keys when possible
3. **Limit permissions** to only what's required
4. **Enable CloudTrail** for audit logging
5. **Use VPC endpoints** for DynamoDB access in production
