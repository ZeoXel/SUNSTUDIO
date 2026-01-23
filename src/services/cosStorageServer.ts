/**
 * 腾讯云 COS 存储服务 - 服务端版本
 * 用于 API routes 中上传文件到 COS
 *
 * 存储路径结构：
 * zeocanvas/{userId}/canvas/{canvasId}/{timestamp}-{random}.jpg
 * zeocanvas/{userId}/subject/{subjectId}/{timestamp}-{random}.png
 */

// 使用 Node.js 专用 SDK（服务端环境）
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const COS = require('cos-nodejs-sdk-v5') as any;

// COS 配置
const COS_CONFIG = {
  secretId: process.env.COS_SECRET_ID!,
  secretKey: process.env.COS_SECRET_KEY!,
  bucket: process.env.COS_BUCKET || 'lsjx-1354453097',
  region: process.env.COS_REGION || 'ap-beijing',
  domain: process.env.COS_DOMAIN || 'https://cos.lsaigc.com',
};

// 存储路径配置
const STORAGE_CONFIG = {
  project: 'zeocanvas',           // 项目名称
  defaultUser: 'anonymous',       // 默认用户 ID
};

// ==================== 路径构建工具 (服务端) ====================

/**
 * 构建画布资源路径 (服务端)
 * @param canvasId 画布 ID
 * @param userId 用户 ID（必传，服务端无状态）
 */
export function buildCanvasPathServer(canvasId: string, userId?: string): string {
  const uid = userId || STORAGE_CONFIG.defaultUser;
  return `${STORAGE_CONFIG.project}/${uid}/canvas/${canvasId}`;
}

/**
 * 构建主体库资源路径 (服务端)
 * @param subjectId 主体 ID
 * @param userId 用户 ID（必传，服务端无状态）
 */
export function buildSubjectPathServer(subjectId: string, userId?: string): string {
  const uid = userId || STORAGE_CONFIG.defaultUser;
  return `${STORAGE_CONFIG.project}/${uid}/subject/${subjectId}`;
}

/**
 * 构建通用媒体资源路径 (服务端)
 * @param category 资源类型
 * @param userId 用户 ID
 */
export function buildMediaPathServer(category: string = 'media', userId?: string): string {
  const uid = userId || STORAGE_CONFIG.defaultUser;
  return `${STORAGE_CONFIG.project}/${uid}/${category}`;
}

// COS 实例（延迟初始化）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cosInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCosInstance(): any {
  if (cosInstance) return cosInstance;

  cosInstance = new COS({
    SecretId: COS_CONFIG.secretId,
    SecretKey: COS_CONFIG.secretKey,
  });

  return cosInstance;
}

/**
 * 上传结果
 */
export interface CosUploadResult {
  url: string;
  key: string;
}

/**
 * 生成唯一文件名
 */
function generateFileName(ext: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * 从 URL 下载文件并上传到 COS
 */
export async function uploadFromUrl(
  sourceUrl: string,
  prefix: string = 'media'
): Promise<CosUploadResult> {
  // 下载文件
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const arrayBuffer = await response.arrayBuffer();
  // COS SDK 在 Node.js 环境需要 Buffer，但需要确保类型正确
  const body = Buffer.from(arrayBuffer);

  const key = `${prefix}/${generateFileName(ext)}`;
  const cos = getCosInstance();

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
        Body: body,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, _data: any) => {
        if (err) {
          console.error('[COS Server] Upload failed:', err);
          reject(err);
        } else {
          const url = `${COS_CONFIG.domain}/${key}`;
          console.log(`[COS Server] Uploaded: ${url}`);
          resolve({ url, key });
        }
      }
    );
  });
}

/**
 * 批量从 URL 下载并上传到 COS
 */
export async function uploadBatchFromUrls(
  sourceUrls: string[],
  prefix: string = 'media'
): Promise<CosUploadResult[]> {
  return Promise.all(sourceUrls.map((url) => uploadFromUrl(url, prefix)));
}

/**
 * 从 Base64 上传到 COS
 */
export async function uploadFromBase64(
  base64: string,
  prefix: string = 'media'
): Promise<CosUploadResult> {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';

  const data = Buffer.from(parts[1], 'base64');
  const key = `${prefix}/${generateFileName(ext)}`;
  const cos = getCosInstance();

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
        Body: data,
        ContentType: mime,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, _data: any) => {
        if (err) {
          console.error('[COS Server] Upload failed:', err);
          reject(err);
        } else {
          const url = `${COS_CONFIG.domain}/${key}`;
          console.log(`[COS Server] Uploaded: ${url}`);
          resolve({ url, key });
        }
      }
    );
  });
}

/**
 * 智能上传：判断输入类型并上传
 * - 已是我们的 COS URL：直接返回
 * - 其他 URL：下载并上传
 * - Base64：直接上传
 */
export async function smartUploadServer(
  input: string,
  prefix: string = 'media'
): Promise<string> {
  if (!input) return '';

  // 已经是我们的 COS URL
  if (input.startsWith(COS_CONFIG.domain)) {
    return input;
  }

  // 是 Base64
  if (input.startsWith('data:')) {
    const result = await uploadFromBase64(input, prefix);
    return result.url;
  }

  // 是外部 URL
  if (input.startsWith('http')) {
    const result = await uploadFromUrl(input, prefix);
    return result.url;
  }

  return input;
}

/**
 * 批量智能上传
 */
export async function smartUploadBatchServer(
  inputs: string[],
  prefix: string = 'media'
): Promise<string[]> {
  return Promise.all(inputs.map((input) => smartUploadServer(input, prefix)));
}

/**
 * 从 URL 下载视频并上传到 COS
 * 用于将临时视频 URL 转存到永久存储
 */
export async function uploadVideoFromUrl(
  sourceUrl: string,
  prefix: string = 'videos'
): Promise<CosUploadResult> {
  // 已经是我们的 COS URL，直接返回
  if (sourceUrl.startsWith(COS_CONFIG.domain)) {
    const key = sourceUrl.replace(`${COS_CONFIG.domain}/`, '');
    return { url: sourceUrl, key };
  }

  console.log(`[COS Server] Downloading video from: ${sourceUrl.substring(0, 100)}...`);

  // 下载视频
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'video/mp4';
  const ext = contentType.includes('webm') ? 'webm' : 'mp4';
  const arrayBuffer = await response.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  const key = `${prefix}/${generateFileName(ext)}`;
  const cos = getCosInstance();

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, _data: any) => {
        if (err) {
          console.error('[COS Server] Video upload failed:', err);
          reject(err);
        } else {
          const url = `${COS_CONFIG.domain}/${key}`;
          console.log(`[COS Server] Video uploaded: ${url}`);
          resolve({ url, key });
        }
      }
    );
  });
}

/**
 * 智能视频上传：如果是外部 URL 则下载并上传，如果是 COS URL 则直接返回
 */
export async function smartUploadVideoServer(
  videoUrl: string,
  prefix: string = 'videos'
): Promise<string> {
  if (!videoUrl) return '';

  // 已经是我们的 COS URL
  if (videoUrl.startsWith(COS_CONFIG.domain)) {
    return videoUrl;
  }

  // 外部 URL，需要下载并上传
  if (videoUrl.startsWith('http')) {
    try {
      const result = await uploadVideoFromUrl(videoUrl, prefix);
      return result.url;
    } catch (error) {
      console.error('[COS Server] Failed to upload video, returning original URL:', error);
      // 上传失败时返回原始 URL（可能会过期）
      return videoUrl;
    }
  }

  return videoUrl;
}
