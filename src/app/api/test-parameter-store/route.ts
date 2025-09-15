import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIApiKey, getOpenAIClient } from '@/lib/openai-utils';

export async function GET() {
  try {
    console.log('Testing Parameter Store integration...');
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-west-1',
      tests: {
        parameterStore: {
          success: false,
          error: null,
          details: {}
        },
        openaiClient: {
          success: false,
          error: null,
          details: {}
        },
        openaiTest: {
          success: false,
          error: null,
          details: {}
        }
      }
    };

    // Test 1: Parameter Store Access
    try {
      console.log('Test 1: Testing Parameter Store access...');
      const apiKey = await getOpenAIApiKey();
      
      results.tests.parameterStore.success = true;
      results.tests.parameterStore.details = {
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + '...',
        source: 'parameter-store'
      };
      
      console.log('✅ Parameter Store test passed');
    } catch (error) {
      results.tests.parameterStore.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Parameter Store test failed:', error);
    }

    // Test 2: OpenAI Client Creation
    try {
      console.log('Test 2: Testing OpenAI client creation...');
      const openai = await getOpenAIClient();
      
      results.tests.openaiClient.success = true;
      results.tests.openaiClient.details = {
        clientCreated: true,
        hasApiKey: !!openai.apiKey
      };
      
      console.log('✅ OpenAI client test passed');
    } catch (error) {
      results.tests.openaiClient.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ OpenAI client test failed:', error);
    }

    // Test 3: OpenAI API Call
    try {
      console.log('Test 3: Testing OpenAI API call...');
      const openai = await getOpenAIClient();
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Parameter Store integration test successful" if you can read this message.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      
      results.tests.openaiTest.success = true;
      results.tests.openaiTest.details = {
        model: 'gpt-3.5-turbo',
        response: response,
        tokensUsed: completion.usage?.total_tokens || 0
      };
      
      console.log('✅ OpenAI API test passed');
    } catch (error) {
      results.tests.openaiTest.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ OpenAI API test failed:', error);
    }

    // Determine overall success
    const allTestsPassed = Object.values(results.tests).every(test => test.success);
    
    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed 
        ? 'All Parameter Store integration tests passed!' 
        : 'Some tests failed - check individual test results',
      results
    }, { 
      status: allTestsPassed ? 200 : 500 
    });

  } catch (error) {
    console.error('Parameter Store integration test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
