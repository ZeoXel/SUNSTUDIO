/**
 * 厂商服务统一入口
 *
 * 按厂商组织的服务架构：
 * - 每个厂商一个独立文件
 * - 共享工具层抽取公共逻辑
 * - 统一路由自动分发请求
 */

// 导出共享工具
export * from './shared';

// 导出各厂商服务
export * as nanoBanana from './nanoBanana';
export * as seedream from './seedream';
export * as veo from './veo';
export * as seedance from './seedance';

// 导入厂商信息
import { PROVIDER_INFO as NANO_BANANA_INFO } from './nanoBanana';
import { PROVIDER_INFO as SEEDREAM_INFO } from './seedream';
import { PROVIDER_INFO as VEO_INFO } from './veo';
import { PROVIDER_INFO as SEEDANCE_INFO } from './seedance';

// 导入服务函数
import * as nanoBananaService from './nanoBanana';
import * as seedreamService from './seedream';
import * as veoService from './veo';
import * as seedanceService from './seedance';

// ==================== 厂商注册表 ====================

export type ProviderId = 'nano-banana' | 'seedream' | 'veo' | 'seedance';

export const PROVIDERS = {
  'nano-banana': NANO_BANANA_INFO,
  'seedream': SEEDREAM_INFO,
  'veo': VEO_INFO,
  'seedance': SEEDANCE_INFO,
} as const;

// 模型ID到厂商ID的映射
const MODEL_TO_PROVIDER: Record<string, ProviderId> = {};

// 初始化映射
Object.values(PROVIDERS).forEach(provider => {
  provider.models.forEach(model => {
    MODEL_TO_PROVIDER[model.id] = provider.id as ProviderId;
  });
});

// ==================== 路由函数 ====================

/**
 * 根据模型ID获取厂商ID
 */
export const getProviderId = (modelId: string): ProviderId | undefined => {
  // 精确匹配
  if (MODEL_TO_PROVIDER[modelId]) {
    return MODEL_TO_PROVIDER[modelId];
  }
  // 前缀匹配
  if (modelId.startsWith('veo')) return 'veo';
  if (modelId.includes('seedream') || modelId.includes('doubao-seedream')) return 'seedream';
  if (modelId.includes('seedance') || modelId.includes('doubao-seedance')) return 'seedance';
  if (modelId.includes('nano-banana')) return 'nano-banana';
  return undefined;
};

/**
 * 获取厂商信息
 */
export const getProviderInfo = (providerId: ProviderId) => {
  return PROVIDERS[providerId];
};

// ==================== 统一生成接口 ====================

export interface GenerateImageOptions {
  prompt: string;
  model: string;
  aspectRatio?: string;
  images?: string[];
  count?: number;
  size?: string;
}

export interface GenerateVideoOptions {
  prompt: string;
  model: string;
  aspectRatio?: string;
  duration?: number;
  images?: string[];
  imageRoles?: ('first_frame' | 'last_frame')[];
  enhancePrompt?: boolean;
}

/**
 * 统一图像生成接口
 */
export const generateImage = async (options: GenerateImageOptions): Promise<string[]> => {
  const providerId = getProviderId(options.model);

  switch (providerId) {
    case 'nano-banana': {
      const result = await nanoBananaService.generateImage({
        prompt: options.prompt,
        model: options.model as any,
        aspectRatio: options.aspectRatio as any,
        images: options.images,
        imageSize: options.size as any,
      });
      return result.urls;
    }

    case 'seedream': {
      const result = await seedreamService.generateImage({
        prompt: options.prompt,
        model: options.model,
        images: options.images,
        n: options.count,
        size: options.size,
      });
      return result.urls;
    }

    default:
      throw new Error(`不支持的图像模型: ${options.model}`);
  }
};

/**
 * 统一视频生成接口
 */
export const generateVideo = async (
  options: GenerateVideoOptions,
  onProgress?: (progress: string) => void
): Promise<string> => {
  const providerId = getProviderId(options.model);

  switch (providerId) {
    case 'veo': {
      const result = await veoService.generateVideo({
        prompt: options.prompt,
        model: options.model as any,
        aspectRatio: options.aspectRatio as any,
        duration: options.duration,
        images: options.images,
        enhancePrompt: options.enhancePrompt,
      }, onProgress);
      return result.url;
    }

    case 'seedance': {
      const result = await seedanceService.generateVideo({
        prompt: options.prompt,
        model: options.model,
        duration: options.duration,
        images: options.images,
        imageRoles: options.imageRoles,
      }, onProgress);
      return result.url;
    }

    default:
      throw new Error(`不支持的视频模型: ${options.model}`);
  }
};
