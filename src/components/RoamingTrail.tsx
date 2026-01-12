import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  MapPin,
  Radio,
  Clock,
  ArrowRight,
  Wifi,
  Activity,
  ChevronDown
} from 'lucide-react';
import { StationEvent } from '../services/api';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface RoamingTrailProps {
  events: StationEvent[];
  macAddress: string;
}

interface RoamingEvent {
  timestamp: number;
  eventType: string;
  apName: string;
  apSerial: string;
  ssid: string;
  details: string;
  cause?: string;
  reason?: string;
  signalStrength?: string;
  duration?: number;
}

export function RoamingTrail({ events, macAddress }: RoamingTrailProps) {
  // Process and filter roaming events
  const roamingEvents = useMemo(() => {
    const roamingTypes = ['Roam', 'Registration', 'De-registration', 'Associate', 'Disassociate', 'State Change'];
    const filtered = events
      .filter(event => roamingTypes.includes(event.eventType))
      .map(event => {
        const parseDetails = (details: string) => {
          const parsed: Record<string, string> = {};
          const regex = /(\w+)\[([^\]]+)\]/g;
          let match;
          while ((match = regex.exec(details)) !== null) {
            parsed[match[1]] = match[2];
          }
          return parsed;
        };

        const parsedDetails = event.details ? parseDetails(event.details) : {};

        return {
          timestamp: parseInt(event.timestamp),
          eventType: event.eventType,
          apName: event.apName || 'Unknown AP',
          apSerial: event.apSerial || 'N/A',
          ssid: event.ssid || 'N/A',
          details: event.details || '',
          cause: parsedDetails.Cause,
          reason: parsedDetails.Reason,
          signalStrength: parsedDetails.Signal || parsedDetails.RSS,
          duration: 0
        } as RoamingEvent;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < filtered.length - 1; i++) {
      filtered[i].duration = filtered[i + 1].timestamp - filtered[i].timestamp;
    }

    return filtered;
  }, [events]);

  // Group consecutive events at the same AP
  const groupedEvents = useMemo(() => {
    const groups: Array<{
      apName: string;
      apSerial: string;
      ssid: string;
      events: RoamingEvent[];
      startTime: number;
      endTime: number;
      duration: number;
    }> = [];

    let currentGroup: RoamingEvent[] = [];
    let currentAP = '';

    roamingEvents.forEach((event, index) => {
      if (event.apName !== currentAP && currentGroup.length > 0) {
        const startTime = currentGroup[0].timestamp;
        const endTime = currentGroup[currentGroup.length - 1].timestamp;
        groups.push({
          apName: currentAP,
          apSerial: currentGroup[0].apSerial,
          ssid: currentGroup[0].ssid,
          events: currentGroup,
          startTime,
          endTime,
          duration: endTime - startTime
        });
        currentGroup = [];
      }

      currentAP = event.apName;
      currentGroup.push(event);

      if (index === roamingEvents.length - 1 && currentGroup.length > 0) {
        const startTime = currentGroup[0].timestamp;
        const endTime = currentGroup[currentGroup.length - 1].timestamp;
        groups.push({
          apName: currentAP,
          apSerial: currentGroup[0].apSerial,
          ssid: currentGroup[0].ssid,
          events: currentGroup,
          startTime,
          endTime,
          duration: endTime - startTime
        });
      }
    });

    return groups;
  }, [roamingEvents]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (roamingEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground font-medium mb-2">No roaming events found</p>
        <p className="text-sm text-muted-foreground">
          This client hasn't roamed between access points yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{groupedEvents.length}</div>
              <div className="text-sm text-muted-foreground">Access Points</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{roamingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {groupedEvents.length > 1 ? groupedEvents.length - 1 : 0}
              </div>
              <div className="text-sm text-muted-foreground">Roams</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Roaming Timeline */}
      <ScrollArea className="w-full">
        <div className="flex items-start gap-4 pb-4 min-w-max">
          {groupedEvents.map((group, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === groupedEvents.length - 1;
            const nextGroup = groupedEvents[idx + 1];

            return (
              <div key={idx} className="flex items-center">
                {/* AP Card */}
                <Card className={`
                  w-80 border-2
                  ${isFirst ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                    isLast ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
                    'border-purple-500 bg-purple-50 dark:bg-purple-950'}
                `}>
                  <CardContent className="pt-4 pb-4">
                    {/* AP Icon and Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${isFirst ? 'bg-green-500' :
                          isLast ? 'bg-blue-500' :
                          'bg-purple-500'}
                      `}>
                        <Radio className="h-6 w-6 text-white" />
                      </div>
                      {isFirst && (
                        <Badge className="bg-green-500">Start</Badge>
                      )}
                      {isLast && (
                        <Badge className="bg-blue-500">Current</Badge>
                      )}
                    </div>

                    {/* AP Name & SSID */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base truncate">{group.apName}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wifi className="h-3 w-3" />
                        <span className="truncate">{group.ssid}</span>
                      </div>
                    </div>

                    {/* Duration Box */}
                    <div className="bg-background/50 rounded p-2 mb-3 text-center">
                      <div className="text-lg font-bold">
                        {formatDuration(group.duration)}
                      </div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Arrived:</span>
                        <span className="font-medium text-xs">{formatTime(group.startTime)}</span>
                      </div>
                      {!isLast && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Left:</span>
                          <span className="font-medium text-xs">{formatTime(group.endTime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Events Collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
                        <ChevronDown className="h-3 w-3" />
                        {group.events.length} Events
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-1">
                        {group.events.map((event, eventIdx) => (
                          <div key={eventIdx} className="flex flex-col gap-1 text-xs bg-background/30 rounded p-1.5">
                            <Badge
                              variant={
                                event.eventType === 'Registration' || event.eventType === 'Associate' ? 'default' :
                                event.eventType === 'De-registration' || event.eventType === 'Disassociate' ? 'destructive' :
                                'secondary'
                              }
                              className="text-xs w-fit"
                            >
                              {event.eventType}
                            </Badge>
                            {event.cause && (
                              <span className="text-muted-foreground">
                                Cause: <span className="font-medium">{event.cause}</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* AP Serial */}
                    <div className="text-xs text-muted-foreground mt-3 pt-2 border-t truncate">
                      Serial: <span className="font-mono">{group.apSerial}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow to Next AP */}
                {!isLast && nextGroup && (
                  <div className="flex flex-col items-center mx-2">
                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Roam</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
