const { SecretsManagerClient, CreateSecretCommand, UpdateSecretCommand, DescribeSecretCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize Secrets Manager client
const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  } : undefined,
});

const SECRET_NAME = 'gwbn-openai-api-key';

async function setupOpenAISecret() {
  try {
    console.log('Setting up OpenAI API key in AWS Secrets Manager...');
    
    // Check if secret already exists
    try {
      await client.send(new DescribeSecretCommand({ SecretId: SECRET_NAME }));
      console.log(`✅ Secret ${SECRET_NAME} already exists`);
      
      // Ask if user wants to update it
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to update the existing secret? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        const apiKey = await new Promise((resolve) => {
          const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl2.question('Enter your OpenAI API key: ', resolve);
          rl2.close();
        });
        
        const secretValue = JSON.stringify({ apiKey });
        
        await client.send(new UpdateSecretCommand({
          SecretId: SECRET_NAME,
          SecretString: secretValue,
        }));
        
        console.log('✅ Secret updated successfully');
      } else {
        console.log('Secret not updated');
      }
      
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        // Secret doesn't exist, create it
        console.log(`Creating new secret: ${SECRET_NAME}`);
        
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const apiKey = await new Promise((resolve) => {
          rl.question('Enter your OpenAI API key: ', resolve);
        });
        
        rl.close();
        
        const secretValue = JSON.stringify({ apiKey });
        
        await client.send(new CreateSecretCommand({
          Name: SECRET_NAME,
          Description: 'OpenAI API key for GWBN transcription service',
          SecretString: secretValue,
        }));
        
        console.log('✅ Secret created successfully');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 OpenAI API key is now stored in AWS Secrets Manager!');
    console.log('Your transcription service will automatically retrieve it.');
    
  } catch (error) {
    console.error('❌ Failed to setup OpenAI secret:', error.message);
    console.log('\nManual setup instructions:');
    console.log('1. Go to AWS Secrets Manager console');
    console.log('2. Create a new secret named: gwbn-openai-api-key');
    console.log('3. Store the secret as JSON: {"apiKey": "your-openai-api-key"}');
    console.log('4. Make sure your Lambda IAM role has secretsmanager:GetSecretValue permission');
  }
}

setupOpenAISecret().catch(console.error);
