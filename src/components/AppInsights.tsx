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
  Play,
  Globe,
  Cloud,
  ShoppingCart,
  Gamepad2,
  MessageCircle,
  Search,
  Building2,
  FileText,
  Share2,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  DollarSign,
  Music,
  Camera,
  Mail,
  Database,
  Layers,
  Activity,
  Zap
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
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

// Color palette for charts - vibrant gradient-friendly colors
const CHART_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const name = category.toLowerCase();
  if (name.includes('stream')) return Play;
  if (name.includes('social')) return MessageCircle;
  if (name.includes('game')) return Gamepad2;
  if (name.includes('cloud') && name.includes('storage')) return Cloud;
  if (name.includes('cloud')) return Cloud;
  if (name.includes('web') && name.includes('content')) return Globe;
  if (name.includes('web') && name.includes('app')) return Globe;
  if (name.includes('search')) return Search;
  if (name.includes('commerce') || name.includes('shopping')) return ShoppingCart;
  if (name.includes('corporate')) return Building2;
  if (name.includes('storage')) return Database;
  if (name.includes('realtime') || name.includes('communication')) return MessageCircle;
  if (name.includes('software') || name.includes('update')) return FileText;
  if (name.includes('share') || name.includes('file')) return Share2;
  if (name.includes('security') || name.includes('certificate')) return Shield;
  if (name.includes('business') || name.includes('enterprise')) return Briefcase;
  if (name.includes('education')) return GraduationCap;
  if (name.includes('health')) return Heart;
  if (name.includes('travel')) return Plane;
  if (name.includes('finance')) return DollarSign;
  if (name.includes('music') || name.includes('audio')) return Music;
  if (name.includes('photo') || name.includes('video')) return Camera;
  if (name.includes('mail') || name.includes('email')) return Mail;
  if (name.includes('peer')) return Share2;
  if (name.includes('database')) return Database;
  if (name.includes('restrict')) return Shield;
  return Layers;
};

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
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name;
    let formattedValue = value;

    if (unit === 'bytes') {
      formattedValue = formatBytes(value);
    } else if (unit === 'bps') {
      formattedValue = formatThroughput(value);
    } else if (unit === 'users') {
      formattedValue = `${value} clients`;
    }

    const Icon = getCategoryIcon(name);

    return (
      <div className="bg-popover/95 backdrop-blur-sm border rounded-lg shadow-xl p-3 min-w-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" />
          <p className="font-medium text-sm">{name}</p>
        </div>
        <p className="text-lg font-bold">{formattedValue}</p>
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

  // Prepare chart data - filter out "UnknownApps" as it's not meaningful
  const chartData = useMemo(() => {
    if (!data) return null;

    const filterUnknown = (stats: AppGroupStat[]) =>
      stats.filter(item => !item.id?.toLowerCase().includes('unknown') && !item.name?.toLowerCase().includes('unknown'));

    return {
      topUsage: filterUnknown(data.topAppGroupsByUsage?.[0]?.distributionStats || []),
      topClientCount: filterUnknown(data.topAppGroupsByClientCountReport?.[0]?.distributionStats || []),
      topThroughput: filterUnknown(data.topAppGroupsByThroughputReport?.[0]?.distributionStats || []),
      bottomUsage: filterUnknown(data.worstAppGroupsByUsage?.[0]?.distributionStats || []),
      bottomClientCount: filterUnknown(data.worstAppGroupsByClientCountReport?.[0]?.distributionStats || []),
      bottomThroughput: filterUnknown(data.worstAppGroupsByThroughputReport?.[0]?.distributionStats || []),
    };
  }, [data]);

  // Calculate totals and summary stats
  const stats = useMemo(() => {
    if (!chartData) return null;

    const totalUsage = chartData.topUsage.reduce((sum, item) => sum + item.value, 0);
    const totalThroughput = chartData.topThroughput.reduce((sum, item) => sum + item.value, 0);
    const totalClients = chartData.topClientCount.reduce((sum, item) => sum + item.value, 0);
    const totalCategories = new Set([
      ...chartData.topUsage.map(i => i.id),
      ...chartData.bottomUsage.map(i => i.id)
    ]).size;

    return {
      totalUsage,
      totalThroughput,
      totalClients,
      totalCategories,
      topCategory: chartData.topUsage[0]?.name || 'N/A',
      topClientCount: chartData.topClientCount.reduce((sum, item) => sum + item.value, 0),
      bottomClientCount: chartData.bottomClientCount.reduce((sum, item) => sum + item.value, 0),
      bottomThroughput: chartData.bottomThroughput.reduce((sum, item) => sum + item.value, 0),
    };
  }, [chartData]);

  // Summary Card Component
  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    gradient: string;
  }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-lg ${gradient}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Horizontal Bar Chart Widget Component
  const HorizontalBarChartWidget = ({
    title,
    description,
    data,
    unit,
    icon: Icon,
    variant = 'top',
    accentColor
  }: {
    title: string;
    description: string;
    data: AppGroupStat[];
    unit: string;
    icon: any;
    variant?: 'top' | 'bottom';
    accentColor: string;
  }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${accentColor}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              {data.length} apps
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2.5">
            {data.slice(0, 8).map((item, index) => {
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              const CategoryIcon = getCategoryIcon(item.name);
              let displayValue = item.value.toString();

              if (unit === 'bytes') {
                displayValue = formatBytes(item.value);
              } else if (unit === 'bps') {
                displayValue = formatThroughput(item.value);
              }

              return (
                <div key={item.id} className="group">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium truncate flex-1" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold tabular-nums">{displayValue}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
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
    description,
    data,
    unit,
    icon: Icon,
    centerValue,
    centerLabel,
    accentColor
  }: {
    title: string;
    description: string;
    data: AppGroupStat[];
    unit: string;
    icon: any;
    centerValue: string;
    centerLabel: string;
    accentColor: string;
  }) => {
    return (
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${accentColor}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            {/* Donut Chart */}
            <div className="relative w-[140px] h-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {data.slice(0, 8).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip unit={unit} />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold leading-none">{centerValue}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{centerLabel}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1.5 min-w-0">
              {data.slice(0, 6).map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.name);
                return (
                  <div key={item.id} className="flex items-center gap-1.5 text-xs group cursor-default">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <CategoryIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate group-hover:text-primary transition-colors" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
              {data.length > 6 && (
                <p className="text-[10px] text-muted-foreground pl-3">
                  +{data.length - 6} more
                </p>
              )}
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
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px]" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-8">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Unable to Load Data</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <AppWindow className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">App Insights</h1>
            <p className="text-sm text-muted-foreground">
              Application visibility and traffic analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">Last 24 Hours</SelectItem>
              <SelectItem value="7D">Last 7 Days</SelectItem>
              <SelectItem value="14D">Last 14 Days</SelectItem>
              <SelectItem value="30D">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Data Usage"
            value={formatBytes(stats.totalUsage)}
            subtitle={`Across ${stats.totalCategories} categories`}
            icon={HardDrive}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <SummaryCard
            title="Avg Throughput"
            value={formatThroughput(stats.totalThroughput)}
            subtitle="Combined bandwidth"
            icon={Gauge}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <SummaryCard
            title="Active Clients"
            value={formatNumber(stats.totalClients)}
            subtitle="Using applications"
            icon={Users}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <SummaryCard
            title="Top Category"
            value={stats.topCategory}
            subtitle="Highest usage"
            icon={Zap}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>
      )}

      {/* Last updated */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3" />
        Last updated: {lastRefresh.toLocaleString()}
      </div>

      {/* Top Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Top Categories</h2>
            <p className="text-xs text-muted-foreground">Highest traffic application categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData && (
            <HorizontalBarChartWidget
              title="By Data Usage"
              description="Total bytes transferred"
              data={chartData.topUsage}
              unit="bytes"
              icon={HardDrive}
              variant="top"
              accentColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
          )}

          {chartData && stats && (
            <DonutChartWidget
              title="By Client Count"
              description="Number of active clients"
              data={chartData.topClientCount}
              unit="users"
              icon={Users}
              centerValue={formatNumber(stats.topClientCount)}
              centerLabel="clients"
              accentColor="bg-gradient-to-br from-violet-500 to-violet-600"
            />
          )}

          {chartData && stats && (
            <DonutChartWidget
              title="By Throughput"
              description="Average bandwidth consumption"
              data={chartData.topThroughput}
              unit="bps"
              icon={Gauge}
              centerValue={formatThroughput(stats.totalThroughput)}
              centerLabel="throughput"
              accentColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
          )}
        </div>
      </div>

      {/* Bottom Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bottom Categories</h2>
            <p className="text-xs text-muted-foreground">Lowest traffic application categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData && (
            <HorizontalBarChartWidget
              title="By Data Usage"
              description="Total bytes transferred"
              data={chartData.bottomUsage}
              unit="bytes"
              icon={HardDrive}
              variant="bottom"
              accentColor="bg-gradient-to-br from-amber-500 to-orange-500"
            />
          )}

          {chartData && stats && (
            <DonutChartWidget
              title="By Client Count"
              description="Number of active clients"
              data={chartData.bottomClientCount}
              unit="users"
              icon={Users}
              centerValue={formatNumber(stats.bottomClientCount)}
              centerLabel="clients"
              accentColor="bg-gradient-to-br from-rose-500 to-pink-500"
            />
          )}

          {chartData && stats && (
            <DonutChartWidget
              title="By Throughput"
              description="Average bandwidth consumption"
              data={chartData.bottomThroughput}
              unit="bps"
              icon={Gauge}
              centerValue={formatThroughput(stats.bottomThroughput)}
              centerLabel="throughput"
              accentColor="bg-gradient-to-br from-slate-500 to-slate-600"
            />
          )}
        </div>
      </div>
    </div>
  );
}
