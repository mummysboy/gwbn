import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get ALL environment variables (be careful not to expose sensitive data)
    const allEnvVars = process.env;
    
    // Check specific AWS-related variables
    const awsVars = {
      REGION: process.env.REGION,
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET (length: ' + process.env.ACCESS_KEY_ID.length + ')' : 'NOT_SET',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.SECRET_ACCESS_KEY.length + ')' : 'NOT_SET',
      ARTICLES_TABLE: process.env.ARTICLES_TABLE,
      USERS_TABLE: process.env.USERS_TABLE,
      ANALYTICS_TABLE: process.env.ANALYTICS_TABLE,
    };

    // Check for other AWS environment variables that might be set
    const otherAwsVars = {
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN ? 'SET' : 'NOT_SET',
      ROLE_ARN: process.env.ROLE_ARN ? 'SET' : 'NOT_SET',
      WEB_IDENTITY_TOKEN_FILE: process.env.WEB_IDENTITY_TOKEN_FILE ? 'SET' : 'NOT_SET',
    };

    // Check hosting platform variables
    const platformVars = {
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      AMPLIFY_APP_ID: process.env.AMPLIFY_APP_ID ? 'SET' : 'NOT_SET',
      AMPLIFY_BRANCH: process.env.AMPLIFY_BRANCH,
      NETLIFY: process.env.NETLIFY ? 'true' : 'false',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check if variables are accessible in different ways
    const accessTests = {
      directAccess: {
        REGION: !!process.env.REGION,
        ACCESS_KEY_ID: !!process.env.ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: !!process.env.SECRET_ACCESS_KEY,
      },
      bracketAccess: {
        REGION: !!(process.env['REGION']),
        ACCESS_KEY_ID: !!(process.env['ACCESS_KEY_ID']),
        SECRET_ACCESS_KEY: !!(process.env['SECRET_ACCESS_KEY']),
      },
      hasOwnProperty: {
        REGION: process.env.hasOwnProperty('REGION'),
        ACCESS_KEY_ID: process.env.hasOwnProperty('ACCESS_KEY_ID'),
        SECRET_ACCESS_KEY: process.env.hasOwnProperty('SECRET_ACCESS_KEY'),
      }
    };

    // Count total environment variables
    const envVarCount = Object.keys(allEnvVars).length;
    const awsRelatedVars = Object.keys(allEnvVars).filter(key => 
      key.includes('AWS') || key.includes('REGION') || key.includes('TABLE')
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalEnvVars: envVarCount,
        awsRelatedVarsCount: awsRelatedVars.length,
        hasRegion: !!process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      },
      awsVariables: awsVars,
      otherAwsVariables: otherAwsVars,
      platformVariables: platformVars,
      accessTests: accessTests,
      awsRelatedVars: awsRelatedVars.reduce((obj, key) => {
        obj[key] = process.env[key] ? 'SET' : 'NOT_SET';
        return obj;
      }, {} as Record<string, string>),
      allEnvVarKeys: Object.keys(allEnvVars).sort(),
      recommendations: [
        !process.env.REGION ? 'Set REGION environment variable' : null,
        !process.env.ACCESS_KEY_ID ? 'Set ACCESS_KEY_ID environment variable' : null,
        !process.env.SECRET_ACCESS_KEY ? 'Set SECRET_ACCESS_KEY environment variable' : null,
        process.env.VERCEL ? 'Check Vercel Environment Variables in project settings' : null,
        process.env.AMPLIFY_APP_ID ? 'Check AWS Amplify Environment Variables in app settings' : null,
        process.env.NETLIFY ? 'Check Netlify Environment Variables in site settings' : null,
      ].filter(Boolean)
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Environment debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
