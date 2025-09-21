#!/usr/bin/env node

/**
 * Environment Setup Script for Golden West Business News
 * This script helps set up environment variables for different deployment scenarios
 */

const fs = require('fs');
const path = require('path');

// Environment configurations for different scenarios
const environments = {
  development: {
    NEXT_PUBLIC_APP_NAME: 'Golden West Business News',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NODE_ENV: 'development',
    AWS_REGION: 'us-west-1',
    BEDROCK_MODEL_ID: 'amazon.titan-text-express-v1',
    NEXT_PUBLIC_S3_BUCKET_NAME: 'gwbn-storage',
    NEXT_PUBLIC_S3_REGION: 'us-west-1',
    ENABLE_BEDROCK: 'true',
    ENABLE_TRANSCRIBE: 'true',
    ENABLE_S3_UPLOAD: 'true',
    // Note: ACCESS_KEY_ID and SECRET_ACCESS_KEY should be set manually for security
  },
  
  production: {
    NEXT_PUBLIC_APP_NAME: 'Golden West Business News',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NODE_ENV: 'production',
    AWS_REGION: 'us-west-1',
    BEDROCK_MODEL_ID: 'amazon.titan-text-express-v1',
    NEXT_PUBLIC_S3_BUCKET_NAME: 'gwbn-storage',
    NEXT_PUBLIC_S3_REGION: 'us-west-1',
    ENABLE_BEDROCK: 'true',
    ENABLE_TRANSCRIBE: 'true',
    ENABLE_S3_UPLOAD: 'true',
    // Note: ACCESS_KEY_ID and SECRET_ACCESS_KEY should be set via AWS Secrets Manager
  },
  
  amplify: {
    NEXT_PUBLIC_APP_NAME: 'Golden West Business News',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NODE_ENV: 'production',
    AWS_REGION: 'us-west-1',
    BEDROCK_MODEL_ID: 'amazon.titan-text-express-v1',
    NEXT_PUBLIC_S3_BUCKET_NAME: 'gwbn-storage',
    NEXT_PUBLIC_S3_REGION: 'us-west-1',
    ENABLE_BEDROCK: 'true',
    ENABLE_TRANSCRIBE: 'true',
    ENABLE_S3_UPLOAD: 'true',
    // Note: Set these in Amplify console under Environment variables
    // ACCESS_KEY_ID: 'your_access_key_here',
    // SECRET_ACCESS_KEY: 'your_secret_key_here',
  }
};

// AWS Secrets Manager secrets structure
const secretsStructure = {
  'gwbn/aws-credentials': {
    accessKeyId: 'your_access_key_here',
    secretAccessKey: 'your_secret_key_here',
    region: 'us-west-1'
  },
  'gwbn/bedrock-config': {
    modelId: 'amazon.titan-text-express-v1',
    region: 'us-west-1'
  },
  'gwbn/s3-config': {
    bucketName: 'gwbn-storage',
    region: 'us-west-1'
  }
};

function generateEnvFile(environment) {
  const config = environments[environment];
  if (!config) {
    console.error(`Unknown environment: ${environment}`);
    process.exit(1);
  }
  
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envFile = `.env.${environment}.local`;
  const envPath = path.join(process.cwd(), envFile);
  
  fs.writeFileSync(envPath, envContent + '\n');
  console.log(`✅ Generated ${envFile}`);
  
  // Also generate .env.local for development
  if (environment === 'development') {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envLocalPath, envContent + '\n');
    console.log('✅ Generated .env.local');
  }
}

function generateSecretsTemplate() {
  const secretsPath = path.join(process.cwd(), 'aws-secrets-template.json');
  fs.writeFileSync(secretsPath, JSON.stringify(secretsStructure, null, 2));
  console.log('✅ Generated aws-secrets-template.json');
  console.log('📝 Use this template to create secrets in AWS Secrets Manager');
}

