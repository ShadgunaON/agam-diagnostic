const { CloudWatchLogsClient, GetLogEventsCommand, DescribeLogStreamsCommand } = require('@aws-sdk/client-cloudwatch-logs');
const client = new CloudWatchLogsClient({ region: 'us-east-1' });

async function main() {
  const streamsRes = await client.send(new DescribeLogStreamsCommand({
    logGroupName: '/aws/lambda/agam-diagnostics-foundatio-GraphQLResolverFunction-mf6YBMaiT5KP',
    orderBy: 'LastEventTime',
    descending: true,
    limit: 10
  }));
  
  for (const stream of streamsRes.logStreams || []) {
    const eventsRes = await client.send(new GetLogEventsCommand({
      logGroupName: '/aws/lambda/agam-diagnostics-foundatio-GraphQLResolverFunction-mf6YBMaiT5KP',
      logStreamName: stream.logStreamName,
      limit: 100,
      startFromHead: false
    }));
    for (const e of eventsRes.events || []) {
      const msg = e.message.trim();
      if (msg.includes('ERROR') || msg.includes('Error') || msg.includes('adminBookingsWorkspace') || msg.includes('myPortal')) {
        console.log(msg);
      }
    }
  }
}
main().catch(console.error);
