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
import { Check, ChevronDown, Settings2 } from 'lucide-react';
import { cn } from './ui/utils';
import { useOperationalContext } from '../hooks/useOperationalContext';
import { 
  ENVIRONMENT_PROFILES, 
  type EnvironmentProfileType 
} from '../config/environmentProfiles';

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
      setEnvironmentProfile(profile);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn("gap-2 h-9", className)}
        >
          <span className="text-base">{currentProfile.icon}</span>
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
        
        {Object.values(ENVIRONMENT_PROFILES).map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => handleSelect(profile.id)}
            className="flex items-start gap-3 py-2 cursor-pointer"
          >
            <span className="text-xl mt-0.5">{profile.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{profile.name}</span>
                {ctx.environmentProfile.id === profile.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {profile.description}
              </p>
              {showThresholds && (
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
            </div>
          </DropdownMenuItem>
        ))}
        
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
  
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <span>{profile.icon}</span>
      <span>{profile.name}</span>
    </Badge>
  );
}
