/**
 * Client-safe configuration utilities
 * Only contains NEXT_PUBLIC_ prefixed environment variables
 */

// Client-safe app configuration (only NEXT_PUBLIC_ variables)
export const clientAppConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Golden West Business News',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
};

// Client-safe Cognito configuration
export const clientCognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
};

// Client-safe S3 configuration
export const clientS3Config = {
  bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  region: process.env.NEXT_PUBLIC_S3_REGION || 'us-west-1',
};

// Client-safe API Gateway configuration
export const clientApiGatewayConfig = {
  url: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
};

// Client-safe environment detection
export const clientEnvironment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Validation function for client-side configuration
export function validateClientConfig(): { isValid: boolean; missing: string[] } {
  const requiredClientVars = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION'
  ];
  
  const missingVars = requiredClientVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missing: missingVars
  };
}

// Get client configuration status
export function getClientConfigStatus() {
  return {
    app: clientAppConfig,
    cognito: clientCognitoConfig,
    s3: clientS3Config,
    apiGateway: clientApiGatewayConfig,
    environment: clientEnvironment,
    validation: validateClientConfig()
  };
}
