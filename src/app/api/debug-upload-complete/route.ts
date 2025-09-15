import { NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

interface BucketAccessInfo {
  success: boolean;
  bucket: string;
  message?: string;
  error?: string;
  code?: string | number;
}

interface AWSConnectivityTest {
  success: boolean;
  bucketCount: number;
  buckets: (string | undefined)[];
  bucketAccess?: BucketAccessInfo;
  error?: string;
  code?: string | number;
}

export async function GET() {
  try {
    const s3ConfigStatus = S3Service.getConfigStatus();
    const isConfigured = S3Service.isConfigured();
    
    // Detailed environment check
    const envDetails = {
      REGION: process.env.REGION || 'NOT_SET',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? `SET (${process.env.ACCESS_KEY_ID.length} chars)` : 'NOT_SET',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? `SET (${process.env.SECRET_ACCESS_KEY.length} chars)` : 'NOT_SET',
      NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'NOT_SET',
      NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION || 'NOT_SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
    };
    
    // Platform detection
    const platformInfo = {
      isVercel: !!process.env.VERCEL,
      isAmplify: !!process.env.AMPLIFY_APP_ID,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      amplifyBranch: process.env.AMPLIFY_BRANCH,
    };
    
    // Test AWS connectivity if credentials are available
    let awsConnectivityTest: AWSConnectivityTest | null = null;
    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
      try {
        const testClient = new S3Client({
          region: process.env.NEXT_PUBLIC_S3_REGION || process.env.REGION || 'us-west-1',
          credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          },
        });
        
        // Test basic connectivity
        const listCommand = new ListBucketsCommand({});
        const listResult = await testClient.send(listCommand);
        
        awsConnectivityTest = {
          success: true,
          bucketCount: listResult.Buckets?.length || 0,
          buckets: listResult.Buckets?.map(b => b.Name) || [],
        };
        
        // Test specific bucket access
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
        if (bucketName && bucketName !== 'NOT_SET') {
          try {
            const headCommand = new HeadBucketCommand({ Bucket: bucketName });
            await testClient.send(headCommand);
            awsConnectivityTest.bucketAccess = {
              success: true,
              bucket: bucketName,
              message: 'Bucket exists and is accessible'
            };
          } catch (bucketError) {
            awsConnectivityTest.bucketAccess = {
              success: false,
              bucket: bucketName,
              error: bucketError instanceof Error ? bucketError.message : 'Unknown error',
              code: (bucketError as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode || 'Unknown'
            };
          }
        }
        
      } catch (awsError) {
        awsConnectivityTest = {
          success: false,
          bucketCount: 0,
          buckets: [],
          error: awsError instanceof Error ? awsError.message : 'Unknown error',
          code: (awsError as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode || 'Unknown'
        };
      }
    }
    
    // Generate specific recommendations
    const recommendations = [];
    
    if (!isConfigured) {
      recommendations.push('S3 service is not properly configured');
      
      if (!process.env.ACCESS_KEY_ID) {
        recommendations.push('❌ ACCESS_KEY_ID is missing');
      }
      if (!process.env.SECRET_ACCESS_KEY) {
        recommendations.push('❌ SECRET_ACCESS_KEY is missing');
      }
      if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
        recommendations.push('❌ NEXT_PUBLIC_S3_BUCKET_NAME is missing');
      }
      if (!process.env.NEXT_PUBLIC_S3_REGION) {
        recommendations.push('❌ NEXT_PUBLIC_S3_REGION is missing');
      }
    } else {
      recommendations.push('✅ S3 service appears to be configured');
      
      if (awsConnectivityTest && !awsConnectivityTest.success) {
        recommendations.push('❌ AWS connectivity test failed: ' + awsConnectivityTest.error);
      } else if (awsConnectivityTest && awsConnectivityTest.success) {
        recommendations.push('✅ AWS connectivity test passed');
        
        if (awsConnectivityTest.bucketAccess && !awsConnectivityTest.bucketAccess.success) {
          recommendations.push('❌ Bucket access failed: ' + awsConnectivityTest.bucketAccess.error);
          if (awsConnectivityTest.bucketAccess.code === 404) {
            recommendations.push('💡 Bucket does not exist - create it with: aws s3 mb s3://' + process.env.NEXT_PUBLIC_S3_BUCKET_NAME);
          } else if (awsConnectivityTest.bucketAccess.code === 403) {
            recommendations.push('💡 Access denied - check bucket permissions and IAM policy');
          }
        } else if (awsConnectivityTest.bucketAccess && awsConnectivityTest.bucketAccess.success) {
          recommendations.push('✅ Bucket access test passed');
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        s3Configured: isConfigured,
        awsConnectivityWorking: awsConnectivityTest?.success || false,
        bucketAccessible: awsConnectivityTest?.bucketAccess?.success || false,
        status: isConfigured && awsConnectivityTest?.success && awsConnectivityTest?.bucketAccess?.success ? 'FULLY_WORKING' : 'NEEDS_ATTENTION'
      },
      s3Configuration: s3ConfigStatus,
      environmentVariables: envDetails,
      platformInfo,
      awsConnectivityTest,
      recommendations,
      nextSteps: [
        'Check the recommendations above',
        'If bucket access failed, verify the bucket exists and has proper permissions',
        'If AWS connectivity failed, verify your credentials are correct',
        'Test upload functionality after fixing any issues'
      ]
    });
    
  } catch (error) {
    console.error('Complete upload debug error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to debug upload configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
