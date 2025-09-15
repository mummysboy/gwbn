import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/lib/aws-services';

// GET /api/articles - Get all published articles
export async function GET(request: NextRequest) {
  try {
    console.log('Articles API: Starting request');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'published' | undefined;
    
    console.log('Articles API: Status filter:', status);
    console.log('Articles API: Environment check:', {
      REGION: process.env.REGION,
      HAS_ACCESS_KEY: !!process.env.ACCESS_KEY_ID,
      HAS_SECRET_KEY: !!process.env.SECRET_ACCESS_KEY,
      ARTICLES_TABLE: process.env.ARTICLES_TABLE || 'gwbn-articles'
    });
    
    const articles = await ArticleService.getArticles(status);
    
    console.log('Articles API: Successfully fetched', articles.length, 'articles');
    
    return NextResponse.json({
      success: true,
      articles: articles,
      count: articles.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Articles API: Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, images = [], author, category = 'Business', status = 'published' } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const newArticle = await ArticleService.createArticle({
      title,
      content,
      images,
      status: status as 'draft' | 'published',
      author: author || 'Staff Reporter',
      category,
      readTime
    });
    
    return NextResponse.json({
      success: true,
      article: newArticle
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
