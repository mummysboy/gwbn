import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Server-only imports - these will throw errors if imported by client components
interface ServerAWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

interface ClientS3Config {
  bucketName?: string;
  region: string;
}

let serverAWSConfig: ServerAWSConfig | null = null;
let serverS3Config: ClientS3Config | null = null;
let hasAWSCredentials = false;
let hasIAMRole = false;
let isLambda = false;

// Initialize server-side configuration only
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const serverConfig = require('./server-aws-config');
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const clientConfig = require('./client-config');
    
    serverAWSConfig = serverConfig.serverAWSConfig;
    serverS3Config = clientConfig.clientS3Config;
    
    // Check if AWS credentials are configured
    hasAWSCredentials = !!(serverAWSConfig?.accessKeyId && serverAWSConfig?.secretAccessKey);
    hasIAMRole = !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE);
    isLambda = !!(process.env.AWS_LAMBDA_FUNCTION_NAME);
  } catch (error) {
    console.error('Failed to load server configuration:', error);
  }
}

console.log('S3 Service: Initialization check:', {
  hasAWSCredentials,
  hasIAMRole,
  isLambda,
  region: serverAWSConfig?.region || 'NOT_CONFIGURED',
  hasAccessKey: !!serverAWSConfig?.accessKeyId,
  hasSecretKey: !!serverAWSConfig?.secretAccessKey,
  bucketName: serverS3Config?.bucketName || 'NOT_CONFIGURED',
  s3Region: serverS3Config?.region || 'NOT_CONFIGURED'
});

// Initialize S3 client
let s3Client: S3Client | null = null;

if (hasAWSCredentials && serverAWSConfig && serverS3Config) {
  console.log('S3 Service: Using access key credentials');
  s3Client = new S3Client({
    region: serverS3Config.region,
    credentials: {
      accessKeyId: serverAWSConfig.accessKeyId!,
      secretAccessKey: serverAWSConfig.secretAccessKey!,
    },
  });
} else if (hasIAMRole || isLambda) {
  console.log('S3 Service: Using IAM role/Lambda credentials');
  s3Client = new S3Client({
    region: serverS3Config?.region || 'us-west-1',
  });
} else {
  console.warn('S3 Service: No AWS credentials found. S3 operations will fail.');
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export class S3Service {
  /**
   * Upload an image file to S3
   */
  static async uploadImage(file: File, folder: string = 'articles'): Promise<UploadResult> {
    if (!s3Client) {
      return {
        success: false,
        error: 'S3 client not configured. Please check your AWS credentials and environment variables.'
      };
    }

    if (!serverS3Config?.bucketName) {
      return {
        success: false,
        error: 'S3 bucket name not configured. Please set NEXT_PUBLIC_S3_BUCKET_NAME environment variable.'
      };
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: serverS3Config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read', // Make the image publicly accessible
      });

      await s3Client.send(command);

      // Generate the public URL
      const url = `https://${serverS3Config.bucketName}.s3.${serverS3Config.region}.amazonaws.com/${key}`;

      console.log('S3 Service: Successfully uploaded image:', { key, url });

      return {
        success: true,
        url,
        key
      };

    } catch (error) {
      console.error('S3 Service: Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Upload multiple images to S3
   */
  static async uploadImages(files: File[], folder: string = 'articles'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from S3
   */
  static async deleteImage(key: string): Promise<boolean> {
    if (!s3Client || !serverS3Config?.bucketName) {
      console.error('S3 Service: Cannot delete image - S3 not configured');
      return false;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: serverS3Config.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      console.log('S3 Service: Successfully deleted image:', key);
      return true;

    } catch (error) {
      console.error('S3 Service: Delete failed:', error);
      return false;
    }
  }

  /**
   * Extract S3 key from URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove leading slash and extract the key
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      console.error('S3 Service: Invalid URL:', url);
      return null;
    }
  }

  /**
   * Check if S3 is properly configured
   */
  static isConfigured(): boolean {
    return !!(
      s3Client && 
      serverS3Config?.bucketName && 
      serverS3Config.bucketName !== 'your_bucket_name' &&
      serverS3Config.bucketName.length > 0
    );
  }

  /**
   * Get configuration status for debugging
   */
  static getConfigStatus() {
    return {
      hasClient: !!s3Client,
      bucketName: serverS3Config?.bucketName || 'NOT_CONFIGURED',
      region: serverS3Config?.region || 'NOT_CONFIGURED',
      hasAWSCredentials,
      hasIAMRole,
      isLambda
    };
  }
}
