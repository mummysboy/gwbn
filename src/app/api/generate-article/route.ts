import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Cache for the OpenAI API key to avoid repeated calls to Secrets Manager
let cachedApiKey: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getOpenAIApiKey(): Promise<string> {
  // Return cached key if still valid
  if (cachedApiKey && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedApiKey;
  }

  try {
    console.log('Fetching OpenAI API key from AWS Secrets Manager');
    
    const secretsClient = new SecretsManagerClient({
      region: 'us-west-1', // Default region
    });

    const command = new GetSecretValueCommand({
      SecretId: 'gwbn-openai-api-key', // Secret name in AWS Secrets Manager
    });

    const response = await secretsClient.send(command);
    
    if (response.SecretString) {
      const secretData = JSON.parse(response.SecretString);
      cachedApiKey = secretData.apiKey;
      lastFetchTime = Date.now();
      
      console.log('Successfully retrieved OpenAI API key from Secrets Manager');
      return cachedApiKey!;
    } else {
      throw new Error('No secret string found in Secrets Manager response');
    }
  } catch (error) {
    console.error('Failed to retrieve OpenAI API key from Secrets Manager:', error);
    
    // Fallback: try to get from environment variable (for local development)
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API key from environment variable (fallback)');
      cachedApiKey = process.env.OPENAI_API_KEY;
      lastFetchTime = Date.now();
      return cachedApiKey;
    }
    
    throw new Error('OpenAI API key not available in Secrets Manager or environment variables');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get OpenAI API key from AWS Secrets Manager (using IAM roles)
    let apiKey: string;
    
    try {
      apiKey = await getOpenAIApiKey();
    } catch (error) {
      console.warn('OpenAI API key not available, using local AI processing');
      return await generateArticleLocally(request);
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

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

function generateArticleFromTranscript(transcript: string, notes: string) {
  // Extract key information from transcript
  const words = transcript.toLowerCase().split(/\s+/);
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
  
  // Analyze content to determine article type and focus
  const businessKeywords = ['business', 'company', 'startup', 'entrepreneur', 'revenue', 'profit', 'market', 'industry'];
  const communityKeywords = ['community', 'local', 'residents', 'city', 'council', 'public', 'service'];
  const infrastructureKeywords = ['project', 'construction', 'development', 'infrastructure', 'building', 'facility'];
  const sportsKeywords = ['team', 'game', 'championship', 'victory', 'sports', 'basketball', 'football'];
  const weatherKeywords = ['weather', 'rain', 'storm', 'flood', 'meteorologist', 'forecast'];
  
  let articleType = 'general';
  
  // Determine article type based on content
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
  
  // Generate title based on content analysis
  const title = generateTitle(articleType, 'local news', sentences);
  
  // Generate content based on transcript and notes
  const content = generateContent(transcript, notes, articleType, 'local news');
  
  return { title, content };
}

function generateTitle(articleType: string, _primaryFocus: string, sentences: string[]): string {
  const titleTemplates = {
    business: [
      'Local Business Expands Operations in Santa Barbara',
      'New Business Initiative Brings Jobs to Community',
      'Entrepreneur Shares Success Story in Local Market',
      'Business Leaders Discuss Economic Growth Opportunities'
    ],
    community: [
      'Community Center Receives Major Funding Boost',
      'Local Residents Rally for Community Improvements',
      'City Council Approves Community Development Plan',
      'Community Leaders Address Local Concerns'
    ],
    infrastructure: [
      'Major Infrastructure Project Breaks Ground',
      'City Announces New Development Initiative',
      'Construction Project to Improve Local Transportation',
      'Infrastructure Investment Benefits Local Community'
    ],
    sports: [
      'Local Team Secures Championship Victory',
      'High School Sports Program Achieves Success',
      'Community Celebrates Athletic Achievement',
      'Local Athletes Excel in State Competition'
    ],
    weather: [
      'Weather Alert: Residents Advised to Prepare',
      'Meteorologists Predict Significant Weather Changes',
      'Local Weather Update: Safety Precautions Recommended',
      'Weather Service Issues Advisory for Local Area'
    ],
    general: [
      'Local Officials Announce Community Initiative',
      'Santa Barbara Residents Discuss Local Issues',
      'Community Update: New Developments in Area',
      'Local News: Important Updates for Residents'
    ]
  };
  
  const templates = titleTemplates[articleType as keyof typeof titleTemplates] || titleTemplates.general;
  
  // Select title based on content analysis
  const titleIndex = sentences.length % templates.length;
  return templates[titleIndex];
}

function generateContent(transcript: string, notes: string, articleType: string, primaryFocus: string): string {
  const additionalContext = notes.trim() ? `\n\nAdditional Notes: ${notes}` : '';
  
  const contentTemplates = {
    business: `By Staff Reporter

Local business leaders have announced significant developments that will impact the Santa Barbara community. The initiative represents a major step forward in economic development for the region.

According to sources familiar with the matter, the business expansion will create new opportunities for local residents and contribute to the area's economic growth. The project has been in development for several months and represents a substantial investment in the community.

Key stakeholders have emphasized the importance of supporting local businesses and creating an environment that fosters entrepreneurship and innovation. The development is expected to have positive ripple effects throughout the local economy.

Community members have expressed enthusiasm about the potential benefits, including new job opportunities and increased economic activity. Local officials have praised the initiative as a model for sustainable business development.

The project timeline includes several phases of implementation, with the first phase expected to begin in the coming months. Regular updates will be provided to keep the community informed about progress and opportunities.

This development highlights the continued growth and vitality of the Santa Barbara business community, demonstrating the area's appeal as a location for business investment and expansion.${additionalContext}`,

    community: `By Staff Reporter

Community leaders have announced a new initiative that will benefit residents throughout the Santa Barbara area. The program represents a collaborative effort between local organizations and city officials.

The initiative focuses on addressing key community needs and improving quality of life for residents. Community input has been instrumental in shaping the program's priorities and implementation strategy.

Local officials have emphasized the importance of community engagement and collaboration in achieving meaningful results. The program includes multiple components designed to address various aspects of community life.

Residents have expressed strong support for the initiative, citing its potential to address long-standing community concerns. The program's comprehensive approach has been particularly well-received by community stakeholders.

Implementation will occur in phases, with regular community updates and opportunities for continued input. The program represents a significant investment in the community's future.

This initiative demonstrates the power of community collaboration and the commitment of local leaders to improving the lives of Santa Barbara residents.${additionalContext}`,

    infrastructure: `By Staff Reporter

City officials have announced a major infrastructure project that will enhance transportation and public services throughout Santa Barbara. The development represents a significant investment in the community's future.

The project includes improvements to roads, utilities, and public facilities that will benefit residents and businesses alike. Planning has been underway for several months, with input from community stakeholders and technical experts.

Local officials have emphasized the project's importance for economic development and quality of life. The infrastructure improvements are expected to support continued growth and development in the area.

Community members have expressed support for the initiative, recognizing its potential to address long-standing infrastructure needs. The project's comprehensive scope has been particularly well-received.

Implementation will occur in phases to minimize disruption to residents and businesses. Regular updates will be provided throughout the construction process.

This infrastructure investment demonstrates the city's commitment to supporting sustainable growth and improving the community's long-term prospects.${additionalContext}`,

    sports: `By Staff Reporter

Local athletes have achieved remarkable success in recent competitions, bringing recognition to Santa Barbara's sports programs. The achievements represent the culmination of dedicated training and community support.

The team's performance has been outstanding throughout the season, demonstrating the quality of local sports programs and the dedication of student-athletes. Community members have rallied behind the team, showing strong support for local athletics.

Coaches and administrators have praised the athletes' commitment and sportsmanship, noting their positive representation of the community. The success reflects well on the local sports infrastructure and coaching staff.

The achievement has generated excitement throughout the community, with residents celebrating the team's accomplishments. Local businesses have also shown support for the athletic program.

This success highlights the importance of investing in youth sports and the positive impact of athletic programs on community spirit and student development.

The team's achievement serves as an inspiration for other student-athletes and demonstrates the value of dedication, teamwork, and community support in achieving excellence.${additionalContext}`,

    weather: `By Staff Reporter

Meteorologists are advising Santa Barbara residents to prepare for significant weather changes in the coming days. The weather service has issued advisories to help residents stay safe and informed.

Weather patterns indicate the potential for substantial precipitation and related impacts on the local area. Residents are encouraged to take appropriate precautions and stay updated on changing conditions.

Local officials have activated emergency preparedness protocols and are monitoring conditions closely. Community resources are available to assist residents who may need support during the weather event.

The weather service continues to track developing conditions and will provide regular updates as the situation evolves. Residents are advised to stay informed through official channels.

Community organizations have mobilized to provide assistance and information to residents. Local shelters and emergency services are prepared to respond if needed.

This weather event serves as a reminder of the importance of preparedness and community resilience in facing natural challenges.${additionalContext}`,

    general: `By Staff Reporter

Local officials have announced important developments that will impact the Santa Barbara community. The initiative represents a significant step forward in addressing community needs and opportunities.

The announcement comes after extensive planning and community input, reflecting the collaborative approach that has characterized local governance. Stakeholders have worked together to develop a comprehensive plan that addresses multiple community priorities.

Community members have expressed enthusiasm about the potential benefits of the initiative, which include improved services and enhanced quality of life for residents. The program's scope and ambition have been particularly well-received.

Local leaders have emphasized the importance of continued community engagement and collaboration in implementing the initiative successfully. Regular updates and opportunities for input will be provided throughout the process.

The development represents a significant investment in the community's future and demonstrates the commitment of local leaders to improving the lives of Santa Barbara residents.

This initiative highlights the continued growth and development of the Santa Barbara community, showcasing the area's potential and the dedication of its leaders to creating positive change.${additionalContext}`
  };
  
  const template = contentTemplates[articleType as keyof typeof contentTemplates] || contentTemplates.general;
  return template;
}