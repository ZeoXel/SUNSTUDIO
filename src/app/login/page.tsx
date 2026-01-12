"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    loginByEmail,
    loginByPhoneCode,
    sendPhoneCode,
} from '@/services/authingService';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, setUser } = useAuth();

    const [method, setMethod] = useState<LoginMethod>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('lsai-theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async () => {
        if (!phone || countdown > 0 || sendingCode) return;
        setSendingCode(true);
        setError('');
        try {
            await sendPhoneCode(phone);
            setCountdown(60);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '发送验证码失败');
        } finally {
            setSendingCode(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsLoading(true);
        setError('');
        try {
            const user = await loginByEmail(email, password);
            setUser(user);
            router.replace('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '登录失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !code) return;
        setIsLoading(true);
        setError('');
        try {
            const user = await loginByPhoneCode(phone, code);
            setUser(user);
            router.replace('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '登录失败');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
            {/* 画布网格背景 */}
            <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" className="opacity-40 dark:opacity-20">
                    <defs>
                        <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />
                </svg>
            </div>

            {/* 登录区域 */}
            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <img
                        src={theme === 'dark' ? '/logolight.svg' : '/logodark.svg'}
                        alt="ZeoCanvas"
                        className="w-10 h-10 object-contain"
                    />
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                        Zeo<span className="text-blue-500">Canvas</span>
                    </h1>
                </div>

                {/* 登录卡片 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    {/* 切换标签 */}
                    <div className="flex mb-6 border-b border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => { setMethod('email'); setError(''); }}
                            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                                method === 'email'
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            邮箱登录
                            {method === 'email' && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => { setMethod('phone'); setError(''); }}
                            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                                method === 'phone'
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            手机登录
                            {method === 'phone' && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* 邮箱表单 */}
                    {method === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="邮箱地址"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                disabled={isLoading}
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="密码"
                                    className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        登录
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* 手机表单 */}
                    {method === 'phone' && (
                        <form onSubmit={handlePhoneLogin} className="space-y-4">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="手机号码"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                disabled={isLoading}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="验证码"
                                    maxLength={6}
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={!phone || countdown > 0 || sendingCode}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap text-sm"
                                >
                                    {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '获取验证码'}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !phone || !code}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        登录
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* 底部文字 */}
                <p className="mt-6 text-center text-xs text-slate-400">
                    AI Creative Workspace
                </p>
            </div>
        </div>
    );
}
