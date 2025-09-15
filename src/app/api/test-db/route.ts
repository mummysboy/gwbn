import { NextResponse } from 'next/server';
import { ArticleService, UserService, AnalyticsService } from '@/lib/aws-services';
import { validateAWSConfig } from '@/lib/aws-config';

export async function GET() {
  try {
    // Check AWS configuration first
    const isValidConfig = validateAWSConfig();
    
    if (!isValidConfig) {
      return NextResponse.json({
        success: false,
        error: 'AWS configuration is invalid',
        tests: {
          config: { status: 'failed', message: 'AWS credentials not properly configured' },
          articles: { status: 'skipped', message: 'Skipped due to config failure' },
          users: { status: 'skipped', message: 'Skipped due to config failure' },
          analytics: { status: 'skipped', message: 'Skipped due to config failure' }
        }
      }, { status: 400 });
    }

    const results = {
      config: { status: 'passed', message: 'AWS configuration is valid' },
      articles: { status: 'unknown', message: 'Testing...' },
      users: { status: 'unknown', message: 'Testing...' },
      analytics: { status: 'unknown', message: 'Testing...' }
    };

    // Test Articles table
    try {
      const articles = await ArticleService.getArticles();
      results.articles = { 
        status: 'passed', 
        message: `Successfully connected to articles table. Found ${articles.length} articles.` 
      };
    } catch (error) {
      results.articles = { 
        status: 'failed', 
        message: `Failed to connect to articles table: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    // Test Users table
    try {
      const users = await UserService.getUsers();
      results.users = { 
        status: 'passed', 
        message: `Successfully connected to users table. Found ${users.length} users.` 
      };
    } catch (error) {
      results.users = { 
        status: 'failed', 
        message: `Failed to connect to users table: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    // Test Analytics table
    try {
      const stats = await AnalyticsService.getTodayStats();
      results.analytics = { 
        status: 'passed', 
        message: `Successfully connected to analytics table. Today's stats: ${stats ? 'Available' : 'No data yet'}` 
      };
    } catch (error) {
      results.analytics = { 
        status: 'failed', 
        message: `Failed to connect to analytics table: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    const allPassed = Object.values(results).every(result => result.status === 'passed');
    
    return NextResponse.json({
      success: allPassed,
      message: allPassed ? 'All database connections successful' : 'Some database connections failed',
      tests: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test database connections', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
