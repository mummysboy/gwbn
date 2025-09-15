import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Create Tables: Starting table creation');
    
    const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
    
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-west-1',
    });

    const tables = [
      {
        TableName: 'gwbn-articles',
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
        TableName: 'gwbn-users',
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
        TableName: 'gwbn-analytics',
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

    const results = [];

    for (const tableConfig of tables) {
      try {
        // Check if table already exists
        try {
          await client.send(new DescribeTableCommand({ TableName: tableConfig.TableName }));
          results.push({
            table: tableConfig.TableName,
            status: 'already_exists',
            message: `Table ${tableConfig.TableName} already exists`
          });
          continue;
        } catch (error) {
          if (error instanceof Error && error.name !== 'ResourceNotFoundException') {
            throw error;
          }
          // Table doesn't exist, continue to create it
        }

        // Create the table
        await client.send(new CreateTableCommand(tableConfig));
        results.push({
          table: tableConfig.TableName,
          status: 'created',
          message: `Successfully created table ${tableConfig.TableName}`
        });
      } catch (error) {
        results.push({
          table: tableConfig.TableName,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : 'Unknown'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'created' || r.status === 'already_exists').length;
    const allSuccessful = successCount === tables.length;

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful ? 'All tables are ready' : 'Some table operations failed',
      region: process.env.AWS_REGION || 'us-west-1',
      results,
      summary: {
        total: tables.length,
        successful: successCount,
        failed: results.length - successCount
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Table creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
