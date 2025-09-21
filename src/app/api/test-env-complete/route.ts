import { NextResponse } from 'next/server';
import { validateEnvironment, getEnvironmentInfo } from '@/lib/env-config';
import { testAWSConfiguration, getConfigurationSummary } from '@/lib/enhanced-aws-config';
import { testSecretsManagerConnection } from '@/lib/secrets-manager';

export async function GET() {
  try {
    console.log('Testing complete environment configuration...');
    
    // Test environment validation
    const envValidation = validateEnvironment();
    console.log('Environment validation result:', envValidation);
    
    // Get environment info
    const envInfo = getEnvironmentInfo();
    console.log('Environment info:', envInfo);
    
    // Test AWS configuration
    const awsTest = await testAWSConfiguration();
    console.log('AWS configuration test result:', awsTest);
    
    // Get configuration summary
    const configSummary = await getConfigurationSummary();
    console.log('Configuration summary:', configSummary);
    
    // Test Secrets Manager connectivity
    const secretsTest = await testSecretsManagerConnection();
    console.log('Secrets Manager test result:', secretsTest);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        environmentValidation: envValidation,
        environmentInfo: envInfo,
        awsConfiguration: awsTest,
        configurationSummary: configSummary,
        secretsManager: secretsTest,
      },
      recommendations: generateRecommendations(envValidation, { ...awsTest, config: awsTest.config as unknown as { source: string; [key: string]: unknown } }, secretsTest),
    });
    
  } catch (error) {
    console.error('Environment test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function generateRecommendations(
  envValidation: { isValid: boolean; errors: string[] },
  awsTest: { success: boolean; message: string; config: { source: string; [key: string]: unknown } },
  secretsTest: { success: boolean; message: string }
): string[] {
  const recommendations: string[] = [];
  
  if (!envValidation.isValid) {
    recommendations.push('Fix environment variable issues: ' + envValidation.errors.join(', '));
  }
  
  if (!awsTest.success) {
    recommendations.push('AWS configuration issue: ' + awsTest.message);
  }
  
  if (!secretsTest.success) {
    recommendations.push('Secrets Manager issue: ' + secretsTest.message);
  }
  
  if (awsTest.config?.source === 'fallback') {
    recommendations.push('Using fallback configuration - set up proper AWS credentials');
  }
  
  if (awsTest.config?.source === 'environment') {
    recommendations.push('Using environment variables - consider using AWS Secrets Manager for production');
  }
  
  if (awsTest.config?.source === 'secrets-manager') {
    recommendations.push('Using AWS Secrets Manager - good for production deployment');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Configuration looks good! Ready for deployment.');
  }
  
  return recommendations;
}
