import { NextRequest, NextResponse } from 'next/server';
import { generateArticleFromTranscript } from '@/lib/openai-utils';

export async function POST(request: NextRequest) {
  try {
    const { transcript, notes } = await request.json();
    
    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Use the new OpenAI utility function with Parameter Store integration
    const articleData = await generateArticleFromTranscript(transcript, notes);

    return NextResponse.json({ 
      success: true,
      title: articleData.title,
      content: articleData.content
    });

  } catch (error) {
    console.error('OpenAI article generation error:', error);
    
    // Fallback to local generation if OpenAI fails
    return await generateArticleLocally(request);
  }
}

async function generateArticleLocally(request: NextRequest) {
  try {
    const { transcript, notes } = await request.json();
    
    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Generate article using local AI logic instead of OpenAI
    const articleData = generateArticleFromTranscript(transcript, notes || '');

    return NextResponse.json({ 
      success: false, // Mark as false to indicate fallback
      title: articleData.title,
      content: articleData.content,
      fallback: true
    });

  } catch (error) {
    console.error('Local article generation error:', error);
    
    // Return a fallback article if generation fails
    const fallbackArticle = {
      title: 'Local Business Spotlight: Community Success Story',
      content: `By Staff Reporter

In a recent interview, local business owners shared insights about their entrepreneurial journey and the challenges they've overcome to serve their community.

The discussion revealed the dedication and hard work that goes into running a successful small business, with owners emphasizing the importance of understanding local market needs and adapting their services accordingly.

Key highlights from the interview include the business's growth trajectory and its impact on the local community. The owners discussed how they've become an integral part of the area, providing essential services and creating employment opportunities for residents.

Like many small businesses, they've faced various obstacles including market competition and operational challenges. However, their commitment to quality service and customer satisfaction has helped them maintain a strong position in the community.

Looking ahead, the business owners outlined their vision for continued growth and expansion, with plans to enhance their services and potentially create additional job opportunities in the area.

This story highlights the important role that small businesses play in building strong, vibrant communities. Their success contributes not only to the local economy but also to the social fabric of the area, serving as an inspiration to others considering starting their own ventures.

For more information about local business opportunities and community development, residents are encouraged to stay connected with local business associations and economic development organizations.`
    };
    
    return NextResponse.json({ 
      success: false,
      title: fallbackArticle.title,
      content: fallbackArticle.content,
      error: 'Article generation failed, using fallback',
      fallback: true
    });
  }
}
