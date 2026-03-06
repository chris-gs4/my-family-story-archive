// Mock S3 Service for Development
// Simulates AWS S3 file uploads without needing real credentials

interface UploadResult {
  fileKey: string;
  uploadUrl: string;
  downloadUrl: string;
}

interface DownloadResult {
  url: string;
  expiresAt: Date;
}

class MockS3Service {
  private mockStorage = new Map<string, { size: number; contentType: string; uploadedAt: Date }>();

  /**
   * Generate a mock presigned URL for uploading files
   */
  async getUploadUrl(
    fileName: string,
    fileSize: number,
    contentType: string
  ): Promise<UploadResult> {
    const fileKey = `audio/${Date.now()}-${fileName}`;

    // Simulate S3 presigned URL
    const uploadUrl = `https://mock-s3-bucket.s3.mock.amazonaws.com/${fileKey}?X-Amz-Signature=mock-signature`;
    const downloadUrl = `https://mock-s3-bucket.s3.mock.amazonaws.com/${fileKey}`;

    // Store metadata
    this.mockStorage.set(fileKey, {
      size: fileSize,
      contentType,
      uploadedAt: new Date(),
    });

    console.log(`[Mock S3] Generated upload URL for: ${fileName}`);
    console.log(`[Mock S3] File key: ${fileKey}`);

    return {
      fileKey,
      uploadUrl,
      downloadUrl,
    };
  }

  /**
   * Generate a mock presigned URL for downloading files
   */
  async getDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<DownloadResult> {
    const metadata = this.mockStorage.get(fileKey);

    if (!metadata) {
      throw new Error(`File not found: ${fileKey}`);
    }

    const url = `https://mock-s3-bucket.s3.mock.amazonaws.com/${fileKey}?X-Amz-Signature=mock-download-signature`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log(`[Mock S3] Generated download URL for: ${fileKey}`);
    console.log(`[Mock S3] Expires at: ${expiresAt.toISOString()}`);

    return {
      url,
      expiresAt,
    };
  }

  /**
   * Simulate file deletion
   */
  async deleteFile(fileKey: string): Promise<void> {
    const existed = this.mockStorage.delete(fileKey);

    if (existed) {
      console.log(`[Mock S3] Deleted file: ${fileKey}`);
    } else {
      console.log(`[Mock S3] File not found (already deleted): ${fileKey}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(fileKey: string): Promise<boolean> {
    return this.mockStorage.has(fileKey);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileKey: string) {
    const metadata = this.mockStorage.get(fileKey);

    if (!metadata) {
      throw new Error(`File not found: ${fileKey}`);
    }

    return metadata;
  }

  /**
   * List all files (for debugging)
   */
  listFiles() {
    return Array.from(this.mockStorage.entries()).map(([key, metadata]) => ({
      key,
      ...metadata,
    }));
  }
}

// Singleton instance
export const mockS3 = new MockS3Service();

// Export types
export type { UploadResult, DownloadResult };
