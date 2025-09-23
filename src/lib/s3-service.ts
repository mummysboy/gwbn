import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serverConfig = require('./server-aws-config');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

// Function to initialize S3 client
function initializeS3Client() {
  if (s3Client) return s3Client; // Already initialized
  
  try {
    if (hasAWSCredentials && serverAWSConfig && serverS3Config) {
      console.log('S3 Service: Using access key credentials');
      s3Client = new S3Client({
        region: serverS3Config.region,
        credentials: {
          accessKeyId: serverAWSConfig.accessKeyId!,
          secretAccessKey: serverAWSConfig.secretAccessKey!,
        },
      });
    } else {
      console.log('S3 Service: Using IAM role/default credentials (Gen 2 compatible)');
      s3Client = new S3Client({
        region: serverS3Config?.region || 'us-west-1',
      });
    }
  } catch (error) {
    console.error('S3 Service: Failed to initialize S3 client:', error);
    s3Client = null;
  }
  
  return s3Client;
}

// Initialize immediately
initializeS3Client();

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
    // Ensure S3 client is initialized
    const client = initializeS3Client();
    if (!client) {
      return {
        success: false,
        error: 'S3 client not configured. Please check your AWS credentials and environment variables.'
      };
    }

    if (!serverS3Config?.bucketName) {
      return {
        success: false,
        error: 'S3 bucket name not configured. Using hardcoded bucket: gwbn-storage'
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

      // Upload to S3 (bucket policy will handle public access)
      const command = new PutObjectCommand({
        Bucket: serverS3Config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // ACL removed - bucket policy should handle public access
      });

      await client.send(command);

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
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('NoSuchBucket')) {
          errorMessage = `S3 bucket '${serverS3Config.bucketName}' does not exist. Please create the bucket or check the bucket name.`;
        } else if (error.message.includes('AccessDenied')) {
          errorMessage = 'Access denied. Please check your AWS credentials and S3 permissions.';
        } else if (error.message.includes('InvalidAccessKeyId')) {
          errorMessage = 'Invalid AWS access key. Please check your ACCESS_KEY_ID environment variable.';
        } else if (error.message.includes('SignatureDoesNotMatch')) {
          errorMessage = 'Invalid AWS secret key. Please check your SECRET_ACCESS_KEY environment variable.';
        } else if (error.message.includes('TokenRefreshRequired')) {
          errorMessage = 'AWS credentials expired. Please refresh your credentials.';
        }
      }
      
      return {
        success: false,
        error: errorMessage
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
   * Generate a signed URL for accessing an S3 object
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const serverS3Config = await getServerS3Config();
      
      if (!serverS3Config) {
        console.error('S3 Service: No S3 configuration available');
        return null;
      }

      const client = new S3Client({
        region: serverS3Config.region,
        credentials: serverS3Config.credentials,
      });

      const command = new GetObjectCommand({
        Bucket: serverS3Config.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('S3 Service: Failed to generate signed URL:', error);
      return null;
    }
  }

  /**
   * Check if S3 is properly configured
   */
  static isConfigured(): boolean {
    const client = initializeS3Client();
    const hasClient = !!client;
    // Always return true for bucket name since we're using hardcoded values
    const hasBucketName = true;
    
    console.log('S3 Service: Configuration check:', {
      hasClient,
      hasBucketName,
      bucketName: 'gwbn-storage (hardcoded)',
      hasAWSCredentials,
      hasIAMRole,
      isLambda
    });
    
    return hasClient && hasBucketName;
  }

  /**
   * Get configuration status for debugging
   */
  static getConfigStatus() {
    const client = initializeS3Client();
    return {
      hasClient: !!client,
      bucketName: 'gwbn-storage (hardcoded)',
      region: 'us-west-1 (hardcoded)',
      hasAWSCredentials,
      hasIAMRole,
      isLambda
    };
  }
}
