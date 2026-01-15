/**
 * Gemini 图像服务 (OpenAI 兼容接口)
 *
 * 通过统一网关调用，支持模型:
 * - gemini-2.5-flash-image: 图像生成/编辑
 * - gemini-2.5-flash-image-generation: 图像生成
 *
 * 注意：此模块仅使用 OpenAI 兼容接口，不依赖 Gemini SDK
 */

import { getApiConfig, handleApiError, type ImageGenerationResult } from './shared';

// ==================== 类型定义 ====================

export type GeminiImageModel = 'gemini-2.5-flash-image' | 'gemini-2.5-flash-image-generation';

export interface GeminiImageOptions {
  prompt: string;
  model?: GeminiImageModel;
  images?: string[];
  aspectRatio?: string;
  count?: number;
  responseFormat?: 'url' | 'b64_json';
}

// ==================== API 函数 ====================

/**
 * 生成图像 (通过 OpenAI 兼容接口)
 */
export const generateImage = async (options: GeminiImageOptions): Promise<ImageGenerationResult> => {
  const { baseUrl, apiKey } = getApiConfig();

  if (!apiKey) {
    throw new Error('API Key未配置');
  }

  const body: any = {
    model: options.model || 'gemini-2.5-flash-image',
    prompt: options.prompt,
    response_format: options.responseFormat || 'b64_json',
  };

  if (options.images && options.images.length > 0) {
    body.image = options.images;
  }
  if (options.aspectRatio) {
    body.aspect_ratio = options.aspectRatio;
  }

  console.log(`[Gemini] Generating image with model: ${body.model}, images: ${options.images?.length || 0}`);

  const response = await fetch(`${baseUrl}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API错误: ${response.status} - ${handleApiError(errorData)}`);
  }

  const result = await response.json();
  const urls = result.data
    .map((d: any) => d.url || (d.b64_json ? `data:image/png;base64,${d.b64_json}` : null))
    .filter(Boolean) as string[];

  if (urls.length === 0) {
    throw new Error('Gemini 未返回图像结果');
  }

  return { urls, created: result.created };
};

/**
 * 编辑图像
 */
export const editImage = async (
  imageBase64: string,
  prompt: string,
  model?: GeminiImageModel
): Promise<string> => {
  const result = await generateImage({
    prompt,
    model: model || 'gemini-2.5-flash-image',
    images: [imageBase64],
    count: 1,
  });
  return result.urls[0];
};

// ==================== 厂商信息 ====================

export const PROVIDER_INFO = {
  id: 'gemini',
  name: 'Gemini',
  category: 'image' as const,
  models: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini Flash Image', isDefault: true },
    { id: 'gemini-2.5-flash-image-generation', name: 'Gemini Flash Image Gen' },
  ],
  capabilities: {
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    multiImage: true,
  },
};
