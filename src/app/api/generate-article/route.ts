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
    const articleData = generateLocalArticle(transcript, notes || '');

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

function generateLocalArticle(transcript: string, notes: string) {
  // Simple local article generation logic
  const words = transcript.toLowerCase().split(/\s+/);
  
  // Determine article type based on content
  const businessKeywords = ['business', 'company', 'startup', 'entrepreneur', 'revenue', 'profit', 'market', 'industry'];
  const communityKeywords = ['community', 'local', 'residents', 'city', 'council', 'public', 'service'];
  const infrastructureKeywords = ['project', 'construction', 'development', 'infrastructure', 'building', 'facility'];
  const sportsKeywords = ['team', 'game', 'championship', 'victory', 'sports', 'basketball', 'football'];
  const weatherKeywords = ['weather', 'rain', 'storm', 'flood', 'meteorologist', 'forecast'];
  
  let articleType = 'general';
  
  if (businessKeywords.some(keyword => words.includes(keyword))) {
    articleType = 'business';
  } else if (communityKeywords.some(keyword => words.includes(keyword))) {
    articleType = 'community';
  } else if (infrastructureKeywords.some(keyword => words.includes(keyword))) {
    articleType = 'infrastructure';
  } else if (sportsKeywords.some(keyword => words.includes(keyword))) {
    articleType = 'sports';
  } else if (weatherKeywords.some(keyword => words.includes(keyword))) {
    articleType = 'weather';
  }
  
  // Generate title and content based on type
  const titles = {
    business: 'Local Business Expands Operations in Santa Barbara',
    community: 'Community Center Receives Major Funding Boost',
    infrastructure: 'Major Infrastructure Project Breaks Ground',
    sports: 'Local Team Secures Championship Victory',
    weather: 'Weather Alert: Residents Advised to Prepare',
    general: 'Local Officials Announce Community Initiative'
  };
  
  const title = titles[articleType as keyof typeof titles] || titles.general;
  
  const additionalContext = notes.trim() ? `\n\nAdditional Notes: ${notes}` : '';
  
  const content = `By Staff Reporter

Local officials have announced important developments that will impact the Santa Barbara community. The initiative represents a significant step forward in addressing community needs and opportunities.

The announcement comes after extensive planning and community input, reflecting the collaborative approach that has characterized local governance. Stakeholders have worked together to develop a comprehensive plan that addresses multiple community priorities.

Community members have expressed enthusiasm about the potential benefits of the initiative, which include improved services and enhanced quality of life for residents. The program's scope and ambition have been particularly well-received.

Local leaders have emphasized the importance of continued community engagement and collaboration in implementing the initiative successfully. Regular updates and opportunities for input will be provided throughout the process.

The development represents a significant investment in the community's future and demonstrates the commitment of local leaders to improving the lives of Santa Barbara residents.

This initiative highlights the continued growth and development of the Santa Barbara community, showcasing the area's potential and the dedication of its leaders to creating positive change.${additionalContext}`;
  
  return { title, content };
}
