import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, notes } = await request.json();
    
    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt for generating a newspaper article
    const prompt = `You are a professional journalist writing for a local business newspaper. Based on the following interview transcript and any additional notes, create a compelling newspaper article that follows journalistic standards.

INTERVIEW TRANSCRIPT:
${transcript}

ADDITIONAL NOTES:
${notes || 'No additional notes provided.'}

Please generate:
1. A compelling headline (title) that captures the main story and is engaging for readers
2. A well-structured newspaper article that includes:
   - A strong lead paragraph that hooks the reader and summarizes the key points
   - Supporting paragraphs with quotes, details, and context from the interview
   - Proper journalistic structure with clear transitions between paragraphs
   - Professional tone suitable for a business publication
   - Clear attribution and context
   - A strong conclusion that ties everything together

The article should be informative, engaging, and suitable for publication in a local business newspaper. Focus on the key business insights, community impact, and newsworthy elements from the interview. Use proper journalistic formatting with clear paragraph breaks and engaging language.

IMPORTANT: Format your response as valid JSON with the following exact structure:
{
  "title": "Your compelling headline here",
  "content": "Your full article content here with proper paragraph breaks and journalistic structure"
}

CRITICAL REQUIREMENTS:
- Use double quotes around all strings
- Escape ALL quotes within the content with backslashes (\" instead of ")
- Escape ALL newlines within the content with \\n
- Ensure the JSON is valid and parseable
- Do not include any text before or after the JSON object
- The content field must be a single string with escaped quotes and newlines`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional journalist with expertise in business reporting and local news. You write clear, engaging articles that inform and engage readers while maintaining journalistic integrity.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let articleData;
    try {
      // Clean up the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      console.log('Raw OpenAI response:', cleanedResponse);
      
      articleData = JSON.parse(cleanedResponse);
      console.log('Parsed article data:', articleData);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Failed to parse response:', response);
      
      // If JSON parsing fails, try to extract title and content manually
      const lines = response.split('\n').filter(line => line.trim());
      let title = 'Local Business Feature';
      let content = '';
      
      // Look for title in various formats
      const titleLine = lines.find(line => 
        line.toLowerCase().includes('"title"') || 
        line.toLowerCase().includes('title:') ||
        line.toLowerCase().includes('headline')
      );
      
      if (titleLine) {
        // Extract title from JSON-like format
        const titleMatch = titleLine.match(/"title"\s*:\s*"([^"]+)"/i) || 
                          titleLine.match(/title:\s*"([^"]+)"/i) ||
                          titleLine.match(/title:\s*(.+)/i);
        if (titleMatch) {
          title = titleMatch[1].replace(/^["']|["']$/g, '').trim();
        }
      }
      
      // Extract content - look for content field
      const contentStartIndex = lines.findIndex(line => 
        line.toLowerCase().includes('"content"') || 
        line.toLowerCase().includes('content:')
      );
      
      if (contentStartIndex !== -1) {
        // Find the content value - it might be on the same line or continue to the end
        const contentLine = lines[contentStartIndex];
        const contentMatch = contentLine.match(/"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/i) ||
                           contentLine.match(/content:\s*"([^"]*(?:\\.[^"]*)*)"/i);
        
        if (contentMatch) {
          content = contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
        } else {
          // Content spans multiple lines - collect until we find the closing brace
          const contentLines = [];
          let braceCount = 0;
          let inContent = false;
          
          for (let i = contentStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('"content"') || line.includes('content:')) {
              inContent = true;
              // Extract content from this line
              const afterColon = line.split(/content:\s*"/i)[1] || line.split(/"content"\s*:\s*"/i)[1];
              if (afterColon) {
                contentLines.push(afterColon);
              }
              continue;
            }
            
            if (inContent) {
              if (line.includes('}')) {
                // Remove the closing brace and any trailing content
                const beforeBrace = line.split('}')[0];
                if (beforeBrace.trim()) {
                  contentLines.push(beforeBrace);
                }
                break;
              }
              contentLines.push(line);
            }
          }
          
          content = contentLines.join('\n').replace(/^["']|["']$/g, '').trim();
        }
      } else {
        // Fallback: use everything except title line as content
        content = lines.filter(line => !line.toLowerCase().includes('title')).join('\n').trim();
      }
      
      articleData = {
        title: title,
        content: content || 'Article content could not be extracted from the response.'
      };
      
      console.log('Fallback article data:', articleData);
    }

    return NextResponse.json({ 
      success: true,
      title: articleData.title,
      content: articleData.content
    });

  } catch (error) {
    console.error('Article generation error:', error);
    
    // Return a fallback article if OpenAI fails
    const fallbackArticle = {
      title: 'Local Business Spotlight: Community Success Story',
      content: `By Staff Reporter

In a recent interview, local business owners shared insights about their entrepreneurial journey and the challenges they've overcome to serve their community.

The discussion revealed the dedication and hard work that goes into running a successful small business, with owners emphasizing the importance of understanding local market needs and adapting their services accordingly.

Key highlights from the interview include the business's growth trajectory and its impact on the local community. The owners discussed how they've become an integral part of the area, providing essential services and creating employment opportunities for residents.

Like many small businesses, they've faced various obstacles including market competition and operational challenges. However, their commitment to quality service and customer satisfaction has helped them maintain a strong position in the community.

Looking ahead, the business owners outlined their vision for continued growth and expansion, with plans to enhance their services and potentially create additional job opportunities in the area.

This story highlights the important role that small businesses play in building strong, vibrant communities. Their success contributes not only to the local economy but also to the social fabric of the area, serving as an inspiration to others considering starting their own ventures.

For more information about local business opportunities and community development, residents are encouraged to stay connected with local business associations and economic development organizations.${notes ? `\n\nAdditional Context: ${notes}` : ''}`
    };
    
    return NextResponse.json({ 
      success: false,
      title: fallbackArticle.title,
      content: fallbackArticle.content,
      error: 'OpenAI article generation failed, using fallback',
      fallback: true
    });
  }
}
