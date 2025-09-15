import { NextResponse } from 'next/server';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export async function GET() {
  try {
    console.log('Testing OpenAI secret retrieval');
    
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-west-1',
    });

    const command = new GetSecretValueCommand({
      SecretId: 'gwbn-openai-api-key',
    });

    const response = await secretsClient.send(command);
    
    if (response.SecretString) {
      const secretData = JSON.parse(response.SecretString);
      const hasApiKey = !!secretData.apiKey;
      
      return NextResponse.json({
        success: true,
        message: 'OpenAI secret retrieved successfully',
        hasApiKey,
        apiKeyLength: secretData.apiKey ? secretData.apiKey.length : 0,
        secretName: 'gwbn-openai-api-key',
        region: process.env.AWS_REGION || 'us-west-1'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No secret string found in response',
        secretName: 'gwbn-openai-api-key'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('OpenAI secret test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = error instanceof Error ? error.name : 'Unknown';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve OpenAI secret',
      details: errorMessage,
      errorType,
      secretName: 'gwbn-openai-api-key',
      region: process.env.AWS_REGION || 'us-west-1',
      suggestions: [
        'Create the secret in AWS Secrets Manager',
        'Ensure Lambda IAM role has secretsmanager:GetSecretValue permission',
        'Verify the secret name is exactly: gwbn-openai-api-key',
        'Check that the secret is in the correct region'
      ]
    }, { status: 500 });
  }
}
