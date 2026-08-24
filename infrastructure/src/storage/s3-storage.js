const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/** Default presigned URL expiration: 5 minutes */
const UPLOAD_URL_EXPIRATION_SECONDS = 300;

/** Default presigned download URL expiration: 15 minutes */
const DOWNLOAD_URL_EXPIRATION_SECONDS = 900;

class S3StorageRepository {
  /**
   * Generate a short-lived presigned PUT URL for browser-direct upload.
   * The URL enforces content-type via the signed headers.
   */
  async getPresignedUploadUrl(fileKey, contentType) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
    });

    return url;
  }

  /**
   * Generate a short-lived presigned GET URL for authorized download.
   * The URL expires after DOWNLOAD_URL_EXPIRATION_SECONDS.
   */
  async getPresignedDownloadUrl(fileKey) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: DOWNLOAD_URL_EXPIRATION_SECONDS,
    });

    return url;
  }
}

module.exports = new S3StorageRepository();
