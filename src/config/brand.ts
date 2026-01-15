// 品牌配置 - 修改此处即可更换品牌

export const brand = {
  name: 'ZeoCanvas',             // 完整名称（用于 alt 等）
  namePrefix: 'Zeo',             // 普通部分
  nameHighlight: 'Canvas',       // 渐变高亮部分
  slogan: 'AI Creative Workspace',
  title: 'ZeoCanvas - AI Creative Workspace',
  description: 'ZeoCanvas - AI-powered creative workspace',
  logo: {
    light: '/logodark.svg',      // 浅色模式使用的 logo
    dark: '/logolight.svg',      // 深色模式使用的 logo
    favicon: '/logodark.svg'     // 浏览器图标
  }
} as const;

export type BrandConfig = typeof brand;
