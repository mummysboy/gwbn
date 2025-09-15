import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { awsConfig } from './aws-config';

// Check if AWS credentials are configured
const hasAWSCredentials = awsConfig.accessKeyId && awsConfig.secretAccessKey;
const hasIAMRole = !!(process.env.ROLE_ARN || process.env.WEB_IDENTITY_TOKEN_FILE);

// Initialize DynamoDB client
let client: DynamoDBClient | null = null;

if (hasAWSCredentials) {
  // Use access keys
  client = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
      accessKeyId: awsConfig.accessKeyId!,
      secretAccessKey: awsConfig.secretAccessKey!,
    },
  });
} else if (hasIAMRole) {
  // Use IAM role (for AWS services like Lambda, EC2, etc.)
  client = new DynamoDBClient({
    region: awsConfig.region,
  });
} else {
  console.warn('No AWS credentials found. DynamoDB operations will fail.');
}

const docClient = client ? DynamoDBDocumentClient.from(client) : null;

// Table names
export const TABLES = {
  ARTICLES: process.env.ARTICLES_TABLE || 'gwbn-articles',
  USERS: process.env.USERS_TABLE || 'gwbn-users',
  ANALYTICS: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
} as const;

// Article interface
export interface Article {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  author?: string;
  category?: string;
  readTime?: number;
  views?: number;
  likes?: number;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'reporter';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

// Analytics interface
export interface Analytics {
  id: string;
  date: string;
  articlesPublished: number;
  totalViews: number;
  totalLikes: number;
  systemHealth: number;
}

// Article operations
export class ArticleService {
  static async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const now = new Date().toISOString();
    const newArticle: Article = {
      ...article,
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0,
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.ARTICLES,
      Item: newArticle,
    }));

    return newArticle;
  }

  static async getArticle(id: string): Promise<Article | null> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
    }));

    return result.Item as Article || null;
  }

  static async getArticles(status?: 'draft' | 'published'): Promise<Article[]> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const params: {
      TableName: string;
      FilterExpression?: string;
      ExpressionAttributeNames?: Record<string, string>;
      ExpressionAttributeValues?: Record<string, string>;
    } = {
      TableName: TABLES.ARTICLES,
    };

    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames = {
        '#status': 'status',
      };
      params.ExpressionAttributeValues = {
        ':status': status,
      };
    }

    const result = await docClient.send(new ScanCommand(params));
    
    const articles = (result.Items as Article[] || []).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return articles;
  }

  static async updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'id' && updates[key as keyof Article] !== undefined) {
        updateExpression.push(`#${key} = :val${index}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = updates[key as keyof Article];
      }
    });

    if (updateExpression.length === 0) {
      return await this.getArticle(id);
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Article || null;
  }

  static async deleteArticle(id: string): Promise<boolean> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
    }));

    return true;
  }

  static async incrementViews(id: string): Promise<void> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
      UpdateExpression: 'ADD #views :increment',
      ExpressionAttributeNames: {
        '#views': 'views',
      },
      ExpressionAttributeValues: {
        ':increment': 1,
      },
    }));
  }
}

// User operations
export class UserService {
  static async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
    };

    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: newUser,
    }));

    return newUser;
  }

  static async getUsers(): Promise<User[]> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS,
    }));

    return (result.Items as User[] || []).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async getUser(id: string): Promise<User | null> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { id },
    }));

    return result.Item as User || null;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'id' && updates[key as keyof User] !== undefined) {
        updateExpression.push(`#${key} = :val${index}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = updates[key as keyof User];
      }
    });

    if (updateExpression.length === 0) {
      return await this.getUser(id);
    }

    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as User || null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLES.USERS,
      Key: { id },
    }));

    return true;
  }
}

// Analytics operations
export class AnalyticsService {
  static async getTodayStats(): Promise<Analytics | null> {
    const today = new Date().toISOString().split('T')[0];
    
    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.ANALYTICS,
      Key: { id: `daily_${today}` },
    }));

    return result.Item as Analytics || null;
  }

  static async updateDailyStats(): Promise<Analytics> {
    const today = new Date().toISOString().split('T')[0];
    const id = `daily_${today}`;

    // Get today's published articles
    const articles = await ArticleService.getArticles('published');
    const todayArticles = articles.filter(article => 
      article.createdAt.startsWith(today)
    );

    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);

    const analytics: Analytics = {
      id,
      date: today,
      articlesPublished: todayArticles.length,
      totalViews,
      totalLikes,
      systemHealth: 99.9, // This could be calculated from actual system metrics
    };

    if (!docClient) {
      throw new Error('AWS DynamoDB client not configured. Please check your AWS credentials and environment variables.');
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.ANALYTICS,
      Item: analytics,
    }));

    return analytics;
  }

  static async getRecentActivities(): Promise<Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    icon: string;
  }>> {
    const articles = await ArticleService.getArticles();
    const recentArticles = articles.slice(0, 10);

    return recentArticles.map(article => ({
      id: article.id,
      type: 'article_published',
      message: `Article published: "${article.title}"`,
      time: this.formatTimeAgo(article.createdAt),
      icon: 'DocumentTextIcon',
    }));
  }

  private static formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }
}
