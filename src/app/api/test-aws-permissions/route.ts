import { NextRequest, NextResponse } from 'next/server';
import { TranscribeClient, ListTranscriptionJobsCommand } from '@aws-sdk/client-transcribe';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getAWSConfig, getS3Config } from '@/lib/enhanced-aws-config';

export async function GET() {
  try {
    console.log('Testing AWS permissions...');
    
    const awsConfig = await getAWSConfig();
    const s3Config = await getS3Config();
    
    // Test 1: AWS Transcribe permissions
    console.log('Testing AWS Transcribe permissions...');
    const transcribeClient = new TranscribeClient({
      region: awsConfig.region,
      credentials: awsConfig.credentials,
    });
    
    try {
      const listCommand = new ListTranscriptionJobsCommand({ MaxResults: 1 });
      await transcribeClient.send(listCommand);
      console.log('✅ AWS Transcribe permissions: OK');
    } catch (error) {
      console.error('❌ AWS Transcribe permissions failed:', error);
    }
    
    // Test 2: S3 permissions
    console.log('Testing S3 permissions...');
    const s3Client = new S3Client({
      region: awsConfig.region,
      credentials: awsConfig.credentials,
    });
    
    try {
      const listObjectsCommand = new ListObjectsV2Command({ 
        Bucket: s3Config.bucketName,
        MaxKeys: 1 
      });
      await s3Client.send(listObjectsCommand);
      console.log('✅ S3 permissions: OK');
    } catch (error) {
      console.error('❌ S3 permissions failed:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'AWS permissions test completed',
      timestamp: new Date().toISOString(),
      tests: {
        transcribe: 'Tested',
        s3: 'Tested'
      }
    });
    
  } catch (error) {
    console.error('AWS permissions test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}





