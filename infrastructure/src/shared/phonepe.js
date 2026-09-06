const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const { StandardCheckoutClient, StandardCheckoutPayRequest, Env } = require('@phonepe-pg/pg-sdk-node');
const { logger } = require('./logger');

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });

let cachedPhonePeConfig = null;
let cachedPhonePeConfigTime = 0;
const CACHE_TTL = 30000;

async function getPhonePeConfig() {
  const now = Date.now();
  if (cachedPhonePeConfig && (now - cachedPhonePeConfigTime < CACHE_TTL)) {
    return cachedPhonePeConfig;
  }

  const ssmPrefix = process.env.PHONEPE_SSM_PREFIX;
  if (!ssmPrefix) throw new Error('PHONEPE_SSM_PREFIX environment variable is missing');

  try {
    const command = new GetParametersCommand({
      Names: [
        `${ssmPrefix}/client_id`,
        `${ssmPrefix}/client_secret`,
        `${ssmPrefix}/client_version`
      ],
      WithDecryption: true
    });

    const response = await ssmClient.send(command);
    if (!response.Parameters || response.Parameters.length < 3) {
      throw new Error('One or more required PhonePe parameters are missing in SSM');
    }

    const config = {};
    for (const param of response.Parameters) {
      if (param.Name.endsWith('/client_id')) config.clientId = param.Value;
      if (param.Name.endsWith('/client_secret')) config.clientSecret = param.Value;
      if (param.Name.endsWith('/client_version')) config.clientVersion = parseInt(param.Value, 10) || 1;
    }

    if (!config.clientId || !config.clientSecret || !config.clientVersion) {
      throw new Error('Failed to parse all required PhonePe parameters from SSM');
    }

    const envName = process.env.PHONEPE_ENV || 'UAT';
    config.env = envName === 'PROD' ? Env.PRODUCTION : Env.SANDBOX;

    cachedPhonePeConfig = config;
    cachedPhonePeConfigTime = now;
    return config;
  } catch (err) {
    logger.error('Failed to retrieve PhonePe configuration from SSM');
    throw err; // Fail closed securely
  }
}

async function createPaymentOrder(invoiceId, amountInPaisa, redirectHost) {
  const phonePeConfig = await getPhonePeConfig();
  const merchantOrderId = invoiceId;
  const redirectUrl = `${redirectHost}/payment/${invoiceId}/status`;

  const client = StandardCheckoutClient.getInstance(
    phonePeConfig.clientId,
    phonePeConfig.clientSecret,
    phonePeConfig.clientVersion,
    phonePeConfig.env
  );

  const payPageRequest = StandardCheckoutPayRequest.builder()
    .amount(amountInPaisa)
    .merchantOrderId(merchantOrderId)
    .redirectUrl(redirectUrl)
    .build();

  const response = await client.pay(payPageRequest);
  if (!response || !response.redirectUrl) {
    throw new Error('Payment gateway initialization failed');
  }
  return response.redirectUrl;
}

async function getPaymentStatus(invoiceId) {
  const phonePeConfig = await getPhonePeConfig();
  const client = StandardCheckoutClient.getInstance(
    phonePeConfig.clientId,
    phonePeConfig.clientSecret,
    phonePeConfig.clientVersion,
    phonePeConfig.env
  );

  const statusResponse = await client.getOrderStatus(invoiceId);
  return statusResponse;
}

module.exports = {
  createPaymentOrder,
  getPaymentStatus
};
