# Task Plan: StudioTab.tsx 架构重构

## Goal
将 3522 行的单体组件重构为可维护的模块化架构，解决状态爆炸、性能瓶颈和维护困难问题。

## Phases
- [x] Phase 1: 深度分析现有架构
- [x] Phase 2: 设计重构方案
- [ ] Phase 3: 状态合并实施
- [ ] Phase 4: Hook 提取实施
- [ ] Phase 5: 组件拆分实施
- [ ] Phase 6: 性能优化实施
- [ ] Phase 7: 验证和测试

## Key Questions
1. ✅ 状态如何分类和合并？→ 见 notes.md 状态分析部分
2. ✅ handleGlobalMouseMove 如何拆分？→ 采用模式分发策略
3. ✅ DOM 操作策略如何保留？→ 保留 nodeRefsMap/groupRefsMap 模式
4. ✅ 如何渐进式重构不破坏现有功能？→ 分阶段实施，每阶段验证

## Decisions Made
- **状态管理**: 采用自定义 Hook + useState，不引入 Zustand（渐进式）
- **交互状态**: 采用 InteractionMode 状态机模式
- **性能优化**: 保留现有 DOM 直接操作策略
- **吸附算法**: 采用空间分区索引优化

## Errors Encountered
- (暂无)

## Status
**Phase 4 COMPLETE** - Hook 状态迁移完成

## 已完成
- [x] useViewport Hook - 视口控制 (scale, pan, 坐标转换, 滚轮缩放)
- [x] useInteraction Hook - 交互状态机 (InteractionMode 类型)
- [x] useCanvasData Hook - 画布数据操作 (nodes, connections, groups)
- [x] useCanvasHistory Hook - 撤销/重做管理
- [x] **viewport 状态已迁移** - scale, pan, scaleRef, panRef
- [x] **选择状态已迁移** - selectedNodeIds, selectedGroupIds → useInteraction.selection
- [x] **鼠标/键盘状态已迁移** - mousePos, isSpacePressed → useInteraction
- [x] **selectionRect 已迁移** - useInteraction.mode.type === 'selecting'
- [x] **connectionStart 已迁移** - useInteraction.mode.type === 'connecting'
- [x] **panning 状态已迁移** - isDraggingCanvas → isPanning, lastMousePos → mode.lastPos
- [x] **canvasData 已迁移** - nodes, connections, groups, refs → useCanvasData
- [x] **history 已迁移** - history, historyIndex, refs → useCanvasHistory
- [x] 所有构建验证通过

## 文件结构
```
src/hooks/canvas/
├── index.ts           # 统一导出
├── useViewport.ts     # 视口控制 (scale, pan, 坐标转换)
├── useInteraction.ts  # 交互状态机 (InteractionMode 类型)
├── useCanvasData.ts   # 画布数据 (nodes, connections, groups)
└── useHistory.ts      # 历史记录 (undo/redo)
```

## 当前状态
StudioTab.tsx 中已添加 hooks 调用（第 174-178 行），
暂时使用 _ 前缀标记为未使用状态，为后续渐进式迁移做准备。

## 迁移进度总结 (Phase 4 完成)
| 指标 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| useState | 45 | 31 | -14 |
| useRef | 22 | 14 | -8 |

### 已迁移状态
1. ✅ viewport: scale, pan, scaleRef, panRef → useViewport
2. ✅ selection: selectedNodeIds, selectedGroupIds → useInteraction.selection
3. ✅ selectionRect → useInteraction.mode (type: 'selecting')
4. ✅ connectionStart → useInteraction.mode (type: 'connecting')
5. ✅ panning: isDraggingCanvas, lastMousePos → useInteraction.mode (type: 'panning')
6. ✅ mousePos, isSpacePressed → useInteraction
7. ✅ canvasData: nodes, connections, groups, refs → useCanvasData
8. ✅ history: history, historyIndex, refs → useCanvasHistory

### 下一步 (Phase 5 - 可选)
深度迁移剩余交互状态:
- ⏳ draggingNodeId, resizingNodeId 等 → useInteraction mode
- ⏳ 组件拆分 (ConnectionsLayer, GroupsLayer 等)

## 使用示例
```typescript
import { useViewport, useInteraction, useCanvasData, useCanvasHistory } from '@/hooks/canvas';

// Viewport
const { scale, pan, setScale, setPan, screenToCanvas, handleWheel } = useViewport();

// Interaction
const { mode, selection, startNodeDrag, finishInteraction, selectNodes } = useInteraction();

// Canvas Data
const { nodes, connections, groups, addNode, updateNode, deleteNodes } = useCanvasData();

// History
const { saveSnapshot, undo, redo, canUndo, canRedo } = useCanvasHistory();
```
