/**
 * AI Insights Service
 * 
 * AI ranks, correlates, and explains. It does not invent.
 * Insights are derived from existing events, RF telemetry, client performance, and network utilization.
 */

import { ENVIRONMENT_PROFILES, type EnvironmentProfile, evaluateMetric } from '../config/environmentProfiles';

export type InsightScope = 'NETWORK' | 'SITE' | 'AP' | 'CLIENT';
export type InsightSeverity = 'critical' | 'warning' | 'info';
export type InsightCategory = 
  | 'rf_quality' 
  | 'interference' 
  | 'channel_utilization' 
  | 'client_performance'
  | 'connectivity'
  | 'capacity'
  | 'anomaly';

export interface InsightEvidence {
  label: string;
  timestamp?: number;  // epoch ms - clicking should set cursor to this
  metric?: string;
  value?: number | string;
  unit?: string;
  source?: string;     // e.g., 'rfQuality API', 'client stats'
}

export interface InsightCard {
  id: string;
  title: string;              // "What happened"
  whyItMatters: string;       // Why it matters in this environment
  evidence: InsightEvidence[];
  recommendedAction: string;  // Non-destructive action
  
  // Categorization
  category: InsightCategory;
  severity: InsightSeverity;
  scope: InsightScope;
  
  // Ranking inputs (0-1)
  impact: number;
  confidence: number;
  recurrence: number;
  
  // Computed
  rankScore: number;
  
  // Metadata
  createdAt: number;
  expiresAt?: number;
}

// Ranking weights
const RANKING_WEIGHTS = {
  impact: 0.4,
  confidence: 0.25,
  recurrence: 0.15,
  scope: 0.2
};

// Scope weights (higher = more important)
const SCOPE_WEIGHTS: Record<InsightScope, number> = {
  NETWORK: 1.0,
  SITE: 0.75,
  AP: 0.5,
  CLIENT: 0.25
};

/**
 * Calculate rank score for an insight
 */
export function calculateRankScore(insight: Omit<InsightCard, 'rankScore'>): number {
  const scopeWeight = SCOPE_WEIGHTS[insight.scope] || 0.5;
  
  return (
    RANKING_WEIGHTS.impact * insight.impact +
    RANKING_WEIGHTS.confidence * insight.confidence +
    RANKING_WEIGHTS.recurrence * insight.recurrence +
    RANKING_WEIGHTS.scope * scopeWeight
  );
}

/**
 * Generate insights from current metrics
 */
export interface MetricsSnapshot {
  rfqi?: number;
  channelUtilization?: number;
  interference?: number;
  noiseFloorDbm?: number;
  retryRate?: number;
  clientCount?: number;
  apCount?: number;
  apOnlineCount?: number;
  throughputBps?: number;
  avgRssi?: number;
  avgSnr?: number;
  latencyMs?: number;
  timestamp?: number;
}

