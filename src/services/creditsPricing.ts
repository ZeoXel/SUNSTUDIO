/**
 * 平台积分定价配置
 *
 * ⚠️ 已废弃：积分计算现由 USERAPI 网关统一处理
 *
 * 定价权威：USERAPI/src/config/pricing.yaml
 * 本文件仅保留类型定义供参考，计算函数已不再使用
 *
 * 定价原则：
 * 1. 1 平台积分 ≈ 0.01 元人民币 (100积分=1元)
 * 2. 各厂商按实际成本 + 平台利润率定价
 * 3. 支持动态调整定价（通过 USERAPI 管理后台）
 */

// 视频生成定价（按秒计费）
export interface VideoPricing {
  provider: string;
  model: string;
  baseCreditsPerSecond: number;  // 基础每秒积分
  resolutionMultiplier: {
    '480p': number;
    '720p': number;
    '1080p': number;
  };
  description?: string;
}

// 图像生成定价（按张计费）
export interface ImagePricing {
  provider: string;
  model: string;
  creditsPerImage: number;
  resolutionMultiplier?: {
    '512x512': number;
    '1024x1024': number;
    '2048x2048': number;
  };
  description?: string;
}

// 音频生成定价
export interface AudioPricing {
  provider: string;
  model: string;
  // 音乐按首计费，语音按字符/秒计费
  creditsPerSong?: number;
  creditsPerSecond?: number;
  creditsPerKChars?: number;  // 每千字符
  description?: string;
}

// Chat/分析定价（按Token计费）
export interface ChatPricing {
  provider: string;
  model: string;
  creditsPerKTokensInput: number;   // 每千输入Token
  creditsPerKTokensOutput: number;  // 每千输出Token
  description?: string;
}

// ============================================
// 视频生成定价配置
// ============================================
export const VIDEO_PRICING: VideoPricing[] = [
  // Vidu
  {
    provider: 'vidu',
    model: 'viduq2-turbo',
    baseCreditsPerSecond: 8,  // 约0.08元/秒
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: 'Vidu Q2 Turbo - 快速生成',
  },
  {
    provider: 'vidu',
    model: 'viduq2-pro',
    baseCreditsPerSecond: 15,  // 约0.15元/秒
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: 'Vidu Q2 Pro - 高质量',
  },
  {
    provider: 'vidu',
    model: 'viduq2.5-turbo',
    baseCreditsPerSecond: 12,
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: 'Vidu Q2.5 Turbo',
  },
  {
    provider: 'vidu',
    model: 'viduq2.5-pro',
    baseCreditsPerSecond: 20,
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: 'Vidu Q2.5 Pro',
  },
  // Veo (Google)
  {
    provider: 'veo',
    model: 'veo3',
    baseCreditsPerSecond: 25,
    resolutionMultiplier: { '480p': 0.5, '720p': 1.0, '1080p': 2.0 },
    description: 'Google Veo 3',
  },
  {
    provider: 'veo',
    model: 'veo3.1',
    baseCreditsPerSecond: 30,
    resolutionMultiplier: { '480p': 0.5, '720p': 1.0, '1080p': 2.0 },
    description: 'Google Veo 3.1 - 最新版',
  },
  // Seedance (火山引擎)
  {
    provider: 'seedance',
    model: 'seedance-1.0-turbo',
    baseCreditsPerSecond: 10,
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: '火山 Seedance Turbo',
  },
  {
    provider: 'seedance',
    model: 'seedance-1.0-pro',
    baseCreditsPerSecond: 18,
    resolutionMultiplier: { '480p': 0.6, '720p': 1.0, '1080p': 1.5 },
    description: '火山 Seedance Pro',
  },
];

// ============================================
// 图像生成定价配置
// ============================================
export const IMAGE_PRICING: ImagePricing[] = [
  // Seedream (火山引擎)
  {
    provider: 'seedream',
    model: 'seedream-3.0',
    creditsPerImage: 2,  // 约0.02元/张
    resolutionMultiplier: { '512x512': 0.5, '1024x1024': 1.0, '2048x2048': 2.0 },
    description: '火山 Seedream 3.0',
  },
  // Nano Banana
  {
    provider: 'nano-banana',
    model: 'nano-banana',
    creditsPerImage: 3,
    resolutionMultiplier: { '512x512': 0.5, '1024x1024': 1.0, '2048x2048': 2.0 },
    description: 'Nano Banana 图像生成',
  },
  // Gemini
  {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    creditsPerImage: 5,
    description: 'Google Gemini 2.0 Flash 图像',
  },
];

// ============================================
// 音频生成定价配置
// ============================================
export const AUDIO_PRICING: AudioPricing[] = [
  // Suno - 音乐生成
  {
    provider: 'suno',
    model: 'chirp-v4',
    creditsPerSong: 50,  // 约0.5元/首
    description: 'Suno v4 音乐生成',
  },
  {
    provider: 'suno',
    model: 'chirp-v3.5',
    creditsPerSong: 30,
    description: 'Suno v3.5 音乐生成',
  },
  // MiniMax - 语音合成
  {
    provider: 'minimax',
    model: 'speech-02-turbo',
    creditsPerKChars: 2,  // 每千字符约0.02元
    description: 'MiniMax 语音合成 Turbo',
  },
  {
    provider: 'minimax',
    model: 'speech-02-hd',
    creditsPerKChars: 5,
    description: 'MiniMax 语音合成 HD',
  },
];

