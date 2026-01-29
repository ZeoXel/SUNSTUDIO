"use client";

import React, { useMemo, useState } from 'react';
import { VChart } from '@visactor/react-vchart';
import { modelToColor, CHART_CONFIG } from './VChartWrapper';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface VDonutChartProps {
  data: DonutSegment[];
  title?: string;
  onHover?: (segment: DonutSegment | null) => void;
}

export const VDonutChart: React.FC<VDonutChartProps> = ({
  data,
  title = '模型占比',
  onHover,
}) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const spec = useMemo(() => {
    const chartData = data.map(d => ({
      type: d.label,
      value: d.value,
    }));

    // 构建颜色映射
    const colorMap: Record<string, string> = {};
    data.forEach(d => {
      colorMap[d.label] = d.color;
    });

    return {
      type: 'pie',
      data: [{ id: 'pieData', values: chartData }],
      outerRadius: 0.85,
      innerRadius: 0.6,
      padAngle: 1,
      valueField: 'value',
      categoryField: 'type',
      pie: {
        style: {
          cornerRadius: 4,
        },
        state: {
          hover: {
            outerRadius: 0.88,
            stroke: '#fff',
            lineWidth: 2,
          },
        },
      },
      title: {
        visible: false,
      },
      legends: {
        visible: false,
      },
      label: {
        visible: false,
      },
      tooltip: {
        mark: {
          content: [
            {
              key: (datum: any) => datum.type,
              value: (datum: any) => {
                const percentage = ((datum.value / total) * 100).toFixed(0);
                return `${datum.value.toFixed(2)} (${percentage}%)`;
              },
            },
          ],
        },
      },
      color: {
        specified: colorMap,
      },
      indicator: {
        visible: true,
        trigger: 'hover',
        title: {
          visible: true,
          style: {
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#64748b',
            text: (datum: any) => datum ? datum.type : '总消耗',
          },
        },
        content: [
          {
            visible: true,
            style: {
              fontSize: 20,
              fontWeight: 'bold',
              fill: '#1e293b',
              text: (datum: any) => datum ? datum.value.toFixed(1) : total.toFixed(1),
            },
          },
        ],
      },
      background: 'transparent',
      padding: 10,
    };
  }, [data, total]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
        暂无数据
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <VChart spec={spec} option={CHART_CONFIG} />
    </div>
  );
};

export default VDonutChart;
