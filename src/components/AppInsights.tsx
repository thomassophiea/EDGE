/**
 * App Insights Dashboard
 *
 * Displays application visibility and control metrics including:
 * - Top/Bottom categories by usage (bytes)
 * - Top/Bottom categories by client count
 * - Top/Bottom categories by throughput (bps)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import {
  AppWindow,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Gauge,
  HardDrive,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatBytes } from '../lib/units';

// Types for app insights data
interface AppGroupStat {
  id: string;
  name: string;
  value: number;
}

interface AppGroupReport {
  reportName: string;
  reportType: string;
  unit: string;
  fromTimeInMillis: number;
  toTimeInMillis: number;
  distributionStats: AppGroupStat[];
}

interface AppInsightsData {
  topAppGroupsByUsage: AppGroupReport[];
  topAppGroupsByClientCountReport: AppGroupReport[];
  topAppGroupsByThroughputReport: AppGroupReport[];
  worstAppGroupsByUsage: AppGroupReport[];
  worstAppGroupsByClientCountReport: AppGroupReport[];
  worstAppGroupsByThroughputReport: AppGroupReport[];
}

// Color palette for charts
const CHART_COLORS = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#14b8a6', // teal
  '#f59e0b', // amber
];

// Format throughput value
const formatThroughput = (bps: number): string => {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`;
  return `${bps.toFixed(2)} bps`;
};

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let formattedValue = value;

    if (unit === 'bytes') {
      formattedValue = formatBytes(value);
    } else if (unit === 'bps') {
      formattedValue = formatThroughput(value);
    } else if (unit === 'users') {
      formattedValue = `${value} clients`;
    }

    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-medium">{payload[0].name || label}</p>
        <p className="text-sm text-muted-foreground">{formattedValue}</p>
      </div>
    );
  }
  return null;
};

interface AppInsightsProps {
  api: any;
}

export function AppInsights({ api }: AppInsightsProps) {
  const [data, setData] = useState<AppInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('14D');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch app insights data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getAppInsights(duration);
      setData(response);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch app insights:', err);
      setError('Failed to load application insights data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [duration]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      topUsage: data.topAppGroupsByUsage?.[0]?.distributionStats || [],
      topClientCount: data.topAppGroupsByClientCountReport?.[0]?.distributionStats || [],
      topThroughput: data.topAppGroupsByThroughputReport?.[0]?.distributionStats || [],
      bottomUsage: data.worstAppGroupsByUsage?.[0]?.distributionStats || [],
      bottomClientCount: data.worstAppGroupsByClientCountReport?.[0]?.distributionStats || [],
      bottomThroughput: data.worstAppGroupsByThroughputReport?.[0]?.distributionStats || [],
    };
  }, [data]);

  // Calculate totals for donut centers
  const totals = useMemo(() => {
    if (!chartData) return null;

    return {
      topClientCount: chartData.topClientCount.reduce((sum, item) => sum + item.value, 0),
      topThroughput: chartData.topThroughput.reduce((sum, item) => sum + item.value, 0),
      bottomClientCount: chartData.bottomClientCount.reduce((sum, item) => sum + item.value, 0),
      bottomThroughput: chartData.bottomThroughput.reduce((sum, item) => sum + item.value, 0),
    };
  }, [chartData]);

  // Horizontal Bar Chart Component
  const HorizontalBarChartWidget = ({
    title,
    data,
    unit,
    icon: Icon,
    variant = 'top'
  }: {
    title: string;
    data: AppGroupStat[];
    unit: string;
    icon: any;
    variant?: 'top' | 'bottom';
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${variant === 'top' ? 'text-green-500' : 'text-amber-500'}`} />
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.length} categories
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.slice(0, 10).map((item, index) => {
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              let displayValue = item.value.toString();

              if (unit === 'bytes') {
                displayValue = formatBytes(item.value);
              } else if (unit === 'bps') {
                displayValue = formatThroughput(item.value);
              } else if (unit === 'users') {
                displayValue = `${item.value}`;
              }

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[150px]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="font-medium ml-2">{displayValue}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        variant === 'top' ? 'bg-primary' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Donut Chart Widget Component
  const DonutChartWidget = ({
    title,
    data,
    unit,
    icon: Icon,
    centerValue,
    centerLabel,
    variant = 'top'
  }: {
    title: string;
    data: AppGroupStat[];
    unit: string;
    icon: any;
    centerValue: string;
    centerLabel: string;
    variant?: 'top' | 'bottom';
  }) => {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${variant === 'top' ? 'text-green-500' : 'text-amber-500'}`} />
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Donut Chart */}
            <div className="relative w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.slice(0, 10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip unit={unit} />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{centerValue}</span>
                <span className="text-xs text-muted-foreground">{centerLabel}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1 max-h-[180px] overflow-y-auto">
              {data.slice(0, 10).map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate" title={item.name}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-4 py-8">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppWindow className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">App Insights</h1>
            <p className="text-sm text-muted-foreground">
              Application visibility and traffic analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Duration selector */}
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">Last 24 Hours</SelectItem>
              <SelectItem value="7D">Last 7 Days</SelectItem>
              <SelectItem value="14D">Last 14 Days</SelectItem>
              <SelectItem value="30D">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh button */}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last refresh timestamp */}
      <div className="text-xs text-muted-foreground">
        Last updated: {lastRefresh.toLocaleString()}
      </div>

      {/* Top Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-semibold">Top Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top by Usage */}
          {chartData && (
            <HorizontalBarChartWidget
              title="Top Categories by Usage"
              data={chartData.topUsage}
              unit="bytes"
              icon={HardDrive}
              variant="top"
            />
          )}

          {/* Top by Client Count */}
          {chartData && totals && (
            <DonutChartWidget
              title="Top Categories by Client Count"
              data={chartData.topClientCount}
              unit="users"
              icon={Users}
              centerValue={formatNumber(totals.topClientCount)}
              centerLabel="CLIENTS"
              variant="top"
            />
          )}

          {/* Top by Throughput */}
          {chartData && totals && (
            <DonutChartWidget
              title="Top Categories by Throughput"
              data={chartData.topThroughput}
              unit="bps"
              icon={Gauge}
              centerValue={formatThroughput(totals.topThroughput)}
              centerLabel="THROUGHPUT"
              variant="top"
            />
          )}
        </div>
      </div>

      {/* Bottom Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Bottom Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bottom by Usage */}
          {chartData && (
            <HorizontalBarChartWidget
              title="Bottom Categories by Usage"
              data={chartData.bottomUsage}
              unit="bytes"
              icon={HardDrive}
              variant="bottom"
            />
          )}

          {/* Bottom by Client Count */}
          {chartData && totals && (
            <DonutChartWidget
              title="Bottom Categories by Client Count"
              data={chartData.bottomClientCount}
              unit="users"
              icon={Users}
              centerValue={formatNumber(totals.bottomClientCount)}
              centerLabel="CLIENTS"
              variant="bottom"
            />
          )}

          {/* Bottom by Throughput */}
          {chartData && totals && (
            <DonutChartWidget
              title="Bottom Categories by Throughput"
              data={chartData.bottomThroughput}
              unit="bps"
              icon={Gauge}
              centerValue={formatThroughput(totals.bottomThroughput)}
              centerLabel="THROUGHPUT"
              variant="bottom"
            />
          )}
        </div>
      </div>
    </div>
  );
}
