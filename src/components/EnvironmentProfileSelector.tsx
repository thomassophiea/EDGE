/**
 * Environment Profile Selector
 * 
 * Dropdown to select the environment profile that tunes what is considered "abnormal"
 * for RF quality and network metrics.
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { 
  Check, ChevronDown, Settings2, Store, Warehouse, Package, 
  Building2, GraduationCap, Settings, Sparkles, type LucideIcon 
} from 'lucide-react';
import { cn } from './ui/utils';
import { useOperationalContext } from '../hooks/useOperationalContext';
import { 
  ENVIRONMENT_PROFILES, 
  type EnvironmentProfileType 
} from '../config/environmentProfiles';

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Store,
  Warehouse,
  Package,
  Building2,
  GraduationCap,
  Settings
};

interface EnvironmentProfileSelectorProps {
  className?: string;
  showThresholds?: boolean;
}

export function EnvironmentProfileSelector({ 
  className,
  showThresholds = false
}: EnvironmentProfileSelectorProps) {
  const { ctx, setEnvironmentProfile } = useOperationalContext();
  const [open, setOpen] = useState(false);
  
  const currentProfile = ENVIRONMENT_PROFILES[ctx.environmentProfile.id] || ENVIRONMENT_PROFILES.CAMPUS;
  
  const handleSelect = (profileId: EnvironmentProfileType) => {
    const profile = ENVIRONMENT_PROFILES[profileId];
    if (profile) {
      // Convert from environmentProfiles.ts format to useOperationalContext format
      setEnvironmentProfile({
        id: profile.id,
        rfqiTarget: profile.thresholds.rfqiTarget,
        channelUtilizationPct: profile.thresholds.channelUtilizationPct,
        noiseFloorDbm: profile.thresholds.noiseFloorDbm,
        clientDensity: profile.thresholds.clientDensity,
        latencyP95Ms: profile.thresholds.latencyP95Ms,
        retryRatePct: profile.thresholds.retryRatePct,
      });
    }
    setOpen(false);
  };

  const CurrentIcon = iconMap[currentProfile.icon] || Settings;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn("gap-2 h-9", className)}
        >
          <CurrentIcon className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline">{currentProfile.name}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="font-medium">Environment Profile</span>
            <span className="text-xs text-muted-foreground">
              Tunes what is considered abnormal
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.values(ENVIRONMENT_PROFILES).map((profile) => {
          const ProfileIcon = iconMap[profile.icon] || Settings;
          const isAI = profile.id === 'AI_BASELINE';
          return (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleSelect(profile.id)}
              className={cn(
                "flex items-start gap-3 py-2 cursor-pointer",
                isAI && "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20"
              )}
            >
              <ProfileIcon className={cn(
                "h-5 w-5 mt-0.5",
                isAI ? "text-purple-500" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{profile.name}</span>
                  {isAI && (
                    <Badge className="text-[10px] px-1.5 h-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Auto
                    </Badge>
                  )}
                  {ctx.environmentProfile.id === profile.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {profile.description}
                </p>
                {showThresholds && !isAI && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      RFQI ≥{profile.thresholds.rfqiTarget}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      Ch.Util ≤{profile.thresholds.channelUtilizationPct}%
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      Retry ≤{profile.thresholds.retryRatePct}%
                    </Badge>
                  </div>
                )}
                {isAI && (
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-purple-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Thresholds adapt to your network</span>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="text-sm">Customize thresholds...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact badge showing current profile
 */
export function EnvironmentProfileBadge({ className }: { className?: string }) {
  const { ctx } = useOperationalContext();
  const profile = ENVIRONMENT_PROFILES[ctx.environmentProfile.id] || ENVIRONMENT_PROFILES.CAMPUS;
  const ProfileIcon = iconMap[profile.icon] || Settings;
  
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <ProfileIcon className="h-3 w-3" />
      <span>{profile.name}</span>
    </Badge>
  );
}
