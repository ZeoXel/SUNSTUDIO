import type { ProviderDefinition } from './types';

/** 视频生成厂商列表 */
export const VIDEO_PROVIDERS: ProviderDefinition[] = [
  {
    id: 'veo',
    name: 'Veo',
    category: 'video',
    logo: '/logos/veo.svg',
    models: [
      { id: 'veo3.1', name: 'Veo 3.1', isDefault: true },
      { id: 'veo3.1-pro', name: 'Veo 3.1 Pro' },
      { id: 'veo3.1-components', name: 'Veo 多图参考' },
    ],
    capabilities: {
      aspectRatios: ['16:9', '9:16', '1:1'],
      durations: [5, 6, 7, 8],
      firstLastFrame: true,
      multiOutput: true,
      maxOutputCount: 4,
    },
    defaults: {
      aspectRatio: '16:9',
      duration: 8,
    },
  },
  {
    id: 'seedance',
    name: 'Seedance',
    category: 'video',
    logo: '/logos/seedance.svg',
    models: [
      { id: 'doubao-seedance-1-5-pro-251215', name: 'Seedance 1.5', isDefault: true },
    ],
    capabilities: {
      aspectRatios: ['16:9', '9:16', '1:1'],
      durations: [-1, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      firstLastFrame: true,
      multiOutput: true,
      maxOutputCount: 4,
    },
    defaults: {
      aspectRatio: '16:9',
      duration: 5,
    },
  },
];
