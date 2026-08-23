const { extractIdentity, isAdmin, isStaff, canAccessDocument, canUploadDocument, canAccessPatient } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const documentRepo = require('../repositories/dynamo-document');
const patientRepo = require('../repositories/dynamo-patient');
const storageRepo = require('../storage/s3-storage');

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getExtension(contentType) {
  switch (contentType) {
    case 'application/pdf': return 'pdf';
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    default: return 'bin';
  }
}

exports.handler = async (event) => {
  logger.info(`Incoming request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error(401, 'UNAUTHORIZED', 'Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const segments = proxyPath.split('/').filter(Boolean);

    switch (event.httpMethod) {
      // POST /api/documents/upload-url — Initiate upload
      case 'POST': {
        if (segments[0] === 'upload-url') {
          return await handleInitiateUpload(event, identity);
        }
        // POST /api/documents/{documentId}/complete — Confirm upload
        if (segments.length === 2 && segments[1] === 'complete') {
          return await handleCompleteUpload(segments[0], identity);
        }
        return error(400, 'BAD_REQUEST', 'Unsupported POST route');
      }

      // GET /api/documents/{documentId}/download-url — Get presigned download URL
      // GET /api/documents/{documentId} — Get metadata
      // GET /api/documents — List documents (filtered by patient or entity)
      case 'GET': {
        if (segments.length === 2 && segments[1] === 'download-url') {
          return await handleGetDownloadUrl(segments[0], identity);
        }
        if (segments.length === 1) {
          return await handleGetMetadata(segments[0], identity);
        }
        if (segments.length === 0) {
          return await handleListDocuments(event, identity);
        }
        return error(400, 'BAD_REQUEST', 'Unsupported GET route');
      }

      default:
        return error(400, 'BAD_REQUEST', `Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing document request', err);
    return error(500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
};

async function handleInitiateUpload(event, identity) {
  const body = JSON.parse(event.body || '{}');
  const { entityType, entityId, patientId, bookingId, fileName, contentType, fileSize } = body;

  // Validate required fields
  if (!entityType || !entityId || !patientId || !fileName || !contentType || !fileSize) {
    return error(400, 'BAD_REQUEST', 'Missing required fields: entityType, entityId, patientId, fileName, contentType, fileSize');
  }

  // Validate content type at the backend boundary
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return error(400, 'BAD_REQUEST', `Unsupported content type: ${contentType}. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
  }

  // Validate file size
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return error(400, 'BAD_REQUEST', `File size ${fileSize} exceeds maximum allowed 10MB`);
  }

  // Verify upload authorization for the target patient
  if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
    let patient = null;
    try {
      patient = await patientRepo.getById(patientId);
    } catch (e) {
      logger.warn(`Could not fetch patient ${patientId} for upload authorization check`);
    }

    if (!canUploadDocument(identity, patientId, patient)) {
      return error(403, 'FORBIDDEN', 'Access denied: You are not authorized to upload documents for this patient.');
    }
  }

  const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const extension = getExtension(contentType);
  const fileKey = `documents/${patientId}/${entityType}/${entityId}/${documentId}.${extension}`;

  const metadata = {
    documentId,
    entityType,
    entityId,
    patientId,
    bookingId: bookingId || null,
    fileKey,
    fileName,
    contentType,
    fileSize,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    createdBy: identity.sub || 'SYSTEM',
  };

  // Persist PENDING metadata first
  await documentRepo.createMetadata(metadata, identity.sub);

  // Generate presigned upload URL
  const uploadUrl = await storageRepo.getPresignedUploadUrl(fileKey, contentType);

  logger.info(`Document upload initiated: ${documentId} for ${entityType}/${entityId}`);

  return success({ documentId, uploadUrl, fileKey });
}

async function handleCompleteUpload(documentId, identity) {
  const doc = await documentRepo.getById(documentId);
  if (!doc) {
    return error(404, 'NOT_FOUND', `Document ${documentId} not found`);
  }

  // Authorize caller against document
  if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
    let patient = null;
    if (doc.patientId) {
      try {
        patient = await patientRepo.getById(doc.patientId);
      } catch (e) {
        logger.warn(`Could not fetch patient ${doc.patientId} for document complete check`);
      }
    }
    if (!canAccessDocument(identity, doc, patient)) {
      return error(403, 'FORBIDDEN', 'Access denied: You do not have permission to modify this document.');
    }
  }

  if (doc.status !== 'PENDING') {
    return error(409, 'CONFLICT', `Document ${documentId} is not in PENDING state (current: ${doc.status})`);
  }

  const updated = await documentRepo.updateStatus(documentId, 'UPLOADED');
  logger.info(`Document upload completed: ${documentId}`);

  return success(updated);
}

async function handleGetDownloadUrl(documentId, identity) {
  const doc = await documentRepo.getById(documentId);
  if (!doc) {
    return error(404, 'NOT_FOUND', `Document ${documentId} not found`);
  }

  // Authorize caller against document before generating presigned download URL
  if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
    let patient = null;
    if (doc.patientId) {
      try {
        patient = await patientRepo.getById(doc.patientId);
      } catch (e) {
        logger.warn(`Could not fetch patient ${doc.patientId} for download URL check`);
      }
    }
    if (!canAccessDocument(identity, doc, patient)) {
      return error(403, 'FORBIDDEN', 'Access denied: You do not have permission to download this document.');
    }
  }

  if (doc.status !== 'UPLOADED') {
    return error(400, 'BAD_REQUEST', `Document ${documentId} is not available for download (status: ${doc.status})`);
  }

  const downloadUrl = await storageRepo.getPresignedDownloadUrl(doc.fileKey);
  logger.info(`Download URL generated for document: ${documentId}`);

  return success({ downloadUrl, metadata: doc });
}

async function handleGetMetadata(documentId, identity) {
  const doc = await documentRepo.getById(documentId);
  if (!doc) {
    return error(404, 'NOT_FOUND', `Document ${documentId} not found`);
  }

  // Authorize caller against document metadata
  if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
    let patient = null;
    if (doc.patientId) {
      try {
        patient = await patientRepo.getById(doc.patientId);
      } catch (e) {
        logger.warn(`Could not fetch patient ${doc.patientId} for metadata check`);
      }
    }
    if (!canAccessDocument(identity, doc, patient)) {
      return error(403, 'FORBIDDEN', 'Access denied: You do not have permission to view this document.');
    }
  }

  return success(doc);
}

async function handleListDocuments(event, identity) {
  const queryParams = event.queryStringParameters || {};
  const { patientId, entityType, entityId } = queryParams;

  // 1. Patient-specific query
  if (patientId) {
    if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
      let patient = null;
      try {
        patient = await patientRepo.getById(patientId);
      } catch (e) {
        logger.warn(`Could not fetch patient ${patientId} for list query check`);
      }

      if (!canAccessPatient(identity, patient) && patientId !== identity.sub && patientId !== identity.primaryPatientId) {
        return error(403, 'FORBIDDEN', 'Access denied: Unauthorized patient document query.');
      }
    }

    const documents = await documentRepo.getByPatientId(patientId);
    return success(documents);
  }

  // 2. Entity-specific query (e.g. all docs for booking or invoice)
  if (entityType && entityId) {
    const documents = await documentRepo.getByEntity(entityType, entityId);

    // If caller is patient or phlebotomist, filter to only owned documents
    if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
      let familyPatients = [];
      try {
        familyPatients = await patientRepo.getByOwner(identity.sub);
      } catch (e) {
        logger.warn('Could not fetch family patients for entity doc filtering');
      }
      const allowedPatientIds = new Set([
        identity.sub,
        identity.primaryPatientId,
        `pat_${identity.sub}`,
        ...familyPatients.map((p) => p.id),
      ]);

      const filtered = documents.filter(
        (d) => allowedPatientIds.has(d.patientId) || d.ownerSub === identity.sub
      );
      return success(filtered);
    }

    return success(documents);
  }

  // 3. General list for Patient (resolve authorized patient records)
  if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
    let familyPatients = [];
    try {
      familyPatients = await patientRepo.getByOwner(identity.sub);
    } catch (e) {
      logger.warn('Could not fetch family patients for general document listing');
    }

    const patientIds = Array.from(new Set([
      identity.sub,
      identity.primaryPatientId,
      `pat_${identity.sub}`,
      ...familyPatients.map((p) => p.id),
    ]));

    let allDocs = [];
    for (const pid of patientIds) {
      try {
        const docs = await documentRepo.getByPatientId(pid);
        if (docs && docs.length > 0) {
          allDocs = allDocs.concat(docs);
        }
      } catch (e) {
        logger.warn(`Failed fetching docs for patient ${pid}`);
      }
    }

    // Deduplicate and sort reverse chronological
    const uniqueDocsMap = new Map();
    for (const d of allDocs) {
      uniqueDocsMap.set(d.documentId, d);
    }
    const uniqueDocs = Array.from(uniqueDocsMap.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );

    return success(uniqueDocs);
  }

  // 4. Admin / Staff general listing
  // Return empty array or entity query if no filter provided
  return success([]);
}

