"use client";

/**
 * 音频节点底部面板组件
 *
 * 支持两种模式：
 * - 音乐模式 (Suno 自定义创作): 标题、风格、歌词、版本等完整配置
 * - 语音模式 (MiniMax TTS): 音色、语速、情感、音效
 */

import React, { useState } from 'react';
import { Music, Mic2, ChevronDown, ChevronUp, Wand2, Loader2, Gauge, Tag, Type, Sparkles, Settings2 } from 'lucide-react';
import { AppNode, AudioGenerationMode } from '@/types';
import { VOICE_PRESETS, EMOTION_PRESETS, SOUND_EFFECT_PRESETS } from '@/services/minimaxService';
import { SUNO_VERSION_PRESETS, MUSIC_STYLE_PRESETS } from '@/services/sunoService';

interface AudioNodePanelProps {
    node: AppNode;
    isOpen: boolean;
    isWorking: boolean;
    localPrompt: string;
    setLocalPrompt: (value: string) => void;
    inputHeight: number;
    inverseScale: number;
    onUpdate: (id: string, data: Partial<AppNode['data']>) => void;
    onAction: () => void;
    onInputFocus: () => void;
    onInputBlur: () => void;
    onInputResizeStart: (e: React.MouseEvent) => void;
    onCmdEnter: (e: React.KeyboardEvent) => void;
}

const GLASS_PANEL = "bg-[#ffffff]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-300 dark:border-slate-700 shadow-2xl";

