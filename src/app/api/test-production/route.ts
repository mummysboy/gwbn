import { NextResponse } from 'next/server';
import { ArticleService } from '@/lib/aws-services';

export async function GET() {
  try {
    console.log('Production Test: Starting test');
    
    // Test 1: Environment check
    const envIssues = [];
    if (!process.env.REGION) envIssues.push('Missing REGION');
    if (!process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY) {
      envIssues.push('Missing AWS credentials');
    }
    
    if (envIssues.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Environment configuration issues',
        issues: envIssues,
        platform: {
          vercel: !!process.env.VERCEL,
          amplify: !!process.env.AMPLIFY_APP_ID,
          netlify: !!process.env.NETLIFY,
        }
      }, { status: 400 });
    }

    // Test 2: Try to fetch articles
    try {
      const articles = await ArticleService.getArticles('published');
      
      return NextResponse.json({
        success: true,
        message: 'Production test successful!',
        articlesCount: articles.length,
        sampleArticle: articles[0] ? {
          id: articles[0].id,
          title: articles[0].title,
          author: articles[0].author,
          status: articles[0].status
        } : null,
        environment: {
          region: process.env.REGION,
          hasCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
          articlesTable: process.env.ARTICLES_TABLE || 'gwbn-articles',
        },
        platform: {
          vercel: !!process.env.VERCEL,
          amplify: !!process.env.AMPLIFY_APP_ID,
          netlify: !!process.env.NETLIFY,
        }
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch articles in production',
        details: errorMessage,
        errorType: error instanceof Error ? error.name : 'Unknown',
        environment: {
          region: process.env.REGION,
          hasCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
          articlesTable: process.env.ARTICLES_TABLE || 'gwbn-articles',
        },
        platform: {
          vercel: !!process.env.VERCEL,
          amplify: !!process.env.AMPLIFY_APP_ID,
          netlify: !!process.env.NETLIFY,
        },
        suggestions: [
          'Check environment variables in hosting platform',
          'Verify DynamoDB table exists in correct region',
          'Ensure IAM role has DynamoDB permissions',
          'Check AWS credentials are valid'
        ]
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Production test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
