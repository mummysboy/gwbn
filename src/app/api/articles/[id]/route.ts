import { NextRequest, NextResponse } from 'next/server';
import { ArticleService, Article } from '@/lib/aws-services';

// GET /api/articles/[id] - Get a specific article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await ArticleService.getArticle(id);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Increment view count when article is accessed
    await ArticleService.incrementViews(id);
    
    return NextResponse.json({
      success: true,
      article
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Update an article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, images, author, category, status } = body;
    
    const existingArticle = await ArticleService.getArticle(id);
    
    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Prepare updates
    const updates: Partial<Article> = {};
    if (title) updates.title = title;
    if (content) {
      updates.content = content;
      // Recalculate read time if content changed
      const wordCount = content.split(/\s+/).length;
      updates.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (images) updates.images = images;
    if (author) updates.author = author;
    if (category) updates.category = category;
    if (status) updates.status = status;
    
    const updatedArticle = await ArticleService.updateArticle(id, updates);
    
    return NextResponse.json({
      success: true,
      article: updatedArticle
    });
    
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingArticle = await ArticleService.getArticle(id);
    
    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    await ArticleService.deleteArticle(id);
    
    return NextResponse.json({
      success: true,
      article: existingArticle
    });
    
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
