import { NextRequest, NextResponse } from 'next/server';

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

    console.log('Upload API: Processing image upload (no external dependencies)');

    // Convert file to base64 for storage
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Create a data URL for the image
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    // For now, we'll return the data URL directly
    // In a real implementation, you might want to store this in a database
    const url = dataUrl;

    console.log('Upload API: Successfully processed image:', { fileName, size: file.size });

    return NextResponse.json({
      success: true,
      url: url,
      filename: fileName,
      storageType: 'base64'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}