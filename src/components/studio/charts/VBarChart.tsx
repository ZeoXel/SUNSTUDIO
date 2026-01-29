"use client";

import React, { useMemo } from 'react';
import { VChart } from '@visactor/react-vchart';
import { modelToColor, CHART_CONFIG } from './VChartWrapper';

interface BarDataPoint {
  model: string;
  value: number;
  color: string;
}

interface VBarChartProps {
  data: BarDataPoint[];
  title?: string;
  valueLabel?: string;
}

export const VBarChart: React.FC<VBarChartProps> = ({
  data,
  title,
  valueLabel = '消耗',
}) => {
  const spec = useMemo(() => {
    // 按值排序
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const chartData = sortedData.map(d => ({
      model: d.model,
      value: d.value,
    }));

    // 构建颜色映射
    const colorMap: Record<string, string> = {};
    data.forEach(d => {
      colorMap[d.model] = d.color;
    });

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return {
      type: 'bar',
      data: [{ id: 'barData', values: chartData }],
      xField: 'model',
      yField: 'value',
      seriesField: 'model',
      bar: {
        style: {
          cornerRadius: [4, 4, 0, 0],
        },
        state: {
          hover: {
            stroke: '#000',
            lineWidth: 1,
          },
        },
      },
      title: title ? {
        visible: true,
        text: title,
        subtext: `总计：${total.toFixed(1)}`,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#64748b',
        },
        subtextStyle: {
          fontSize: 12,
          fill: '#94a3b8',
        },
      } : { visible: false },
      legends: {
        visible: false,
      },
      label: {
        visible: true,
        position: 'top',
        style: {
          fill: '#64748b',
          fontSize: 10,
        },
        formatMethod: (v: number) => v.toFixed(1),
      },
      axes: [
        {
          orient: 'bottom',
          label: {
            style: {
              fill: '#94a3b8',
              fontSize: 9,
              angle: -30,
            },
            formatMethod: (v: string) => v.length > 12 ? v.slice(0, 12) + '...' : v,
          },
          tick: { visible: false },
          domainLine: { visible: false },
        },
        {
          orient: 'left',
          label: {
            style: { fill: '#94a3b8', fontSize: 10 },
            formatMethod: (v: number) => v.toFixed(0),
          },
          tick: { visible: false },
          domainLine: { visible: false },
          grid: {
            style: { stroke: '#e2e8f0', lineDash: [4, 4] },
          },
        },
      ],
      tooltip: {
        mark: {
          content: [
            {
              key: (datum: any) => datum.model,
              value: (datum: any) => `${datum.value.toFixed(2)} ${valueLabel}`,
            },
          ],
        },
      },
      color: {
        specified: colorMap,
      },
      padding: { top: 40, right: 20, bottom: 50, left: 40 },
      background: 'transparent',
    };
  }, [data, title, valueLabel]);

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

export default VBarChart;
