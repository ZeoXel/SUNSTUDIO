# Task Plan: 模型注册表系统

## Goal
实现模型注册表架构，支持动态参数配置、二级菜单选择、模型 Logo 集成。

## Phases
- [x] Phase 1: 研究与设计
- [x] Phase 2: ModelRegistry 核心实现
- [x] Phase 3: 节点创建菜单改造 ✅
- [x] Phase 4: Node.tsx 集成 ✅
- [x] Phase 5: 模型 Logo 收集与集成 ✅

## Status
**已完成** - 模型注册表系统已按厂商分组重构

## 最终架构

### 菜单结构（二级）
```
图片生成 ▶ ┬─ Nano Banana (默认: nano-banana)
           └─ Seedream    (默认: seedream 4.5)

视频生成 ▶ ┬─ Veo        (默认: veo3.1)
           └─ Seedance   (默认: seedance 1.5)

音频生成 ▶ ┬─ Suno 音乐  (默认: suno-v4)
           └─ MiniMax 语音 (默认: speech-2.6-hd)
```

### 节点内模型选择
- 节点创建后，下拉菜单只显示当前厂商的模型变体
- 例如：选择 Veo 厂商创建节点后，下拉显示 Veo 3.1 / Veo 3.1 Pro / Veo 多图参考

### 核心 API
```typescript
getProvider(providerId)           // 获取厂商定义
getProviderByModelId(modelId)     // 根据模型ID获取厂商
getDefaultModelId(providerId)     // 获取厂商默认模型
getProviderModels(providerId)     // 获取厂商所有模型变体
```

## Phase 1 完成总结

### 关键文件
| 文件 | 作用 |
|------|------|
| `src/types/index.ts` | NodeType 枚举 |
| `src/components/studio/shared/constants.ts` | 模型参数配置 |
| `src/components/studio/Node.tsx:1515-1531` | 模型列表 |
| `src/components/studio/StudioTab.tsx:728-790` | addNode() |
| `src/components/studio/StudioTab.tsx:3244-3248` | 创建菜单 |

### 当前模型
| 类别 | 模型 |
|------|------|
| 图片 | Seedream 4.5, Nano Banana, Nano Pro |
| 视频 | Veo 3.1, Veo 3.1 Pro, Seedance 1.5 |
| 音频 | Suno V4 (音乐), MiniMax TTS (语音) |

---

## Phase 2: ModelRegistry 实现

### 目标结构
```
src/config/
└── models/
    ├── index.ts           # ModelRegistry 导出
    ├── types.ts           # 类型定义
    ├── image-models.ts    # 图片模型配置
    ├── video-models.ts    # 视频模型配置
    └── audio-models.ts    # 音频模型配置
```

### ModelDefinition 类型
```typescript
interface ModelDefinition {
  id: string;               // 'nano-banana'
  name: string;             // 'Nano Banana'
  category: 'image' | 'video' | 'audio';
  subcategory?: 'music' | 'voice';
  provider: string;         // 'ByteDance' | 'Google' | ...
  logo?: string;            // '/logos/nano-banana.svg'

  // 能力标识
  capabilities: {
    aspectRatios?: string[];
    durations?: number[];
    multiImage?: boolean;
    firstLastFrame?: boolean;
    multiOutput?: boolean;
  };

  // 默认值
  defaults: {
    aspectRatio?: string;
    duration?: number;
  };
}
```

### ModelRegistry API
```typescript
// 获取所有模型（按类别分组）
getModelsByCategory(category: string): ModelDefinition[]

// 获取单个模型
getModel(id: string): ModelDefinition | undefined

// 获取菜单结构（用于二级菜单）
getMenuStructure(): MenuCategory[]
```

---

## Phase 3: 节点创建菜单改造

### 目标 UI
```
┌─────────────────────┐
│ 创建新节点           │
├─────────────────────┤
│ 📝 提示词            │
│ 🖼️ 插入图片          │
│ 🎬 插入视频          │
├─────────────────────┤
│ 🖼️ 图片生成     ▶   │ ─┬─ Seedream 4.5
│                     │  ├─ Nano Banana
│                     │  └─ Nano Pro
├─────────────────────┤
│ 🎬 视频生成     ▶   │ ─┬─ Veo 3.1
│                     │  ├─ Veo 3.1 Pro
│                     │  └─ Seedance 1.5
├─────────────────────┤
│ 🎵 音频生成     ▶   │ ─┬─ Suno 音乐
│                     │  └─ MiniMax 语音
└─────────────────────┘
```

### 交互
- 鼠标悬停展开二级菜单
- 点击模型直接创建节点（已设置默认模型）

---

## Phase 4: Node.tsx 集成

### 改造点
1. 从 ModelRegistry 获取模型列表
2. 根据模型配置动态渲染参数面板
3. 显示模型 Logo

---

## Phase 5: 模型 Logo

### 收集清单
| 模型 | 来源 |
|------|------|
| Seedream | 火山引擎 |
| Nano Banana | 需自制 |
| Veo | Google |
| Seedance | 火山引擎 |
| Suno | suno.com |
| MiniMax | minimax.chat |

### 存储
```
public/logos/
├── seedream.svg
├── nano-banana.svg
├── veo.svg
├── suno.svg
└── minimax.svg
```

---

## Decisions Made
- 保持 NodeType 不变，模型作为 data.model 属性
- Logo 使用本地 SVG 文件，避免外部依赖
- 二级菜单使用 CSS hover 展开，无需额外状态

## Status
**Phase 2 READY** - 开始实现 ModelRegistry
