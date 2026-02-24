export interface R2File {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

export async function listFiles(bucket: R2Bucket, prefix?: string): Promise<R2File[]> {
  const result = await bucket.list({ prefix, limit: 1000 });
  
  return result.objects.map((obj: { key: string; size: number; uploaded: Date; etag: string }) => ({
    key: obj.key,
    size: obj.size,
    lastModified: obj.uploaded,
    etag: obj.etag,
  }));
}

export async function getFile(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | string,
  contentType?: string
): Promise<R2Object | null> {
  return bucket.put(key, body, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
}

export async function deleteFile(bucket: R2Bucket, key: string): Promise<boolean> {
  try {
    await bucket.delete(key);
    return true;
  } catch {
    return false;
  }
}

export function getPublicUrl(accountId: string, bucketName: string, key: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
}

export function getLocalImageUrl(key: string): string {
  return `/images/${key}`;
}
