/**
 * Server-only AWS Configuration utilities
 * This file should NEVER be imported by client components
 */

export interface ServerAWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

// Server-only AWS configuration (never exposed to client)
export const serverAWSConfig: ServerAWSConfig = {
  region: process.env.REGION || process.env.AWS_REGION || 'us-west-1',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

// Server-only app configuration
export const serverAppConfig = {
  environment: process.env.NODE_ENV || 'development',
};

// Server-only database configuration
export const serverDatabaseConfig = {
  url: process.env.DATABASE_URL,
};

// Server-only table names
export const serverTableNames = {
  articles: process.env.ARTICLES_TABLE || 'gwbn-articles',
  users: process.env.USERS_TABLE || 'gwbn-users',
  analytics: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
};

// Validation function to check if required AWS config is present (server-only)
export function validateServerAWSConfig(): boolean {
  const requiredVars = ['REGION'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing AWS environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  // Check if we have credentials (either access keys or IAM role)
  const hasAccessKeys = !!(serverAWSConfig.accessKeyId && serverAWSConfig.secretAccessKey);
  const hasIAMRole = !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE);
  
  if (!hasAccessKeys && !hasIAMRole) {
    console.warn('No AWS credentials found. Set ACCESS_KEY_ID and SECRET_ACCESS_KEY, or use IAM roles.');
    return false;
  }
  
  return true;
}

// Get detailed AWS configuration status for debugging (server-only)
export function getServerAWSConfigStatus() {
  return {
    region: serverAWSConfig.region,
    hasAccessKey: !!serverAWSConfig.accessKeyId,
    hasSecretKey: !!serverAWSConfig.secretAccessKey,
    hasIAMRole: !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    isAmplify: !!process.env.AMPLIFY_APP_ID,
    tables: serverTableNames
  };
}

// Check if running in server environment
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}

// Runtime check to ensure this is only used server-side
export function ensureServerOnly() {
  if (!isServerEnvironment()) {
    throw new Error('This function can only be called on the server side');
  }
}
