import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Wifi, MapPin, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { WLANAssignmentService } from '../services/wlanAssignment';
import type { Site, Profile, AutoAssignmentResponse, WLANFormData } from '../types/network';

interface CreateWLANDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: AutoAssignmentResponse) => void;
}

export function CreateWLANDialog({ open, onOpenChange, onSuccess }: CreateWLANDialogProps) {
  // Form state
  const [formData, setFormData] = useState<WLANFormData>({
    ssid: '',
    security: 'wpa2-psk',
    passphrase: '',
    vlan: null,
    band: 'dual',
    enabled: true,
    selectedSites: []
  });

  // Sites data
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  // Profile preview
  const [profilePreview, setProfilePreview] = useState<Profile[]>([]);
  const [discoveringProfiles, setDiscoveringProfiles] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Load sites when dialog opens
  useEffect(() => {
    if (open) {
      loadSites();
      // Reset form
      setFormData({
        ssid: '',
        security: 'wpa2-psk',
        passphrase: '',
        vlan: null,
        band: 'dual',
        enabled: true,
        selectedSites: []
      });
      setProfilePreview([]);
    }
  }, [open]);

  // Preview profiles when sites change
  useEffect(() => {
    if (formData.selectedSites.length > 0) {
      previewProfiles();
    } else {
      setProfilePreview([]);
    }
  }, [formData.selectedSites]);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const data = await apiService.getSites();
      setSites(data);
    } catch (error) {
      console.error('Failed to load sites:', error);
      toast.error('Failed to load sites');
    } finally {
      setLoadingSites(false);
    }
  };

  const previewProfiles = async () => {
    setDiscoveringProfiles(true);
    try {
      const assignmentService = new WLANAssignmentService();
      const profiles = await assignmentService.previewProfilesForSites(formData.selectedSites);
      setProfilePreview(profiles);
      console.log(`Discovered ${profiles.length} profiles for selected sites`);
    } catch (error) {
      console.error('Failed to discover profiles:', error);
      toast.error('Failed to discover profiles');
      setProfilePreview([]);
    } finally {
      setDiscoveringProfiles(false);
    }
  };

  const toggleSite = (siteId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSites: prev.selectedSites.includes(siteId)
        ? prev.selectedSites.filter(id => id !== siteId)
        : [...prev.selectedSites, siteId]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.ssid.trim()) {
      toast.error('SSID is required');
      return;
    }

    if (formData.security !== 'open' && !formData.passphrase.trim()) {
      toast.error('Passphrase is required for secured networks');
      return;
    }

    if (formData.selectedSites.length === 0) {
      toast.error('Please select at least one site');
      return;
    }

    setSubmitting(true);
    try {
      const assignmentService = new WLANAssignmentService();
      const result = await assignmentService.createWLANWithAutoAssignment({
        name: formData.ssid,
        ssid: formData.ssid,
        security: formData.security,
        passphrase: formData.passphrase || undefined,
        vlan: formData.vlan || undefined,
        band: formData.band,
        enabled: formData.enabled,
        sites: formData.selectedSites
      });

      onSuccess(result);
      onOpenChange(false);

    } catch (error) {
      console.error('Failed to create WLAN:', error);
      toast.error('Failed to create WLAN', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = formData.ssid.trim() &&
    (formData.security === 'open' || formData.passphrase.trim()) &&
    formData.selectedSites.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Create Wireless Network
          </DialogTitle>
          <DialogDescription>
            Configure a new WLAN and automatically assign it to selected sites
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* WLAN Configuration Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Network Configuration</h3>

            <div className="grid gap-4">
              {/* SSID */}
              <div className="space-y-2">
                <Label htmlFor="ssid">SSID *</Label>
                <Input
                  id="ssid"
                  value={formData.ssid}
                  onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                  placeholder="MyNetwork"
                />
              </div>

              {/* Security Type */}
              <div className="space-y-2">
                <Label htmlFor="security">Security *</Label>
                <Select
                  value={formData.security}
                  onValueChange={(value: any) => setFormData({ ...formData, security: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open (No Security)</SelectItem>
                    <SelectItem value="wpa2-psk">WPA2-PSK</SelectItem>
                    <SelectItem value="wpa3-sae">WPA3-SAE</SelectItem>
                    <SelectItem value="wpa2-enterprise">WPA2-Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Passphrase (conditional) */}
              {formData.security !== 'open' && (
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase *</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={formData.passphrase}
                    onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                    placeholder="Enter passphrase"
                  />
                </div>
              )}

              {/* Band */}
              <div className="space-y-2">
                <Label htmlFor="band">Band *</Label>
                <Select
                  value={formData.band}
                  onValueChange={(value: any) => setFormData({ ...formData, band: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.4GHz">2.4 GHz</SelectItem>
                    <SelectItem value="5GHz">5 GHz</SelectItem>
                    <SelectItem value="dual">Dual Band (2.4 + 5 GHz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* VLAN */}
              <div className="space-y-2">
                <Label htmlFor="vlan">VLAN ID (Optional)</Label>
                <Input
                  id="vlan"
                  type="number"
                  value={formData.vlan || ''}
                  onChange={(e) => setFormData({ ...formData, vlan: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="100"
                  min="1"
                  max="4094"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Site Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Site Assignment *</h3>
              {discoveringProfiles && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Discovering profiles...
                </Badge>
              )}
            </div>

            {/* Site Selection */}
            <div className="space-y-2">
              <Label>Select Sites</Label>
              {loadingSites ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : sites.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No sites available
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {sites.map(site => (
                    <div
                      key={site.id}
                      className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer"
                      onClick={() => toggleSite(site.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSites.includes(site.id)}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{site.name || site.siteName || site.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Preview */}
            {formData.selectedSites.length > 0 && (
              <Card className="bg-secondary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignment Preview
                  </CardTitle>
                  <CardDescription className="text-xs">
                    This WLAN will be assigned to the following profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {discoveringProfiles ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : profilePreview.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No profiles found in selected sites
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {profilePreview.length} Profile{profilePreview.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                        {profilePreview.map(profile => (
                          <div key={profile.id} className="text-sm flex items-center gap-2 py-1">
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span>{profile.name || profile.profileName || profile.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting || discoveringProfiles}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create & Assign WLAN
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
