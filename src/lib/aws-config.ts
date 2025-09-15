/**
 * AWS Configuration utilities for the GWBN application
 * WARNING: This file contains both client and server configurations.
 * Use server-aws-config.ts for server-only operations.
 * Use client-config.ts for client-safe configurations.
 */

// Re-export client-safe configurations
export { 
  clientAppConfig as appConfig,
  clientCognitoConfig as cognitoConfig,
  clientS3Config as s3Config,
  clientApiGatewayConfig as apiGatewayConfig,
  clientEnvironment as environment
} from './client-config';

// Legacy interface for backward compatibility
export interface AWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

// Legacy awsConfig - now uses server configuration when available
export const awsConfig: AWSConfig = (() => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use server configuration
    const { serverAWSConfig } = require('./server-aws-config');
    return serverAWSConfig;
  } else {
    // Client-side: return safe configuration (no secrets)
    return {
      region: process.env.NEXT_PUBLIC_S3_REGION || 'us-west-1',
      // Never expose access keys on client side
    };
  }
})();

// Legacy databaseConfig - server-only
export const databaseConfig = (() => {
  if (typeof window === 'undefined') {
    const { serverDatabaseConfig } = require('./server-aws-config');
    return serverDatabaseConfig;
  } else {
    // Client-side: return empty config (database should not be accessed from client)
    return {};
  }
})();

// Validation function to check if required AWS config is present
export function validateAWSConfig(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: use server validation
    const { validateServerAWSConfig } = require('./server-aws-config');
    return validateServerAWSConfig();
  } else {
    // Client-side: always return true (no server credentials needed)
    return true;
  }
}

// Get detailed AWS configuration status for debugging
export function getAWSConfigStatus() {
  if (typeof window === 'undefined') {
    // Server-side: use server status
    const { getServerAWSConfigStatus } = require('./server-aws-config');
    return getServerAWSConfigStatus();
  } else {
    // Client-side: return safe status (no secrets)
    return {
      region: awsConfig.region,
      hasAccessKey: false, // Never expose on client
      hasSecretKey: false, // Never expose on client
      hasIAMRole: false,   // Never expose on client
      environment: process.env.NODE_ENV,
      isVercel: false,
      isAmplify: false,
      tables: {
        articles: 'gwbn-articles', // Default values only
        users: 'gwbn-users',
        analytics: 'gwbn-analytics',
      }
    };
  }
}

// Helper function to get AWS credentials for client-side usage
export function getClientSideAWSConfig() {
  return {
    region: awsConfig.region,
    // Note: Never expose secret keys on the client side
    // Use IAM roles or Cognito for client-side authentication
  };
}
