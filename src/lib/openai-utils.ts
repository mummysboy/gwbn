import OpenAI from 'openai';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Cache for the OpenAI API key to avoid repeated calls to Parameter Store
let cachedApiKey: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieves the OpenAI API key from AWS Systems Manager Parameter Store
 * Falls back to environment variable for local development
 */
export async function getOpenAIApiKey(): Promise<string> {
  // Return cached key if still valid
  if (cachedApiKey && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedApiKey;
  }

  try {
    console.log('Fetching OpenAI API key from AWS Parameter Store');
    
    const ssmClient = new SSMClient({
      region: process.env.AWS_REGION || 'us-west-1',
    });

    const command = new GetParameterCommand({
      Name: '/gwbn/openai/api-key',
      WithDecryption: true, // Required for SecureString parameters
    });

    const response = await ssmClient.send(command);
    
    if (response.Parameter?.Value) {
      cachedApiKey = response.Parameter.Value;
      lastFetchTime = Date.now();
      
      console.log('Successfully retrieved OpenAI API key from Parameter Store');
      return cachedApiKey;
    } else {
      throw new Error('No parameter value found in Parameter Store response');
    }
  } catch (error) {
    console.error('Failed to retrieve OpenAI API key from Parameter Store:', error);
    
    // Fallback: try to get from environment variable (for local development)
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API key from environment variable (fallback)');
      cachedApiKey = process.env.OPENAI_API_KEY;
      lastFetchTime = Date.now();
      return cachedApiKey;
    }
    
    throw new Error('OpenAI API key not available in Parameter Store or environment variables');
  }
}

/**
 * Creates and returns an OpenAI client instance
 * Automatically handles API key retrieval from Parameter Store
 */
export async function getOpenAIClient(): Promise<OpenAI> {
  const apiKey = await getOpenAIApiKey();
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * Generates a newspaper article from interview transcript using OpenAI
 */
export async function generateArticleFromTranscript(
  transcript: string, 
  notes: string = ''
): Promise<{ title: string; content: string }> {
  const openai = await getOpenAIClient();

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
  try {
    const cleanedResponse = response.trim();
    console.log('Raw OpenAI response:', cleanedResponse);
    
    const articleData = JSON.parse(cleanedResponse);
    console.log('Parsed article data:', articleData);
    
    return {
      title: articleData.title,
      content: articleData.content
    };
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
    
    return {
      title: title,
      content: content || 'Article content could not be extracted from the response.'
    };
  }
}

/**
 * Transcribes audio using OpenAI Whisper
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    // Convert the audio file to a format OpenAI can process
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object for OpenAI API
    const audioForOpenAI = new File([audioBlob], 'audio.webm', {
      type: 'audio/webm'
    });

    // Transcribe the audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    return transcription;
  } catch (error) {
    console.error('OpenAI transcription failed:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}

/**
 * Generates a listing description for real estate (if needed in the future)
 */
export async function generateListingDescription(params: {
  type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  location: string;
  features: string[];
}): Promise<string> {
  const openai = await getOpenAIClient();

  const prompt = `Create a compelling real estate listing description for:
- Type: ${params.type}
- Bedrooms: ${params.bedrooms}
- Bathrooms: ${params.bathrooms}
- Square Feet: ${params.sqft}
- Location: ${params.location}
- Features: ${params.features.join(', ')}

Write a professional, engaging description that highlights the key selling points and appeals to potential buyers.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate description';
}
