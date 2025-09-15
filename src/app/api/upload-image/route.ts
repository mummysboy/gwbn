import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'articles';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('Upload API: Processing image upload to S3 (using IAM roles)');

    // Initialize S3 client with IAM role (no environment variables needed)
    const s3Client = new S3Client({
      region: 'us-west-1', // Default region
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // S3 bucket name (you can hardcode this or use a default)
    const bucketName = 'gwbn-storage';
    const key = `${folder}/${fileName}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: 'public-read', // Make the image publicly accessible
    });

    await s3Client.send(command);

    // Generate the public URL
    const url = `https://${bucketName}.s3.us-west-1.amazonaws.com/${key}`;

    console.log('Upload API: Successfully uploaded to S3:', { fileName, url });

    return NextResponse.json({
      success: true,
      url: url,
      key: key,
      filename: fileName,
      storageType: 's3'
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    
    // If S3 fails, fall back to base64
    try {
      console.log('S3 upload failed, falling back to base64 storage');
      
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Convert file to base64 for fallback storage
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Create a data URL for the image
      const dataUrl = `data:${file.type};base64,${base64}`;

      console.log('Upload API: Fallback to base64 successful:', { fileName });

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: fileName,
        storageType: 'base64-fallback'
      });

    } catch (fallbackError) {
      console.error('Fallback upload error:', fallbackError);
      return NextResponse.json(
        { 
          error: 'Upload failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
}