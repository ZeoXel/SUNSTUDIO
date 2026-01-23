"use client";

import React from 'react';
import { UserDashboard } from '@/components/user';

/**
 * 用户中心页面
 * 展示用户信息和配额使用情况
 */
export default function UserPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            用户中心
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            查看您的账户信息和配额使用情况
          </p>
        </div>

        {/* 用户仪表盘 */}
        <UserDashboard layout="grid" />
      </div>
    </div>
  );
}