export const AudioNodePanel: React.FC<AudioNodePanelProps> = ({
    node,
    isOpen,
    isWorking,
    localPrompt,
    setLocalPrompt,
    inputHeight,
    inverseScale,
    onUpdate,
    onAction,
    onInputFocus,
    onInputBlur,
    onInputResizeStart,
    onCmdEnter,
}) => {
    const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
    const audioMode = node.data.audioMode || 'music';
    const musicConfig = node.data.musicConfig || {};
    const voiceConfig = node.data.voiceConfig || {};

    // 更新音乐配置
    const updateMusicConfig = (updates: Partial<typeof musicConfig>) => {
        onUpdate(node.id, {
            musicConfig: { ...musicConfig, ...updates }
        });
    };

    // 更新音频模式 - 同时更新对应的默认模型
    const handleModeChange = (mode: AudioGenerationMode) => {
        const defaultModel = mode === 'music' ? 'suno-v4' : 'speech-2.6-hd';
        onUpdate(node.id, { audioMode: mode, model: defaultModel });
    };

    // 更新语音配置
    const updateVoiceConfig = (updates: Partial<typeof voiceConfig>) => {
        onUpdate(node.id, {
            voiceConfig: { ...voiceConfig, ...updates }
        });
    };

    // 添加风格标签
    const addStyleTag = (style: string) => {
        const currentTags = (musicConfig.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
        if (!currentTags.some((t: string) => style.includes(t) || t.includes(style))) {
            const newTags = currentTags.length > 0 ? `${musicConfig.tags}, ${style}` : style;
            updateMusicConfig({ tags: newTags });
        }
    };

    // 获取当前版本
    const getCurrentVersion = () => {
        return SUNO_VERSION_PRESETS.find(v => v.value === musicConfig.mv) || SUNO_VERSION_PRESETS[3];
    };

    // 获取当前模型显示名称
    const getCurrentModelLabel = () => {
        if (audioMode === 'music') {
            const version = getCurrentVersion();
            return version.label;
        } else {
            const model = node.data.model || 'speech-2.6-hd';
            if (model === 'speech-2.6-turbo') return 'MiniMax Turbo';
            return 'MiniMax HD';
        }
    };

    // 渲染模式切换标签
    const renderModeTabs = () => (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        audioMode === 'music'
                            ? 'bg-white dark:bg-slate-700 text-pink-500 dark:text-pink-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    onClick={() => handleModeChange('music')}
                >
                    <Music size={12} />
                    <span>音乐创作</span>
                </button>
                <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        audioMode === 'voice'
                            ? 'bg-white dark:bg-slate-700 text-pink-500 dark:text-pink-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    onClick={() => handleModeChange('voice')}
                >
                    <Mic2 size={12} />
                    <span>语音合成</span>
                </button>
            </div>
            {/* 折叠配置按钮 */}
            <button
                onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Settings2 size={12} />
                {isConfigCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
        </div>
    );

    // 渲染音乐模式配置（自定义创作模式）
    const renderMusicConfig = () => (
        <div className={`space-y-2.5 overflow-hidden transition-all duration-300 ${isConfigCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
            {/* 第一行：标题 + 版本 + 纯音乐 */}
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1.5">
                    <Type size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <input
                        type="text"
                        value={musicConfig.title || ''}
                        onChange={(e) => updateMusicConfig({ title: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="歌曲标题（可选）"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-300 dark:focus:border-pink-500 transition-colors"
                    />
                </div>

                {/* 版本选择 */}
                <div className="relative group/version">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 cursor-pointer hover:border-pink-300 dark:hover:border-pink-500 transition-colors">
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{getCurrentVersion().label}</span>
                        <ChevronDown size={10} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="absolute bottom-full right-0 mb-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl max-h-48 overflow-y-auto opacity-0 translate-y-2 pointer-events-none group-hover/version:opacity-100 group-hover/version:translate-y-0 group-hover/version:pointer-events-auto transition-all z-50">
                        {SUNO_VERSION_PRESETS.map((version) => (
                            <div
                                key={version.value}
                                className={`px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                    musicConfig.mv === version.value ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'
                                }`}
                                onClick={() => updateMusicConfig({ mv: version.value })}
                            >
                                <div className="text-[10px] font-bold">{version.label}</div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500">{version.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 纯音乐选项 */}
                <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-pink-300 dark:hover:border-pink-500 transition-colors">
                    <input
                        type="checkbox"
                        className="w-3 h-3 rounded border-slate-300 dark:border-slate-600 text-pink-500 focus:ring-pink-500"
                        checked={musicConfig.instrumental || false}
                        onChange={(e) => updateMusicConfig({ instrumental: e.target.checked })}
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">纯音乐</span>
                </label>
            </div>

            {/* 第二行：风格标签 */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <input
                        type="text"
                        value={musicConfig.tags || ''}
                        onChange={(e) => updateMusicConfig({ tags: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="音乐风格: pop, rock, electronic..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-300 dark:focus:border-pink-500 transition-colors"
                    />
                </div>
                <div className="flex flex-wrap gap-1 pl-5">
                    {MUSIC_STYLE_PRESETS.slice(0, 6).map(style => (
                        <button
                            key={style.value}
                            onClick={() => addStyleTag(style.value)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-pink-300 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-all"
                        >
                            {style.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 排除风格（可选） */}
            <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                    type="text"
                    value={musicConfig.negativeTags || ''}
                    onChange={(e) => updateMusicConfig({ negativeTags: e.target.value })}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder="排除风格（可选）: sad, slow..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-300 dark:focus:border-pink-500 transition-colors"
                />
            </div>
        </div>
    );

    // 渲染语音模式配置
    const renderVoiceConfig = () => (
        <div className={`space-y-2 overflow-hidden transition-all duration-300 ${isConfigCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
            {/* 音色选择 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-10 shrink-0">音色</span>
                <div className="relative group/voice flex-1">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 cursor-pointer hover:border-pink-300 dark:hover:border-pink-500">
                        <span className="text-[11px] text-slate-700 dark:text-slate-200">
                            {VOICE_PRESETS.find(v => v.id === voiceConfig.voiceId)?.label || '选择音色'}
                        </span>
                        <ChevronDown size={12} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl max-h-48 overflow-y-auto opacity-0 translate-y-2 pointer-events-none group-hover/voice:opacity-100 group-hover/voice:translate-y-0 group-hover/voice:pointer-events-auto transition-all z-50">
                        {VOICE_PRESETS.map((voice) => (
                            <div
                                key={voice.id}
                                className={`px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                    voiceConfig.voiceId === voice.id ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'
                                }`}
                                onClick={() => updateVoiceConfig({ voiceId: voice.id })}
                            >
                                <div className="text-[10px] font-bold">{voice.label}</div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500">{voice.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 情感 + 语速 */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-10 shrink-0">情感</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                        {EMOTION_PRESETS.slice(0, 4).map((emotion) => (
                            <button
                                key={emotion.value}
                                className={`px-1.5 py-0.5 text-[9px] rounded border transition-all ${
                                    voiceConfig.emotion === emotion.value
                                        ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600 text-pink-600 dark:text-pink-400'
                                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-pink-200 dark:hover:border-pink-500'
                                }`}
                                onClick={() => updateVoiceConfig({ emotion: emotion.value })}
                                title={emotion.desc}
                            >
                                {emotion.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 w-28">
                    <Gauge size={10} className="text-slate-400 dark:text-slate-500" />
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceConfig.speed || 1}
                        onChange={(e) => updateVoiceConfig({ speed: parseFloat(e.target.value) })}
                        className="flex-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <span className="text-[9px] text-slate-600 dark:text-slate-400 w-6">{voiceConfig.speed || 1}x</span>
                </div>
            </div>

            {/* 音效选择 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-10 shrink-0">音效</span>
                <div className="flex flex-wrap gap-1 flex-1">
                    {SOUND_EFFECT_PRESETS.map((effect) => (
                        <button
                            key={effect.value}
                            className={`px-1.5 py-0.5 text-[9px] rounded border transition-all ${
                                (voiceConfig.voiceModify?.soundEffect || '') === effect.value
                                    ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600 text-pink-600 dark:text-pink-400'
                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-pink-200 dark:hover:border-pink-500'
                            }`}
                            onClick={() => updateVoiceConfig({
                                voiceModify: { ...voiceConfig.voiceModify, soundEffect: effect.value as any }
                            })}
                            title={effect.desc}
                        >
                            {effect.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={`absolute top-full left-1/2 w-[98%] z-50 flex flex-col items-center justify-start transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            style={{
                paddingTop: `${8 * inverseScale}px`,
                transform: `translateX(-50%) scale(${inverseScale})`,
                transformOrigin: 'top center'
            }}
        >
            <div className={`w-full rounded-[20px] p-1 flex flex-col gap-1 ${GLASS_PANEL} relative z-[100]`} onMouseDown={e => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
                <div className="relative group/input bg-white dark:bg-slate-800 rounded-[16px] flex flex-col overflow-hidden">
                    {/* 模式切换 */}
                    <div className="px-3 pt-2">
                        {renderModeTabs()}
                    </div>

                    {/* 模式特定配置 */}
                    <div className="px-3 pb-1">
                        {audioMode === 'music' ? renderMusicConfig() : renderVoiceConfig()}
                    </div>

                    {/* 文本输入区 */}
                    <textarea
                        className="w-full bg-transparent text-[11px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-2.5 focus:outline-none resize-none custom-scrollbar font-medium leading-relaxed"
                        style={{ height: `${Math.min(inputHeight, 120)}px` }}
                        placeholder={audioMode === 'music'
                            ? (musicConfig.instrumental
                                ? "描述音乐氛围、节奏、情感..."
                                : "输入歌词，可用 [Verse] [Chorus] 等标签，或描述音乐风格...")
                            : "输入要转换为语音的文本内容..."
                        }
                        value={localPrompt}
                        onChange={(e) => setLocalPrompt(e.target.value)}
                        onBlur={onInputBlur}
                        onKeyDown={onCmdEnter}
                        onFocus={onInputFocus}
                        onMouseDown={e => e.stopPropagation()}
                        readOnly={isWorking}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-3 cursor-row-resize flex items-center justify-center opacity-0 group-hover/input:opacity-100 transition-opacity" onMouseDown={onInputResizeStart}>
                        <div className="w-8 h-1 rounded-full bg-slate-100 dark:bg-slate-700 group-hover/input:bg-slate-200 dark:group-hover/input:bg-slate-600" />
                    </div>
                </div>
                {/* 底部操作栏 */}
                <div className="flex items-center justify-between px-2 pb-1 pt-1 relative z-20">
                    <div className="flex items-center gap-2">
                        {/* 模型/版本显示 */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {audioMode === 'music' ? <Music size={10} /> : <Mic2 size={10} />}
                            <span>{getCurrentModelLabel()}</span>
                        </div>

                        {/* 音乐模式：显示配置标签 */}
                        {audioMode === 'music' && musicConfig.tags && (
                            <div className="px-2 py-1 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded text-[9px] text-pink-600 dark:text-pink-400 truncate max-w-[100px]">
                                {musicConfig.tags}
                            </div>
                        )}
                        {audioMode === 'music' && musicConfig.instrumental && (
                            <div className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded text-[9px] text-purple-600 dark:text-purple-400">
                                纯音乐
                            </div>
                        )}

                        {/* 语音模式下的模型切换 */}
                        {audioMode === 'voice' && (
                            <div className="relative group/model">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-[10px] text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400">
                                    <span>切换模型</span>
                                    <ChevronDown size={10} />
                                </div>
                                <div className="absolute bottom-full left-0 pb-2 w-36 opacity-0 translate-y-2 pointer-events-none group-hover/model:opacity-100 group-hover/model:translate-y-0 group-hover/model:pointer-events-auto transition-all duration-200 z-[200]">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden">
                                        <div onClick={() => onUpdate(node.id, { model: 'speech-2.6-hd' })} className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${node.data.model === 'speech-2.6-hd' || !node.data.model ? 'text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30' : 'text-slate-600 dark:text-slate-300'}`}>MiniMax HD</div>
                                        <div onClick={() => onUpdate(node.id, { model: 'speech-2.6-turbo' })} className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${node.data.model === 'speech-2.6-turbo' ? 'text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30' : 'text-slate-600 dark:text-slate-300'}`}>MiniMax Turbo</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 生成按钮 */}
                    <button
                        onClick={onAction}
                        disabled={isWorking}
                        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-[12px] font-bold text-[10px] tracking-wide transition-all duration-300 ${
                            isWorking
                                ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {isWorking ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />}
                        <span>{isWorking ? '生成中...' : '生成'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
