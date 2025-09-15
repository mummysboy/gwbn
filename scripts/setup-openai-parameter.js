const { SSMClient, PutParameterCommand, GetParameterCommand, DescribeParametersCommand } = require('@aws-sdk/client-ssm');

// Initialize SSM client
const client = new SSMClient({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  } : undefined,
});

const PARAMETER_NAME = '/gwbn/openai/api-key';

async function setupOpenAIParameter() {
  try {
    console.log('Setting up OpenAI API key in AWS Systems Manager Parameter Store...');
    
    // Check if parameter already exists
    try {
      await client.send(new GetParameterCommand({ 
        Name: PARAMETER_NAME,
        WithDecryption: true 
      }));
      console.log(`✅ Parameter ${PARAMETER_NAME} already exists`);
      
      // Ask if user wants to update it
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to update the existing parameter? (y/n): ', resolve);
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
        
        await client.send(new PutParameterCommand({
          Name: PARAMETER_NAME,
          Value: apiKey,
          Type: 'SecureString',
          Description: 'OpenAI API key for Golden West Business News application',
          Overwrite: true,
        }));
        
        console.log('✅ Parameter updated successfully');
      } else {
        console.log('Parameter not updated');
      }
      
    } catch (error) {
      if (error.name === 'ParameterNotFound') {
        // Parameter doesn't exist, create it
        console.log(`Creating new parameter: ${PARAMETER_NAME}`);
        
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const apiKey = await new Promise((resolve) => {
          rl.question('Enter your OpenAI API key: ', resolve);
        });
        
        rl.close();
        
        await client.send(new PutParameterCommand({
          Name: PARAMETER_NAME,
          Value: apiKey,
          Type: 'SecureString',
          Description: 'OpenAI API key for Golden West Business News application',
        }));
        
        console.log('✅ Parameter created successfully');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 OpenAI API key is now stored in AWS Parameter Store!');
    console.log('Your application will automatically retrieve it using IAM roles.');
    console.log('\nNext steps:');
    console.log('1. Ensure your Lambda/EC2 execution role has ssm:GetParameter permission');
    console.log('2. Deploy your application');
    console.log('3. Test the OpenAI integration');
    
  } catch (error) {
    console.error('❌ Failed to setup OpenAI parameter:', error.message);
    console.log('\nManual setup instructions:');
    console.log('1. Go to AWS Systems Manager Parameter Store console');
    console.log('2. Create a new parameter with these settings:');
    console.log(`   - Name: ${PARAMETER_NAME}`);
    console.log('   - Type: SecureString');
    console.log('   - Value: your-openai-api-key');
    console.log('3. Make sure your Lambda IAM role has ssm:GetParameter permission');
    console.log('4. Ensure the parameter is in the same region as your application');
  }
}

// Add command line argument support
if (process.argv.length > 2) {
  const apiKey = process.argv[2];
  console.log('Setting up OpenAI parameter with provided API key...');
  
  client.send(new PutParameterCommand({
    Name: PARAMETER_NAME,
    Value: apiKey,
    Type: 'SecureString',
    Description: 'OpenAI API key for Golden West Business News application',
    Overwrite: true,
  })).then(() => {
    console.log('✅ Parameter created/updated successfully');
    console.log(`Parameter name: ${PARAMETER_NAME}`);
  }).catch(error => {
    console.error('❌ Failed to setup parameter:', error.message);
  });
} else {
  setupOpenAIParameter().catch(console.error);
}
