// S3 Service for audio file upload/download
// Uses real AWS S3 when credentials are configured, falls back to mock

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockS3 } from './mock/s3';
import type { UploadResult, DownloadResult } from './mock/s3';

const USE_MOCK = !process.env.AWS_ACCESS_KEY_ID || process.env.USE_MOCK_S3 === 'true';

const BUCKET = process.env.AWS_S3_BUCKET || '';
const REGION = process.env.AWS_REGION || 'us-east-1';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

class S3Service {
  /**
   * Generate a presigned URL for uploading a file to S3
   */
  async getUploadUrl(
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    if (USE_MOCK) {
      console.log('[S3] Using mock S3 service');
      return mockS3.getUploadUrl(fileName, 0, contentType);
    }

    const fileKey = `journal-audio/${Date.now()}-${fileName}`;
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

    console.log(`[S3] Generated upload URL for: ${fileName}`);

    return {
      fileKey,
      uploadUrl,
      downloadUrl: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileKey}`,
    };
  }

  /**
   * Generate a presigned URL for downloading a file from S3
   */
  async getDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<DownloadResult> {
    if (USE_MOCK) {
      return mockS3.getDownloadUrl(fileKey, expiresIn);
    }

    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const url = await getSignedUrl(client, command, { expiresIn });

    return {
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  /**
   * Get the raw audio data from S3 as a Buffer
   */
  async getFileBuffer(fileKey: string): Promise<Buffer> {
    if (USE_MOCK) {
      // Return a small placeholder buffer for mock mode
      console.log(`[S3 Mock] Returning placeholder buffer for: ${fileKey}`);
      return Buffer.from('mock-audio-data');
    }

    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const response = await client.send(command);
    const stream = response.Body;

    if (!stream) {
      throw new Error(`No body returned for file: ${fileKey}`);
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    if (USE_MOCK) {
      return mockS3.deleteFile(fileKey);
    }

    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    await client.send(command);
    console.log(`[S3] Deleted file: ${fileKey}`);
  }
}

// Singleton
export const s3Service = new S3Service();
