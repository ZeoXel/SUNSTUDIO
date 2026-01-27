"use client";

import React from 'react';
import { UserProfileCard } from './UserProfileCard';
import { QuotaCard } from './QuotaCard';
import { UserApiDebug } from './UserApiDebug';

interface UserDashboardProps {
  layout?: 'vertical' | 'horizontal' | 'grid';
  /** 是否显示调试面板 */
  showDebug?: boolean;
  className?: string;
}

/**
 * 用户仪表盘组合组件
 * 包含用户信息卡片和配额信息卡片
 */
export const UserDashboard: React.FC<UserDashboardProps> = ({
  layout = 'vertical',
  showDebug = process.env.NODE_ENV === 'development',
  className = '',
}) => {
  const layoutClasses = {
    vertical: 'flex flex-col gap-4',
    horizontal: 'flex flex-row gap-4',
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showDebug && <UserApiDebug />}
      <UserProfileCard />
      <QuotaCard />
    </div>
  );
};

export default UserDashboard;