export function generateInsights(
  metrics: MetricsSnapshot,
  profile: EnvironmentProfile,
  existingEvents?: Array<{ type: string; timestamp: number; message: string }>
): InsightCard[] {
  const insights: InsightCard[] = [];
  const now = Date.now();
  const thresholds = profile.thresholds;
  
  // 1. RFQI Degradation
  if (metrics.rfqi !== undefined && metrics.rfqi < thresholds.rfqiPoor) {
    const severity: InsightSeverity = metrics.rfqi < thresholds.rfqiPoor * 0.7 ? 'critical' : 'warning';
    insights.push({
      id: `rfqi-low-${now}`,
      title: 'RF Quality Below Threshold',
      whyItMatters: `In a ${profile.name} environment, RF quality below ${thresholds.rfqiPoor}% impacts client connectivity and user experience.`,
      evidence: [
        { label: 'Current RFQI', value: metrics.rfqi, unit: '%', metric: 'rfqi', timestamp: metrics.timestamp },
        { label: 'Target', value: thresholds.rfqiTarget, unit: '%' },
        { label: 'Profile', value: profile.name }
      ],
      recommendedAction: 'Review RF environment for interference sources. Consider channel optimization or AP power adjustments.',
      category: 'rf_quality',
      severity,
      scope: 'SITE',
      impact: 1 - (metrics.rfqi / 100),
      confidence: 0.9,
      recurrence: 0.5,
      rankScore: 0,
      createdAt: now
    });
  }
  
  // 2. High Channel Utilization
  if (metrics.channelUtilization !== undefined && metrics.channelUtilization > thresholds.channelUtilizationPct) {
    insights.push({
      id: `channel-util-high-${now}`,
      title: 'High Channel Utilization Detected',
      whyItMatters: `Channel utilization above ${thresholds.channelUtilizationPct}% in ${profile.name} environments can cause client contention and reduced throughput.`,
      evidence: [
        { label: 'Channel Utilization', value: metrics.channelUtilization, unit: '%', metric: 'channelUtilization', timestamp: metrics.timestamp },
        { label: 'Threshold', value: thresholds.channelUtilizationPct, unit: '%' }
      ],
      recommendedAction: 'Consider load balancing clients across APs or adding capacity in high-density areas.',
      category: 'channel_utilization',
      severity: 'warning',
      scope: 'SITE',
      impact: (metrics.channelUtilization - thresholds.channelUtilizationPct) / (100 - thresholds.channelUtilizationPct),
      confidence: 0.85,
      recurrence: 0.6,
      rankScore: 0,
      createdAt: now
    });
  }
  
  // 3. High Interference
  if (metrics.interference !== undefined && metrics.interference > thresholds.interferenceHigh) {
    insights.push({
      id: `interference-high-${now}`,
      title: 'RF Interference Elevated',
      whyItMatters: `Interference above ${(thresholds.interferenceHigh * 100).toFixed(0)}% degrades signal quality and increases retries in ${profile.name} deployments.`,
      evidence: [
        { label: 'Interference Level', value: `${(metrics.interference * 100).toFixed(1)}%`, metric: 'interference', timestamp: metrics.timestamp },
        { label: 'Threshold', value: `${(thresholds.interferenceHigh * 100).toFixed(0)}%` }
      ],
      recommendedAction: 'Identify interference sources (microwaves, Bluetooth, neighboring networks). Consider dynamic channel selection.',
      category: 'interference',
      severity: 'warning',
      scope: 'SITE',
      impact: Math.min(1, (metrics.interference - thresholds.interferenceHigh) / 0.3),
      confidence: 0.8,
      recurrence: 0.4,
      rankScore: 0,
      createdAt: now
    });
  }
  
  // 4. High Retry Rate
  if (metrics.retryRate !== undefined && metrics.retryRate > thresholds.retryRatePct) {
    insights.push({
      id: `retry-rate-high-${now}`,
      title: 'Elevated Wireless Retry Rate',
      whyItMatters: `Retry rates above ${thresholds.retryRatePct}% indicate RF issues or interference affecting ${profile.name} operations.`,
      evidence: [
        { label: 'Retry Rate', value: metrics.retryRate, unit: '%', metric: 'retryRate', timestamp: metrics.timestamp },
        { label: 'Acceptable Limit', value: thresholds.retryRatePct, unit: '%' }
      ],
      recommendedAction: 'Check for co-channel interference, adjust AP transmit power, or relocate affected clients.',
      category: 'rf_quality',
      severity: 'warning',
      scope: 'AP',
      impact: Math.min(1, (metrics.retryRate - thresholds.retryRatePct) / 20),
      confidence: 0.75,
      recurrence: 0.5,
      rankScore: 0,
      createdAt: now
    });
  }
  
  // 5. AP Connectivity Issues
  if (metrics.apCount !== undefined && metrics.apOnlineCount !== undefined) {
    const offlineCount = metrics.apCount - metrics.apOnlineCount;
    const offlinePercent = (offlineCount / metrics.apCount) * 100;
    
    if (offlineCount > 0 && offlinePercent > 5) {
      insights.push({
        id: `ap-offline-${now}`,
        title: `${offlineCount} Access Points Offline`,
        whyItMatters: `${offlinePercent.toFixed(0)}% of APs offline creates coverage gaps in ${profile.name} deployment.`,
        evidence: [
          { label: 'Offline APs', value: offlineCount },
          { label: 'Total APs', value: metrics.apCount },
          { label: 'Online', value: metrics.apOnlineCount }
        ],
        recommendedAction: 'Check network connectivity to offline APs. Verify power and physical connections.',
        category: 'connectivity',
        severity: offlinePercent > 20 ? 'critical' : 'warning',
        scope: 'SITE',
        impact: Math.min(1, offlinePercent / 30),
        confidence: 1.0,
        recurrence: 0.3,
        rankScore: 0,
        createdAt: now
      });
    }
  }
  
  // 6. Client Density Warning
  if (metrics.clientCount !== undefined && metrics.apOnlineCount !== undefined && metrics.apOnlineCount > 0) {
    const clientsPerAP = metrics.clientCount / metrics.apOnlineCount;
    if (clientsPerAP > thresholds.clientDensity * 1.2) {
      insights.push({
        id: `client-density-${now}`,
        title: 'High Client Density Per AP',
        whyItMatters: `${clientsPerAP.toFixed(0)} clients per AP exceeds ${profile.name} capacity planning threshold of ${thresholds.clientDensity}.`,
        evidence: [
          { label: 'Clients/AP', value: clientsPerAP.toFixed(1) },
          { label: 'Total Clients', value: metrics.clientCount },
          { label: 'Online APs', value: metrics.apOnlineCount }
        ],
        recommendedAction: 'Consider adding access points to high-density areas or enabling band steering.',
        category: 'capacity',
        severity: 'info',
        scope: 'SITE',
        impact: Math.min(1, (clientsPerAP - thresholds.clientDensity) / thresholds.clientDensity),
        confidence: 0.9,
        recurrence: 0.7,
        rankScore: 0,
        createdAt: now
      });
    }
  }
  
  // 7. Poor Client Signal Quality
  if (metrics.avgRssi !== undefined && metrics.avgRssi < -75) {
    insights.push({
      id: `rssi-low-${now}`,
      title: 'Clients Experiencing Weak Signal',
      whyItMatters: `Average RSSI of ${metrics.avgRssi} dBm is below -75 dBm threshold for reliable connectivity.`,
      evidence: [
        { label: 'Average RSSI', value: metrics.avgRssi, unit: 'dBm', metric: 'rssi', timestamp: metrics.timestamp },
        { label: 'Recommended', value: '-65 to -70', unit: 'dBm' }
      ],
      recommendedAction: 'Review AP placement. Clients may be too far from access points or experiencing physical obstructions.',
      category: 'client_performance',
      severity: metrics.avgRssi < -80 ? 'warning' : 'info',
      scope: 'CLIENT',
      impact: Math.min(1, (-75 - metrics.avgRssi) / 15),
      confidence: 0.7,
      recurrence: 0.6,
      rankScore: 0,
      createdAt: now
    });
  }
  
  // Calculate rank scores
  insights.forEach(insight => {
    insight.rankScore = calculateRankScore(insight);
  });
  
  // Sort by rank score descending
  return insights.sort((a, b) => b.rankScore - a.rankScore);
}

/**
 * Get insights summary for display
 */
export function getInsightsSummary(insights: InsightCard[]): {
  total: number;
  critical: number;
  warning: number;
  info: number;
  topInsight: InsightCard | null;
} {
  return {
    total: insights.length,
    critical: insights.filter(i => i.severity === 'critical').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    info: insights.filter(i => i.severity === 'info').length,
    topInsight: insights[0] || null
  };
}
