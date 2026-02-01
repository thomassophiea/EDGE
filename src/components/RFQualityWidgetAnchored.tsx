/**
 * RF Quality Widget (Anchored)
 * 
 * RFQI is the anchor metric for Contextual Insights.
 * Always visible, displays both point-in-time and time series.
 * Exposes contributing factors: interference, channel utilization, noise floor, retry rate.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  RefreshCw, Radio, AlertTriangle, 
  Activity, Zap, Volume2, 
  RotateCcw, Lock, Unlock
} from 'lucide-react';
import { apiService } from '../services/api';
import { useOperationalContext } from '../hooks/useOperationalContext';
import { 
  getEnvironmentProfile, 
  evaluateMetric,
  type EnvironmentProfileType 
} from '../config/environmentProfiles';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine, Area, AreaChart 
} from 'recharts';

interface RFQIComputed {
  rfqi: number;
  channelUtilization: number | null;
  interference: number | null;
  noiseFloorDbm: number | null;
  retryRate: number | null;
  source: 'native' | 'computed' | 'fallback';
  timestamp: number;
}

interface TimeSeriesPoint {
  timestamp: number;
  time: string;
  rfqi: number;
  channelUtilization?: number;
  interference?: number;
}

export function RFQualityWidgetAnchored() {
  const { ctx, setTimeCursor, setTimeCursorFromHover } = useOperationalContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<RFQIComputed | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const profile = getEnvironmentProfile(ctx.environmentProfile.id as EnvironmentProfileType);

  const effectiveSiteId = useMemo(() => {
    if (ctx.siteId) return ctx.siteId;
    return null;
  }, [ctx.siteId]);

  const getDuration = (timeRange: string): string => {
    const map: Record<string, string> = {
      '15m': '15M', '1h': '1H', '3h': '3H', '24h': '24H', '7d': '7D', '30d': '30D'
    };
    return map[timeRange] || '24H';
  };

  useEffect(() => {
    loadRFQIData();
    const interval = setInterval(() => loadRFQIData(true), 300000);
    return () => clearInterval(interval);
  }, [effectiveSiteId, ctx.timeRange]);

  const loadRFQIData = async (isRefresh = false) => {
    if (!effectiveSiteId) {
      setLoading(false);
      setError('Select a site to view RF Quality metrics');
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const duration = getDuration(ctx.timeRange);
      const rfData = await apiService.fetchRFQualityData(effectiveSiteId, duration);

      let computed: RFQIComputed;
      let series: TimeSeriesPoint[] = [];

      if (rfData && Array.isArray(rfData) && rfData.length > 0) {
        const report = rfData[0];
        const stats = report?.statistics || [];
        
        const rfqiStat = stats.find((s: { statName?: string }) => 
          s.statName?.toLowerCase().includes('rfqi') || 
          s.statName?.toLowerCase().includes('rf quality')
        );

        if (rfqiStat?.values?.length > 0) {
          series = rfqiStat.values.map((v: { timestamp: number; value: string }) => ({
            timestamp: v.timestamp,
            time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rfqi: parseFloat(v.value) || 0
          })).sort((a: TimeSeriesPoint, b: TimeSeriesPoint) => a.timestamp - b.timestamp);

          const latest = series[series.length - 1];
          computed = {
            rfqi: latest?.rfqi || 0,
            channelUtilization: null,
            interference: null,
            noiseFloorDbm: null,
            retryRate: null,
            source: 'native',
            timestamp: latest?.timestamp || Date.now()
          };

          stats.forEach((stat: { statName?: string; values?: { value: string }[] }) => {
            const name = stat.statName?.toLowerCase() || '';
            const latestVal = stat.values?.[stat.values.length - 1]?.value;
            
            if (name.includes('channel') && name.includes('util')) {
              computed.channelUtilization = parseFloat(latestVal || '') || null;
            }
            if (name.includes('interference')) {
              computed.interference = parseFloat(latestVal || '') || null;
            }
            if (name.includes('noise')) {
              computed.noiseFloorDbm = parseFloat(latestVal || '') || null;
            }
            if (name.includes('retry')) {
              computed.retryRate = parseFloat(latestVal || '') || null;
            }
          });
        } else {
          computed = await computeFallbackRFQI(effectiveSiteId);
        }
      } else if (rfData?.score !== undefined) {
        computed = {
          rfqi: rfData.score,
          channelUtilization: rfData.channelUtilization ? rfData.channelUtilization * 100 : null,
          interference: rfData.interference ? rfData.interference * 100 : null,
          noiseFloorDbm: null,
          retryRate: null,
          source: 'native',
          timestamp: Date.now()
        };
      } else {
        computed = await computeFallbackRFQI(effectiveSiteId);
      }

      setCurrentMetrics(computed);
      setTimeSeries(series);
      setLastUpdate(new Date());

    } catch (err) {
      console.error('[RFQualityWidgetAnchored] Error:', err);
      setError('Failed to load RF Quality data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const computeFallbackRFQI = async (siteId: string): Promise<RFQIComputed> => {
    try {
      const widgetData = await apiService.fetchWidgetData(siteId, [
        'channelUtilization2_4', 
        'channelUtilization5'
      ], getDuration(ctx.timeRange));

      let chanUtil24 = 0;
      let chanUtil5 = 0;

      if (widgetData?.channelUtilization2_4?.[0]?.statistics?.[0]?.values) {
        const vals = widgetData.channelUtilization2_4[0].statistics[0].values;
        chanUtil24 = parseFloat(vals[vals.length - 1]?.value) || 0;
      }
      if (widgetData?.channelUtilization5?.[0]?.statistics?.[0]?.values) {
        const vals = widgetData.channelUtilization5[0].statistics[0].values;
        chanUtil5 = parseFloat(vals[vals.length - 1]?.value) || 0;
      }

      const avgChanUtil = (chanUtil24 + chanUtil5) / 2;
      const utilPenalty = avgChanUtil * 0.5;
      const computedRfqi = Math.max(0, Math.min(100, 100 - utilPenalty));

      return {
        rfqi: computedRfqi,
        channelUtilization: avgChanUtil,
        interference: null,
        noiseFloorDbm: null,
        retryRate: null,
        source: 'computed',
        timestamp: Date.now()
      };
    } catch {
      return {
        rfqi: 75,
        channelUtilization: null,
        interference: null,
        noiseFloorDbm: null,
        retryRate: null,
        source: 'fallback',
        timestamp: Date.now()
      };
    }
  };

  const valueAtCursor = useMemo(() => {
    if (!ctx.timeCursor || timeSeries.length === 0) return null;
    
    let closest = timeSeries[0];
    let minDiff = Math.abs(timeSeries[0].timestamp - ctx.timeCursor);
    
    for (const point of timeSeries) {
      const diff = Math.abs(point.timestamp - ctx.timeCursor);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    
    return closest;
  }, [ctx.timeCursor, timeSeries]);

  const getScoreColor = (score: number): string => {
    const evaluation = evaluateMetric(profile, 'rfqi', score);
    if (evaluation === 'good') return 'text-green-600';
    if (evaluation === 'warning') return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const evaluation = evaluateMetric(profile, 'rfqi', score);
    if (evaluation === 'good') return { label: 'Healthy', variant: 'default' };
    if (evaluation === 'warning') return { label: 'Warning', variant: 'secondary' };
    return { label: 'Poor', variant: 'destructive' };
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-500/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-purple-500 animate-pulse" />
            <CardTitle className="text-base">RF Quality Index (RFQI)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const displayValue = valueAtCursor?.rfqi ?? currentMetrics?.rfqi ?? 0;
  const status = getScoreStatus(displayValue);

  return (
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">RF Quality Index (RFQI)</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    {currentMetrics?.source || 'unknown'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data source: {currentMetrics?.source === 'native' ? 'Platform API' : 
                    currentMetrics?.source === 'computed' ? 'Computed from metrics' : 'Estimated'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{profile.name}</span>
            <Button 
              onClick={() => loadRFQIData(true)} 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {error && (
          <Alert className="mt-2 py-2 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-600">{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className={`text-4xl font-bold ${getScoreColor(displayValue)}`}>
                {displayValue.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {ctx.timeCursor ? 'At cursor' : 'Current'}
              </p>
            </div>
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
          </div>
          
          {ctx.timeCursor && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {ctx.cursorLocked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
              <span>{new Date(ctx.timeCursor).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {currentMetrics && (
          <div className="grid grid-cols-2 gap-3">
            {currentMetrics.channelUtilization !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Activity className="h-3 w-3" />
                  <span>Channel Util.</span>
                </div>
                <p className="text-lg font-semibold">{currentMetrics.channelUtilization.toFixed(0)}%</p>
              </div>
            )}
            {currentMetrics.interference !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Zap className="h-3 w-3" />
                  <span>Interference</span>
                </div>
                <p className="text-lg font-semibold">{currentMetrics.interference.toFixed(0)}%</p>
              </div>
            )}
            {currentMetrics.noiseFloorDbm !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Volume2 className="h-3 w-3" />
                  <span>Noise Floor</span>
                </div>
                <p className="text-lg font-semibold">{currentMetrics.noiseFloorDbm} dBm</p>
              </div>
            )}
            {currentMetrics.retryRate !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry Rate</span>
                </div>
                <p className="text-lg font-semibold">{currentMetrics.retryRate.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}

        {timeSeries.length > 0 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={timeSeries}
                onMouseMove={(e) => {
                  const payload = e?.activePayload?.[0]?.payload as TimeSeriesPoint | undefined;
                  if (payload?.timestamp) {
                    setTimeCursorFromHover(payload.timestamp);
                  }
                }}
                onClick={(e) => {
                  const payload = e?.activePayload?.[0]?.payload as TimeSeriesPoint | undefined;
                  if (payload?.timestamp) {
                    setTimeCursor(payload.timestamp);
                  }
                }}
              >
                <defs>
                  <linearGradient id="rfqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'RFQI']}
                />
                <ReferenceLine 
                  y={profile.thresholds.rfqiTarget} 
                  stroke="#22c55e" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5}
                />
                <ReferenceLine 
                  y={profile.thresholds.rfqiPoor} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5}
                />
                {ctx.timeCursor && (
                  <ReferenceLine 
                    x={timeSeries.find(p => Math.abs(p.timestamp - ctx.timeCursor!) < 60000)?.time}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="rfqi" 
                  stroke="#8b5cf6" 
                  fill="url(#rfqiGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {lastUpdate && (
          <p className="text-xs text-muted-foreground text-right">
            Updated {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
