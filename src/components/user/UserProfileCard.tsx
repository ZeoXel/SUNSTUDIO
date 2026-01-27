"use client";

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, LogOut, Loader2 } from 'lucide-react';
import { getUserInfo, type UserMeResponse } from '@/services/userApiService';
import { useAuth } from '@/contexts/AuthContext';

export const UserProfileCard: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [userData, setUserData] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 尝试使用 authUser 的信息作为备用参数
        const options = authUser ? {
          provider: 'authing',
          provider_id: authUser.id,
        } : undefined;

        const data = await getUserInfo(options);
        if (data) {
          setUserData(data);
          setError(null);
        } else {
          setError('无法获取用户信息，请尝试重新登录');
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
        setError(err instanceof Error ? err.message : '获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗?')) {
      await logout();
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="text-center py-4 text-sm text-red-500">
          {error || '无法加载用户信息'}
        </div>
      </div>
    );
  }

  const { user } = userData;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* 头部背景 */}
      <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="userBg" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#userBg)" />
          </svg>
        </div>
      </div>

      {/* 用户信息 */}
      <div className="px-6 pb-6 -mt-10 relative">
        {/* 头像 */}
        <div className="flex items-end justify-between mb-4">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover bg-slate-100 dark:bg-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {/* 在线状态指示器 */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
          </div>

          {/* 退出按钮 */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            退出
          </button>
        </div>

        {/* 用户名和角色 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {user.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              user.role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {user.role === 'admin' ? '管理员' : '用户'}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              user.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {user.status === 'active' ? '正常' : '禁用'}
            </span>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="space-y-2 mb-4">
          {user.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail size={14} className="text-slate-400" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone size={14} className="text-slate-400" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {userData.usage && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">最近30天使用</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">总请求数</div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {userData.usage.last30Days.totalRequests.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">总消费</div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  ¥{userData.usage.last30Days.totalCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;
