
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';

async function backfill() {
  console.log(`Starting GSI3 backfill for table ${TABLE_NAME}...`);
  
  let exclusiveStartKey = undefined;
  let count = 0;
  let updatedCount = 0;

  do {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'ENTITY#REPORT'
      },
      ExclusiveStartKey: exclusiveStartKey
    };

    const response = await docClient.send(new QueryCommand(params));
    
    if (response.Items) {
      for (const report of response.Items) {
        count++;
        // If it already has GSI3PK, skip
        if (report.GSI3PK && report.GSI3SK) {
          console.log(`Report ${report.id} already has GSI3 keys, skipping.`);
          continue;
        }

        let bookingCreatedAt = report.createdAt; // fallback

        // Look up booking if bookingId exists
        if (report.bookingId) {
          try {
            const bookingRes = await docClient.send(new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `BOOKING#${report.bookingId}`,
                SK: 'METADATA'
              }
            }));
            
            if (bookingRes.Item && bookingRes.Item.createdAt) {
              bookingCreatedAt = bookingRes.Item.createdAt;
            }
          } catch (err) {
            console.error(`Failed to fetch booking ${report.bookingId} for report ${report.id}`, err);
          }
        }

        const gsi3pk = 'ENTITY#REPORT';
        const gsi3sk = `REPORT#${bookingCreatedAt}#${report.id}`;

        console.log(`Updating Report ${report.id}: GSI3SK = ${gsi3sk}`);

        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: report.PK,
            SK: report.SK
          },
          UpdateExpression: 'SET GSI3PK = :g3pk, GSI3SK = :g3sk',
          ExpressionAttributeValues: {
            ':g3pk': gsi3pk,
            ':g3sk': gsi3sk
          }
        }));
        updatedCount++;
      }
    }

    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  console.log(`Backfill complete. Scanned: ${count}, Updated: ${updatedCount}`);
}

backfill().catch(console.error);
