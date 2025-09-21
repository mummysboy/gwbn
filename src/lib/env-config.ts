/**
 * Environment Variables Configuration
 * Centralized configuration for all environment variables with validation
 */

// Environment variable types
export interface EnvironmentConfig {
  // Application
  appName: string;
  appVersion: string;
  nodeEnv: 'development' | 'production' | 'test';
  
  // AWS Configuration
  awsRegion: string;
  accessKeyId: string;
  secretAccessKey: string;
  
  // AWS Services
  bedrockModelId: string;
  s3BucketName: string;
  s3Region: string;
  
  // Optional AWS Services
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  databaseUrl?: string;
  
  // Feature Flags
  enableBedrock: boolean;
  enableTranscribe: boolean;
  enableS3Upload: boolean;
}

// Default values for development
const defaults = {
  appName: 'Golden West Business News',
  appVersion: '1.0.0',
  nodeEnv: 'development' as const,
  awsRegion: 'us-west-1',
  bedrockModelId: 'amazon.titan-text-express-v1',
  s3BucketName: 'gwbn-storage',
  s3Region: 'us-west-1',
  enableBedrock: true,
  enableTranscribe: true,
  enableS3Upload: true,
};

// Environment variable validation
function validateEnvVar(name: string, value: string | undefined, required: boolean = false): string {
  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value || '';
}

function getBooleanEnvVar(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Server-side environment configuration (includes secrets)
export function getServerEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV as EnvironmentConfig['nodeEnv']) || defaults.nodeEnv;
  
  // In production, these should come from AWS Secrets Manager or environment variables
  const accessKeyId = validateEnvVar('ACCESS_KEY_ID', process.env.ACCESS_KEY_ID, nodeEnv === 'production');
  const secretAccessKey = validateEnvVar('SECRET_ACCESS_KEY', process.env.SECRET_ACCESS_KEY, nodeEnv === 'production');
  
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || defaults.appName,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || defaults.appVersion,
    nodeEnv,
    awsRegion: process.env.AWS_REGION || defaults.awsRegion,
    accessKeyId,
    secretAccessKey,
    bedrockModelId: process.env.BEDROCK_MODEL_ID || defaults.bedrockModelId,
    s3BucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || defaults.s3BucketName,
    s3Region: process.env.NEXT_PUBLIC_S3_REGION || defaults.s3Region,
    cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    databaseUrl: process.env.DATABASE_URL,
    enableBedrock: getBooleanEnvVar('ENABLE_BEDROCK', defaults.enableBedrock),
    enableTranscribe: getBooleanEnvVar('ENABLE_TRANSCRIBE', defaults.enableTranscribe),
    enableS3Upload: getBooleanEnvVar('ENABLE_S3_UPLOAD', defaults.enableS3Upload),
  };
}

// Client-side environment configuration (no secrets)
export function getClientEnvironmentConfig(): Partial<EnvironmentConfig> {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || defaults.appName,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || defaults.appVersion,
    nodeEnv: (process.env.NODE_ENV as EnvironmentConfig['nodeEnv']) || defaults.nodeEnv,
    s3BucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || defaults.s3BucketName,
    s3Region: process.env.NEXT_PUBLIC_S3_REGION || defaults.s3Region,
    cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  };
}

// Environment validation function
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const config = getServerEnvironmentConfig();
    
    // Check required AWS credentials in production
    if (config.nodeEnv === 'production') {
      if (!config.accessKeyId) {
        errors.push('ACCESS_KEY_ID is required in production');
      }
      if (!config.secretAccessKey) {
        errors.push('SECRET_ACCESS_KEY is required in production');
      }
    }
    
    // Check AWS region
    if (!config.awsRegion) {
      errors.push('AWS_REGION is required');
    }
    
    // Check S3 configuration
    if (config.enableS3Upload && !config.s3BucketName) {
      errors.push('S3_BUCKET_NAME is required when S3 upload is enabled');
    }
    
  } catch (error) {
    errors.push(`Environment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get environment info for debugging
export function getEnvironmentInfo(): Record<string, string | number | boolean> {
  const config = getServerEnvironmentConfig();
  
  return {
    nodeEnv: config.nodeEnv,
    appName: config.appName,
    appVersion: config.appVersion,
    awsRegion: config.awsRegion,
    bedrockModelId: config.bedrockModelId,
    s3BucketName: config.s3BucketName,
    hasAccessKey: !!config.accessKeyId,
    hasSecretKey: !!config.secretAccessKey,
    enableBedrock: config.enableBedrock,
    enableTranscribe: config.enableTranscribe,
    enableS3Upload: config.enableS3Upload,
    // Don't expose actual credentials in logs
  };
}
