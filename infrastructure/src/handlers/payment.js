const { extractIdentity } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const invoiceRepo = require('../repositories/dynamo-invoice');
const bookingRepo = require('../repositories/dynamo-booking');

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });

const { StandardCheckoutClient, StandardCheckoutPayRequest, Env } = require('@phonepe-pg/pg-sdk-node');

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

async function markInvoicePaid(invoiceId, providerTransactionId, paymentMethod) {
  const invoice = await invoiceRepo.getById(invoiceId);
  if (!invoice) return false;

  if (invoice.paymentStatus !== 'Paid') {
    logger.info(`Updating Invoice ${invoiceId} status to Paid via PhonePe Integration`);
    await invoiceRepo.update(invoiceId, {
      paymentStatus: 'Paid',
      paymentMethod: paymentMethod || 'Online',
      paidAt: new Date().toISOString(),
      providerTransactionId: providerTransactionId
    });
    if (invoice.bookingId) {
      logger.info(`Updating Booking ${invoice.bookingId} paymentStatus to Paid`);
      await bookingRepo.updatePaymentStatus(invoice.bookingId, 'Paid');
    }
    return true;
  }
  return false;
}

exports.handler = async (event) => {
  logger.info(`Incoming request: ${event.httpMethod} ${event.path}`);

  try {
    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const segments = proxyPath.split('/').filter(Boolean);
    const action = segments[0];

    // Status check for resilience (Delayed/Missed Callbacks) and Fulfillment
    if (event.httpMethod === 'GET' && action === 'status' && segments[1]) {
      const identity = extractIdentity(event);
      if (!identity) return error.unauthorized('Missing authentication token');

      const invoiceId = segments[1];
      
      const invoice = await invoiceRepo.getById(invoiceId);
      if (!invoice) return error.notFound('Invoice not found');
      
      // Ownership verify
      if (invoice.ownerSub !== identity.sub && invoice.patientId !== identity.primaryPatientId) {
        return error.forbidden('Not authorized to view this invoice status');
      }

      if (invoice.paymentStatus === 'Paid') {
        return success(invoice); // Already paid locally
      }

      const phonePeConfig = await getPhonePeConfig();
      const client = StandardCheckoutClient.getInstance(
        phonePeConfig.clientId,
        phonePeConfig.clientSecret,
        phonePeConfig.clientVersion,
        phonePeConfig.env
      );

      try {
        const statusResponse = await client.getOrderStatus(invoiceId);
        if (statusResponse && statusResponse.state === 'COMPLETED') {
           const providerTxnId = statusResponse.paymentDetails?.[0]?.transactionId || statusResponse.orderId;
           await markInvoicePaid(invoiceId, providerTxnId, statusResponse.paymentDetails?.[0]?.paymentMode || 'Online');
           
           // Fetch updated invoice
           const updatedInvoice = await invoiceRepo.getById(invoiceId);
           return success(updatedInvoice);
        }
        
        // If not success, we can return the PhonePe status for the frontend
        return success({
          ...invoice,
          phonePeStatus: statusResponse?.state
        });
      } catch (err) {
        logger.error(`Error fetching order status for invoice ${invoiceId}`, err.message || err);
        // Fallback to local DB state if SDK check fails
        return success(invoice);
      }
    }

    // Create Order (Requires Auth)
    if (event.httpMethod === 'POST' && action === 'create-order') {
      const identity = extractIdentity(event);
      if (!identity) return error.unauthorized('Missing authentication token');

      const body = JSON.parse(event.body || '{}');
      const { invoiceId } = body;
      
      if (!invoiceId) return error.badRequest('Missing invoiceId');

      const invoice = await invoiceRepo.getById(invoiceId);
      if (!invoice) return error.notFound('Invoice not found');

      // Ownership verify
      if (invoice.ownerSub !== identity.sub && invoice.patientId !== identity.primaryPatientId) {
        return error.forbidden('Not authorized to pay this invoice');
      }

      if (invoice.paymentStatus === 'Paid') {
        return error.badRequest('Invoice is already paid');
      }

      const phonePeConfig = await getPhonePeConfig();
      const amountInPaisa = Math.round((invoice.total || 0) * 100);
      const merchantOrderId = invoice.id;
      
      // Determine origin for redirect
      const host = event.headers['origin'] || event.headers['Origin'] || 'http://localhost:3000';
      const redirectUrl = `${host}/payment/${invoiceId}/status`;

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

      try {
        const response = await client.pay(payPageRequest);
        if (!response || !response.redirectUrl) {
          logger.error('Failed to initialize PhonePe payment', response);
          return error.serverError('Payment gateway initialization failed');
        }
        return success({ redirectUrl: response.redirectUrl });
      } catch (err) {
        logger.error('PhonePe SDK pay error', err.message || err);
        return error.serverError('Failed to communicate with payment gateway');
      }
    }

    return error.badRequest(`Unsupported action or method: ${event.httpMethod} ${action}`);
  } catch (err) {
    logger.error('Error processing payment request', err);
    return error.serverError('Internal Server Error');
  }
};
