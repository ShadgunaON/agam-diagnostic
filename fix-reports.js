const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function backfill() {
  const reports = await docClient.send(new ScanCommand({
    TableName: 'agam-data-dev',
    FilterExpression: 'begins_with(PK, :pk)',
    ExpressionAttributeValues: { ':pk': 'REPORT#' }
  }));

  for (const report of reports.Items) {
    if (!report.patient && report.patientId) {
      console.log('Fixing report', report.PK);
      
      const patientRes = await docClient.send(new GetCommand({
        TableName: 'agam-data-dev',
        Key: { PK: 'PATIENT#' + report.patientId, SK: 'METADATA' }
      }));
      
      let patientData = { name: 'Unknown', age: 0, gender: 'Unknown', id: report.patientId };
      if (patientRes.Item) {
        patientData = {
          name: patientRes.Item.name || 'Unknown',
          age: patientRes.Item.age || 0,
          gender: patientRes.Item.gender || 'Unknown',
          id: patientRes.Item.id || report.patientId
        };
      }

      await docClient.send(new UpdateCommand({
        TableName: 'agam-data-dev',
        Key: { PK: report.PK, SK: report.SK },
        UpdateExpression: 'SET patient = :p, testType = :tt',
        ExpressionAttributeValues: { 
          ':p': patientData,
          ':tt': (report.tests || []).join(', ')
        }
      }));
      console.log('Fixed', report.PK, 'with patient', patientData.name);
    }
  }
}
backfill().catch(console.error);
