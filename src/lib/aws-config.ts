/**
 * AWS Configuration utilities for the GWBN application
 */

export interface AWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export const awsConfig: AWSConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
  region: process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1',
};

export const apiGatewayConfig = {
  url: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
};

// Validation function to check if required AWS config is present
export function validateAWSConfig(): boolean {
  const requiredVars = ['AWS_REGION'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing AWS environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// Helper function to get AWS credentials for client-side usage
export function getClientSideAWSConfig() {
  return {
    region: awsConfig.region,
    // Note: Never expose secret keys on the client side
    // Use IAM roles or Cognito for client-side authentication
  };
}
