/**
 * AWS Configuration utilities for the GWBN application
 */

export interface AWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export const awsConfig: AWSConfig = {
  region: process.env.REGION || process.env.AWS_REGION || 'us-west-1',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'GWBN',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

export const databaseConfig = {
  url: process.env.DATABASE_URL,
};

export const cognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
};

export const s3Config = {
  bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  region: process.env.NEXT_PUBLIC_S3_REGION || 'us-west-1',
};

export const apiGatewayConfig = {
  url: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
};

// Validation function to check if required AWS config is present
export function validateAWSConfig(): boolean {
  const requiredVars = ['REGION'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing AWS environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  // Check if we have credentials (either access keys or IAM role)
  const hasAccessKeys = !!(awsConfig.accessKeyId && awsConfig.secretAccessKey);
  const hasIAMRole = !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE);
  
  if (!hasAccessKeys && !hasIAMRole) {
    console.warn('No AWS credentials found. Set ACCESS_KEY_ID and SECRET_ACCESS_KEY, or use IAM roles.');
    return false;
  }
  
  return true;
}

// Get detailed AWS configuration status for debugging
export function getAWSConfigStatus() {
  return {
    region: awsConfig.region,
    hasAccessKey: !!awsConfig.accessKeyId,
    hasSecretKey: !!awsConfig.secretAccessKey,
    hasIAMRole: !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    isAmplify: !!process.env.AMPLIFY_APP_ID,
    tables: {
      articles: process.env.ARTICLES_TABLE || 'gwbn-articles',
      users: process.env.USERS_TABLE || 'gwbn-users',
      analytics: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
    }
  };
}

// Helper function to get AWS credentials for client-side usage
export function getClientSideAWSConfig() {
  return {
    region: awsConfig.region,
    // Note: Never expose secret keys on the client side
    // Use IAM roles or Cognito for client-side authentication
  };
}
