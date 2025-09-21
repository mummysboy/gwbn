import { getServerEnvironmentConfig } from './env-config';
import { loadConfigFromSecrets, testSecretsManagerConnection } from './secrets-manager';

// Enhanced AWS configuration that supports both environment variables and Secrets Manager
export interface EnhancedAWSConfig {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bedrock: {
    modelId: string;
    region: string;
  };
  s3: {
    bucketName: string;
    region: string;
  };
  transcribe: {
    region: string;
  };
  source: 'environment' | 'secrets-manager' | 'fallback';
}

// Fallback configuration for development
const fallbackConfig: EnhancedAWSConfig = {
  region: 'us-west-1',
  credentials: {
    accessKeyId: 'fallback-access-key',
    secretAccessKey: 'fallback-secret-key',
  },
  bedrock: {
    modelId: 'amazon.titan-text-express-v1',
    region: 'us-west-1',
  },
  s3: {
    bucketName: 'gwbn-storage',
    region: 'us-west-1',
  },
  transcribe: {
    region: 'us-west-1',
  },
  source: 'fallback',
};

/**
 * Get enhanced AWS configuration with fallback support
 */
export async function getEnhancedAWSConfig(): Promise<EnhancedAWSConfig> {
  const envConfig = getServerEnvironmentConfig();
  
  // Try environment variables first
  if (envConfig.accessKeyId && envConfig.secretAccessKey) {
    console.log('Using environment variables for AWS configuration');
    return {
      region: envConfig.awsRegion,
      credentials: {
        accessKeyId: envConfig.accessKeyId,
        secretAccessKey: envConfig.secretAccessKey,
      },
      bedrock: {
        modelId: envConfig.bedrockModelId,
        region: envConfig.awsRegion,
      },
      s3: {
        bucketName: envConfig.s3BucketName,
        region: envConfig.s3Region,
      },
      transcribe: {
        region: envConfig.awsRegion,
      },
      source: 'environment',
    };
  }
  
  // Try Secrets Manager if environment variables are not available
  try {
    console.log('Environment variables not found, attempting to load from Secrets Manager');
    const secretsConfig = await loadConfigFromSecrets();
    
    return {
      region: secretsConfig.awsCredentials.region,
      credentials: {
        accessKeyId: secretsConfig.awsCredentials.accessKeyId,
        secretAccessKey: secretsConfig.awsCredentials.secretAccessKey,
      },
      bedrock: {
        modelId: secretsConfig.bedrockConfig.modelId,
        region: secretsConfig.bedrockConfig.region,
      },
      s3: {
        bucketName: secretsConfig.s3Config.bucketName,
        region: secretsConfig.s3Config.region,
      },
      transcribe: {
        region: secretsConfig.awsCredentials.region,
      },
      source: 'secrets-manager',
    };
  } catch (error) {
    console.warn('Failed to load from Secrets Manager, using fallback configuration:', error);
    
    // Return fallback configuration
    return fallbackConfig;
  }
}

/**
 * Get AWS SDK configuration object
 */
export async function getAWSConfig(): Promise<{
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}> {
  const config = await getEnhancedAWSConfig();
  
  return {
    region: config.region,
    credentials: config.credentials,
  };
}

/**
 * Get Bedrock configuration
 */
export async function getBedrockConfig(): Promise<{
  region: string;
  modelId: string;
}> {
  const config = await getEnhancedAWSConfig();
  
  return {
    region: config.bedrock.region,
    modelId: config.bedrock.modelId,
  };
}

/**
 * Get S3 configuration
 */
export async function getS3Config(): Promise<{
  bucketName: string;
  region: string;
}> {
  const config = await getEnhancedAWSConfig();
  
  return {
    bucketName: config.s3.bucketName,
    region: config.s3.region,
  };
}

/**
 * Get Transcribe configuration
 */
export async function getTranscribeConfig(): Promise<{
  region: string;
}> {
  const config = await getEnhancedAWSConfig();
  
  return {
    region: config.transcribe.region,
  };
}

/**
 * Test AWS configuration
 */
export async function testAWSConfiguration(): Promise<{
  success: boolean;
  message: string;
  config: EnhancedAWSConfig;
}> {
  try {
    const config = await getEnhancedAWSConfig();
    
    // Test Secrets Manager connectivity if using it
    if (config.source === 'secrets-manager') {
      const secretsTest = await testSecretsManagerConnection();
      if (!secretsTest.success) {
        return {
          success: false,
          message: `Secrets Manager test failed: ${secretsTest.message}`,
          config,
        };
      }
    }
    
    return {
      success: true,
      message: `AWS configuration loaded successfully from ${config.source}`,
      config,
    };
  } catch (error) {
    return {
      success: false,
      message: `AWS configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      config: fallbackConfig,
    };
  }
}

/**
 * Get configuration summary for debugging
 */
export async function getConfigurationSummary(): Promise<{
  source: string;
  region: string;
  hasCredentials: boolean;
  bedrockModelId: string;
  s3BucketName: string;
  nodeEnv: string;
}> {
  const config = await getEnhancedAWSConfig();
  const envConfig = getServerEnvironmentConfig();
  
  return {
    source: config.source,
    region: config.region,
    hasCredentials: !!(config.credentials.accessKeyId && config.credentials.secretAccessKey),
    bedrockModelId: config.bedrock.modelId,
    s3BucketName: config.s3.bucketName,
    nodeEnv: envConfig.nodeEnv,
  };
}