function generateAmplifyEnvVars() {
  const amplifyEnvPath = path.join(process.cwd(), 'amplify-environment-variables.md');
  
  const amplifyConfig = environments.amplify;
  const envVarsContent = `# AWS Amplify Environment Variables

Set these environment variables in your Amplify console under **Environment variables**:

\`\`\`
${Object.entries(amplifyConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}
\`\`\`

## Required AWS Credentials

**Important**: Set these in Amplify console (not in this file):

\`\`\`
ACCESS_KEY_ID=your_actual_access_key_here
SECRET_ACCESS_KEY=your_actual_secret_key_here
\`\`\`

## AWS Services Required

1. **Amazon Bedrock**: Enable required models in your AWS account
2. **Amazon Transcribe**: Ensure service is available in us-west-1
3. **Amazon S3**: Create bucket named 'gwbn-storage' in us-west-1
4. **AWS Secrets Manager**: Optional, for secure credential storage

## IAM Permissions Required

Your AWS user/role needs these permissions:
- \`bedrock:InvokeModel\`
- \`transcribe:StartTranscriptionJob\`
- \`transcribe:GetTranscriptionJob\`
- \`s3:PutObject\`
- \`s3:GetObject\`
- \`secretsmanager:GetSecretValue\` (if using Secrets Manager)

## Testing

After deployment, test these endpoints:
- \`/api/test-env-complete\` - Test environment configuration
- \`/api/test-bedrock\` - Test Bedrock connectivity
- \`/api/debug-aws\` - Test AWS services
`;

  fs.writeFileSync(amplifyEnvPath, envVarsContent);
  console.log('✅ Generated amplify-environment-variables.md');
}

function generateDockerEnv() {
  const dockerEnvPath = path.join(process.cwd(), '.env.docker');
  const dockerConfig = {
    ...environments.production,
    // Docker-specific overrides
    NODE_ENV: 'production',
    PORT: '3000',
  };
  
  const dockerEnvContent = Object.entries(dockerConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(dockerEnvPath, dockerEnvContent + '\n');
  console.log('✅ Generated .env.docker');
}

function showUsage() {
  console.log(`
🔧 Environment Setup Script for Golden West Business News

Usage:
  node scripts/setup-environment.js <command> [environment]

Commands:
  generate <env>     Generate environment file for specified environment
  secrets           Generate AWS Secrets Manager template
  amplify           Generate Amplify environment variables guide
  docker            Generate Docker environment file
  all               Generate all environment files and templates

Environments:
  development       Local development environment
  production        Production deployment
  amplify          AWS Amplify deployment

Examples:
  node scripts/setup-environment.js generate development
  node scripts/setup-environment.js generate production
  node scripts/setup-environment.js secrets
  node scripts/setup-environment.js all
`);
}

function main() {
  const command = process.argv[2];
  const environment = process.argv[3];
  
  switch (command) {
    case 'generate':
      if (!environment) {
        console.error('❌ Environment required for generate command');
        showUsage();
        process.exit(1);
      }
      generateEnvFile(environment);
      break;
      
    case 'secrets':
      generateSecretsTemplate();
      break;
      
    case 'amplify':
      generateAmplifyEnvVars();
      break;
      
    case 'docker':
      generateDockerEnv();
      break;
      
    case 'all':
      console.log('🚀 Generating all environment configurations...');
      generateEnvFile('development');
      generateEnvFile('production');
      generateEnvFile('amplify');
      generateSecretsTemplate();
      generateAmplifyEnvVars();
      generateDockerEnv();
      console.log('\n✅ All environment configurations generated!');
      console.log('\n📋 Next steps:');
      console.log('1. Set AWS credentials in your environment files');
      console.log('2. Create AWS resources (S3 bucket, enable Bedrock models)');
      console.log('3. For Amplify: Set environment variables in Amplify console');
      console.log('4. For Secrets Manager: Use aws-secrets-template.json as reference');
      break;
      
    default:
      showUsage();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  environments,
  secretsStructure,
  generateEnvFile,
  generateSecretsTemplate,
  generateAmplifyEnvVars,
  generateDockerEnv,
};
