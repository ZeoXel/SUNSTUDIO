"use client";

import React, { useEffect, useState } from 'react';
import { Key, Zap, TrendingUp, Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getUserInfo, type UserMeResponse } from '@/services/userApiService';

export const QuotaCard: React.FC = () => {
  const [userData, setUserData] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(!showLoading);
      const data = await getUserInfo();
      if (data) {
        setUserData(data);
        setError(null);
      }
    } catch (err) {
      console.error('获取配额信息失败:', err);
      setError(err instanceof Error ? err.message : '获取配额信息失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRefresh = () => {
    fetchUserData(false);
  };

  // 计算配额使用百分比
  const getUsagePercentage = (used: number, limit: number | null): number => {
    if (limit === null || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // 获取配额状态颜色
  const getQuotaStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  // 获取进度条颜色
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-blue-500';
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            配额使用
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-center py-4 text-sm text-red-500 flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          {error || '无法加载配额信息'}
        </div>
      </div>
    );
  }

  const { keys, usage } = userData;
  const hasKeys = keys && keys.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* 头部 */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            配额使用
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw size={14} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* API Keys 列表 */}
      <div className="px-6 py-4">
        {hasKeys ? (
          <div className="space-y-4">
            {keys.map((key) => {
              const percentage = getUsagePercentage(key.quotaUsed, key.quotaLimit);
              const hasLimit = key.quotaLimit !== null;

              return (
                <div
                  key={key.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-600"
                >
                  {/* Key 名称和前缀 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Key size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {key.name}
                        </span>
                      </div>
                      <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {key.keyPrefix}...
                      </code>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                      key.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {key.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>

                  {/* 配额类型 */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    配额类型: <span className="font-medium">{key.quotaType}</span>
                  </div>

                  {/* 使用情况 */}
                  <div className="mb-2">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">使用量</span>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${getQuotaStatusColor(percentage)}`}>
                          {key.quotaUsed.toLocaleString()}
                        </span>
                        {hasLimit && (
                          <>
                            <span className="text-xs text-slate-400 mx-1">/</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {key.quotaLimit?.toLocaleString()}
                            </span>
                          </>
                        )}
                        {hasLimit && (
                          <span className={`ml-2 text-xs font-medium ${getQuotaStatusColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 进度条 */}
                    {hasLimit && (
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(percentage)} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                    {!hasLimit && (
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>

                  {/* 最后使用时间 */}
                  {key.lastUsedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} />
                      <span>
                        最后使用: {new Date(key.lastUsedAt).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {/* 配额警告 */}
                  {hasLimit && percentage >= 90 && (
                    <div className="mt-2 flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                      <span>配额即将用尽,请及时充值</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">
            暂无 API Key
          </div>
        )}
      </div>

      {/* 30天统计 */}
      {usage && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              最近30天统计
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">总请求数</div>
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {usage.last30Days.totalRequests.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">总消费</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                ¥{usage.last30Days.totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotaCard;
