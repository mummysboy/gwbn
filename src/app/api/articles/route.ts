import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/lib/aws-services';

// GET /api/articles - Get all published articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'published' | undefined;
    
    const articles = await ArticleService.getArticles(status);
    
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
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
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
