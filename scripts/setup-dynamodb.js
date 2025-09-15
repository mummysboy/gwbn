const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  } : undefined,
});

const tables = [
  {
    TableName: process.env.ARTICLES_TABLE || 'gwbn-articles',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StatusIndex',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: process.env.USERS_TABLE || 'gwbn-users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'date', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'DateIndex',
        KeySchema: [
          { AttributeName: 'date', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function createTable(tableConfig) {
  try {
    // Check if table already exists
    await client.send(new DescribeTableCommand({ TableName: tableConfig.TableName }));
    console.log(`✅ Table ${tableConfig.TableName} already exists`);
    return;
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }

  try {
    await client.send(new CreateTableCommand(tableConfig));
    console.log(`✅ Created table ${tableConfig.TableName}`);
  } catch (error) {
    console.error(`❌ Failed to create table ${tableConfig.TableName}:`, error.message);
  }
}

async function setupTables() {
  console.log('🚀 Setting up DynamoDB tables...');
  
  for (const table of tables) {
    await createTable(table);
  }
  
  console.log('✨ DynamoDB setup complete!');
}

setupTables().catch(console.error);
