import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (filePath, folder = 'uploads') => {
  if (!filePath) {
    throw new Error('uploadToS3: filePath is required');
  }

  const bucket = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket) throw new Error('Missing env var: AWS_BUCKET_NAME or S3_BUCKET_NAME');
  if (!region) throw new Error('Missing env var: AWS_REGION');

  const fileStream = fs.createReadStream(filePath);
  const ext = path.extname(filePath) || '';
  const key = `${folder}/${Date.now()}-${uuidv4()}${ext}`;

  const contentType = mime.lookup(ext) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  try {
    await s3.send(command);

    // Prefer explicitly configured CDN/base URL for public access.
    // When bucket ACLs are disabled, public access should be handled via bucket policy / CloudFront / OAC.
    const url = process.env.S3_PUBLIC_BASE_URL
      ? `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error('✗ S3 Upload Error:', {
      message: error?.message,
      name: error?.name,
      code: error?.$metadata?.httpStatusCode,
      bucket,
      key,
    });
    throw error;
  }
};

export const deleteFromS3 = async (key) => {
  try {
    if (!key) return;
    const bucket = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    if (!bucket) throw new Error('Missing env var: AWS_BUCKET_NAME or S3_BUCKET_NAME');
    const params = {
      Bucket: bucket,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error('✗ S3 Delete Error:', error);
    throw error;
  }
};

export default s3;
