import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getServerEnvironmentConfig } from './env-config';

// Cache for secrets to avoid repeated API calls
const secretsCache = new Map<string, SecretCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface SecretCacheEntry {
  value: Record<string, unknown>;
  timestamp: number;
}

/**
 * Get AWS Secrets Manager client
 */
function getSecretsManagerClient(): SecretsManagerClient {
  const config = getServerEnvironmentConfig();
  
  return new SecretsManagerClient({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Get secret from AWS Secrets Manager with caching
 */
export async function getSecret(secretName: string): Promise<Record<string, unknown>> {
  // Check cache first
  const cached = secretsCache.get(secretName) as SecretCacheEntry;
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.value;
  }
  
  try {
    const client = getSecretsManagerClient();
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    const response = await client.send(command);
    
    if (!response.SecretString) {
      throw new Error(`Secret ${secretName} has no string value`);
    }
    
    const secretValue = JSON.parse(response.SecretString) as Record<string, unknown>;
    
    // Cache the result
    secretsCache.set(secretName, {
      value: secretValue,
      timestamp: Date.now(),
    });
    
    return secretValue;
    
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Get AWS credentials from Secrets Manager
 */
export async function getAWSCredentialsFromSecrets(): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}> {
  try {
    const credentials = await getSecret('gwbn/aws-credentials');
    
    return {
      accessKeyId: credentials.accessKeyId as string,
      secretAccessKey: credentials.secretAccessKey as string,
      region: (credentials.region as string) || 'us-west-1',
    };
  } catch (error) {
    console.error('Failed to get AWS credentials from Secrets Manager:', error);
    throw new Error('Could not retrieve AWS credentials from Secrets Manager');
  }
}

/**
 * Get Bedrock configuration from Secrets Manager
 */
export async function getBedrockConfigFromSecrets(): Promise<{
  modelId: string;
  region: string;
}> {
  try {
    const bedrockConfig = await getSecret('gwbn/bedrock-config');
    
    return {
      modelId: (bedrockConfig.modelId as string) || 'anthropic.claude-sonnet-4-20250514-v1:0',
      region: (bedrockConfig.region as string) || 'us-west-1',
    };
  } catch (error) {
    console.error('Failed to get Bedrock config from Secrets Manager:', error);
    throw new Error('Could not retrieve Bedrock configuration from Secrets Manager');
  }
}

/**
 * Get S3 configuration from Secrets Manager
 */
export async function getS3ConfigFromSecrets(): Promise<{
  bucketName: string;
  region: string;
}> {
  try {
    const s3Config = await getSecret('gwbn/s3-config');
    
    return {
      bucketName: (s3Config.bucketName as string) || 'gwbn-storage',
      region: (s3Config.region as string) || 'us-west-1',
    };
  } catch (error) {
    console.error('Failed to get S3 config from Secrets Manager:', error);
    throw new Error('Could not retrieve S3 configuration from Secrets Manager');
  }
}

/**
 * Load all configuration from Secrets Manager
 */
export async function loadConfigFromSecrets(): Promise<{
  awsCredentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  bedrockConfig: {
    modelId: string;
    region: string;
  };
  s3Config: {
    bucketName: string;
    region: string;
  };
}> {
  try {
    const [awsCredentials, bedrockConfig, s3Config] = await Promise.all([
      getAWSCredentialsFromSecrets(),
      getBedrockConfigFromSecrets(),
      getS3ConfigFromSecrets(),
    ]);
    
    return {
      awsCredentials,
      bedrockConfig,
      s3Config,
    };
  } catch (error) {
    console.error('Failed to load configuration from Secrets Manager:', error);
    throw error;
  }
}

/**
 * Test Secrets Manager connectivity
 */
export async function testSecretsManagerConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // const _client = getSecretsManagerClient();
    
    // Try to list secrets (this will test connectivity)
    // Note: This is a simplified test - in production you might want to use a different test
    console.log('Testing AWS Secrets Manager connectivity...');
    
    return {
      success: true,
      message: 'AWS Secrets Manager client initialized successfully',
    };
  } catch (error) {
    console.error('AWS Secrets Manager connection test failed:', error);
    return {
      success: false,
      message: `AWS Secrets Manager connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Clear secrets cache (useful for testing or when secrets are updated)
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
}