// ============================================
// Chat/分析定价配置
// ============================================
export const CHAT_PRICING: ChatPricing[] = [
  // Gemini
  {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    creditsPerKTokensInput: 0.5,
    creditsPerKTokensOutput: 1.5,
    description: 'Google Gemini 2.0 Flash',
  },
  {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    creditsPerKTokensInput: 0.8,
    creditsPerKTokensOutput: 2.0,
    description: 'Google Gemini 2.5 Flash',
  },
  {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    creditsPerKTokensInput: 2.5,
    creditsPerKTokensOutput: 10,
    description: 'Google Gemini 2.5 Pro',
  },
  // OpenAI
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    creditsPerKTokensInput: 0.3,
    creditsPerKTokensOutput: 1.2,
    description: 'OpenAI GPT-4o Mini',
  },
  {
    provider: 'openai',
    model: 'gpt-4o',
    creditsPerKTokensInput: 5,
    creditsPerKTokensOutput: 15,
    description: 'OpenAI GPT-4o',
  },
];

// ============================================
// 积分计算工具函数
// ============================================

/**
 * 计算视频生成消耗的积分
 */
export function calculateVideoCredits(
  provider: string,
  model: string,
  durationSeconds: number,
  resolution: '480p' | '720p' | '1080p' = '720p'
): number {
  const pricing = VIDEO_PRICING.find(p => p.provider === provider && p.model === model);
  if (!pricing) {
    console.warn(`Unknown video pricing for ${provider}/${model}, using default`);
    return Math.ceil(durationSeconds * 10); // 默认每秒10积分
  }

  const multiplier = pricing.resolutionMultiplier[resolution] || 1.0;
  return Math.ceil(pricing.baseCreditsPerSecond * durationSeconds * multiplier);
}

/**
 * 计算图像生成消耗的积分
 */
export function calculateImageCredits(
  provider: string,
  model: string,
  imageCount: number = 1,
  resolution?: string
): number {
  const pricing = IMAGE_PRICING.find(p => p.provider === provider && p.model === model);
  if (!pricing) {
    console.warn(`Unknown image pricing for ${provider}/${model}, using default`);
    return imageCount * 3; // 默认每张3积分
  }

  let multiplier = 1.0;
  if (pricing.resolutionMultiplier && resolution) {
    multiplier = pricing.resolutionMultiplier[resolution as keyof typeof pricing.resolutionMultiplier] || 1.0;
  }

  return Math.ceil(pricing.creditsPerImage * imageCount * multiplier);
}

/**
 * 计算音频生成消耗的积分
 */
export function calculateAudioCredits(
  provider: string,
  model: string,
  options: {
    songCount?: number;
    durationSeconds?: number;
    characterCount?: number;
  }
): number {
  const pricing = AUDIO_PRICING.find(p => p.provider === provider && p.model === model);
  if (!pricing) {
    console.warn(`Unknown audio pricing for ${provider}/${model}, using default`);
    return options.songCount ? options.songCount * 30 : 10;
  }

  if (pricing.creditsPerSong && options.songCount) {
    return Math.ceil(pricing.creditsPerSong * options.songCount);
  }

  if (pricing.creditsPerSecond && options.durationSeconds) {
    return Math.ceil(pricing.creditsPerSecond * options.durationSeconds);
  }

  if (pricing.creditsPerKChars && options.characterCount) {
    return Math.ceil(pricing.creditsPerKChars * (options.characterCount / 1000));
  }

  return 10; // 默认
}

/**
 * 计算Chat/分析消耗的积分
 */
export function calculateChatCredits(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = CHAT_PRICING.find(p => p.provider === provider && p.model === model);
  if (!pricing) {
    console.warn(`Unknown chat pricing for ${provider}/${model}, using default`);
    return Math.ceil((inputTokens + outputTokens) / 1000); // 默认每千token 1积分
  }

  const inputCredits = (inputTokens / 1000) * pricing.creditsPerKTokensInput;
  const outputCredits = (outputTokens / 1000) * pricing.creditsPerKTokensOutput;

  return Math.ceil(inputCredits + outputCredits);
}

/**
 * 从Vidu原生credits转换为平台积分
 * Vidu API返回的credits需要按比例转换
 */
export function convertViduCredits(viduCredits: number): number {
  // Vidu 1 credit ≈ 平台 10 积分（需要根据实际定价调整）
  return Math.ceil(viduCredits * 10);
}

/**
 * 获取模型的定价信息
 */
export function getPricingInfo(
  type: 'video' | 'image' | 'audio' | 'chat',
  provider: string,
  model: string
) {
  switch (type) {
    case 'video':
      return VIDEO_PRICING.find(p => p.provider === provider && p.model === model);
    case 'image':
      return IMAGE_PRICING.find(p => p.provider === provider && p.model === model);
    case 'audio':
      return AUDIO_PRICING.find(p => p.provider === provider && p.model === model);
    case 'chat':
      return CHAT_PRICING.find(p => p.provider === provider && p.model === model);
    default:
      return null;
  }
}

/**
 * 获取所有定价配置
 */
export function getAllPricing() {
  return {
    video: VIDEO_PRICING,
    image: IMAGE_PRICING,
    audio: AUDIO_PRICING,
    chat: CHAT_PRICING,
  };
}
