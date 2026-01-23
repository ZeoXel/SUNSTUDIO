"use client";

import React from 'react';
import { UserProfileCard } from './UserProfileCard';
import { QuotaCard } from './QuotaCard';

interface UserDashboardProps {
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
}

/**
 * 用户仪表盘组合组件
 * 包含用户信息卡片和配额信息卡片
 */
export const UserDashboard: React.FC<UserDashboardProps> = ({
  layout = 'vertical',
  className = '',
}) => {
  const layoutClasses = {
    vertical: 'flex flex-col gap-4',
    horizontal: 'flex flex-row gap-4',
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      <UserProfileCard />
      <QuotaCard />
    </div>
  );
};

export default UserDashboard;
