import { apiService } from './api';
import type {
  CreateServiceRequest,
  AutoAssignmentResponse,
  AssignmentResult,
  SyncResult,
  DeviceGroup,
  Profile
} from '../types/network';

/**
 * Service for orchestrating automatic WLAN-to-Profile assignment
 *
 * Workflow:
 * 1. Create WLAN/Service
 * 2. Discover device groups for selected sites
 * 3. Discover profiles for those device groups
 * 4. Assign WLAN to each profile
 * 5. Trigger profile synchronization
 */
export class WLANAssignmentService {
  /**
   * Main workflow: Create WLAN and auto-assign to profiles
   */
  async createWLANWithAutoAssignment(
    serviceData: CreateServiceRequest,
    options: {
      dryRun?: boolean; // Preview without committing
      skipSync?: boolean; // Skip profile sync step
    } = {}
  ): Promise<AutoAssignmentResponse> {
    console.log('[WLANAssignment] Starting auto-assignment workflow', { serviceData, options });

    try {
      // Step 1: Create the WLAN/Service
      console.log('[WLANAssignment] Step 1: Creating service...');
      const service = await apiService.createService({
        name: serviceData.name,
        ssid: serviceData.ssid,
        security: serviceData.security,
        passphrase: serviceData.passphrase,
        vlan: serviceData.vlan,
        band: serviceData.band,
        enabled: serviceData.enabled,
      });

      console.log('[WLANAssignment] Service created:', service.id);

      // Step 2: Discover profiles for selected sites
      console.log('[WLANAssignment] Step 2: Discovering profiles for sites:', serviceData.sites);
      const profileMap = await this.discoverProfilesForSites(serviceData.sites);

      const allProfiles = Object.values(profileMap).flat();
      const uniqueProfiles = this.deduplicateProfiles(allProfiles);

      console.log('[WLANAssignment] Discovered profiles:', {
        totalProfiles: allProfiles.length,
        uniqueProfiles: uniqueProfiles.length,
        deviceGroupsFound: Object.keys(profileMap).length
      });

      if (options.dryRun) {
        console.log('[WLANAssignment] Dry run mode - skipping assignment and sync');
        return {
          serviceId: service.id,
          sitesProcessed: serviceData.sites.length,
          deviceGroupsFound: Object.keys(profileMap).length,
          profilesAssigned: 0,
          assignments: uniqueProfiles.map(p => ({
            profileId: p.id,
            profileName: p.name || p.profileName || p.id,
            success: true,
            error: 'Dry run - not executed'
          })),
          success: true
        };
      }

      // Step 3: Assign service to each profile
      console.log('[WLANAssignment] Step 3: Assigning service to profiles...');
      const assignments = await this.assignToProfiles(service.id, uniqueProfiles);

      const successfulAssignments = assignments.filter(a => a.success);
      const failedAssignments = assignments.filter(a => !a.success);

      console.log('[WLANAssignment] Assignment results:', {
        successful: successfulAssignments.length,
        failed: failedAssignments.length
      });

      // Step 4: Trigger profile synchronization
      let syncResults: SyncResult[] | undefined;
      if (!options.skipSync && successfulAssignments.length > 0) {
        console.log('[WLANAssignment] Step 4: Triggering profile sync...');
        syncResults = await this.syncProfiles(
          successfulAssignments.map(a => a.profileId)
        );
        console.log('[WLANAssignment] Sync completed');
      }

      const response: AutoAssignmentResponse = {
        serviceId: service.id,
        sitesProcessed: serviceData.sites.length,
        deviceGroupsFound: Object.keys(profileMap).length,
        profilesAssigned: successfulAssignments.length,
        assignments,
        syncResults,
        success: failedAssignments.length === 0,
        errors: failedAssignments.length > 0
          ? [`${failedAssignments.length} profile(s) failed to assign`]
          : undefined
      };

      console.log('[WLANAssignment] Workflow completed:', response);
      return response;

    } catch (error) {
      console.error('[WLANAssignment] Workflow failed:', error);
      throw error;
    }
  }

  /**
   * Discover all profiles within the selected sites
   */
  async discoverProfilesForSites(
    siteIds: string[]
  ): Promise<Record<string, Profile[]>> {
    const profileMap: Record<string, Profile[]> = {};

    for (const siteId of siteIds) {
      try {
        console.log(`[WLANAssignment] Fetching device groups for site: ${siteId}`);

        // Fetch device groups for this site
        const deviceGroups: DeviceGroup[] = await apiService.getDeviceGroupsBySite(siteId);

        console.log(`[WLANAssignment] Found ${deviceGroups.length} device groups for site ${siteId}`);

        // Fetch profiles for each device group
        const profiles: Profile[] = [];
        for (const group of deviceGroups) {
          try {
            console.log(`[WLANAssignment] Fetching profiles for device group: ${group.id}`);
            const groupProfiles: Profile[] = await apiService.getProfilesByDeviceGroup(group.id);

            // Add device group info to each profile for reference
            const enrichedProfiles = groupProfiles.map(p => ({
              ...p,
              deviceGroupId: group.id,
              siteName: siteId
            }));

            profiles.push(...enrichedProfiles);
            console.log(`[WLANAssignment] Found ${groupProfiles.length} profiles in group ${group.id}`);
          } catch (error) {
            console.warn(`[WLANAssignment] Error fetching profiles for device group ${group.id}:`, error);
          }
        }

        profileMap[siteId] = profiles;
      } catch (error) {
        console.error(`[WLANAssignment] Error discovering profiles for site ${siteId}:`, error);
        profileMap[siteId] = [];
      }
    }

    return profileMap;
  }

  /**
   * Deduplicate profiles (same profile might be in multiple sites)
   */
  private deduplicateProfiles(profiles: Profile[]): Profile[] {
    const seen = new Map<string, Profile>();

    for (const profile of profiles) {
      if (!seen.has(profile.id)) {
        seen.set(profile.id, profile);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Assign service to all profiles
   */
  private async assignToProfiles(
    serviceId: string,
    profiles: Profile[]
  ): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];

    // Process assignments in parallel (but limit concurrency to avoid overwhelming the API)
    const batchSize = 5;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (profile) => {
          try {
            await apiService.assignServiceToProfile(serviceId, profile.id);
            return {
              profileId: profile.id,
              profileName: profile.name || profile.profileName || profile.id,
              success: true
            };
          } catch (error) {
            return {
              profileId: profile.id,
              profileName: profile.name || profile.profileName || profile.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Trigger profile synchronization
   */
  private async syncProfiles(profileIds: string[]): Promise<SyncResult[]> {
    try {
      // Try batch sync first
      await apiService.syncMultipleProfiles(profileIds);

      // If batch sync succeeds, return success for all
      return profileIds.map(id => ({
        profileId: id,
        profileName: id,
        success: true,
        syncTime: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('[WLANAssignment] Batch sync failed, falling back to individual syncs');

      // Fall back to individual syncs
      return Promise.all(
        profileIds.map(async (profileId) => {
          try {
            await apiService.syncProfile(profileId);
            return {
              profileId,
              profileName: profileId,
              success: true,
              syncTime: new Date().toISOString()
            };
          } catch (err) {
            return {
              profileId,
              profileName: profileId,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        })
      );
    }
  }

  /**
   * Preview profiles that would be assigned (for UI preview)
   */
  async previewProfilesForSites(siteIds: string[]): Promise<Profile[]> {
    const profileMap = await this.discoverProfilesForSites(siteIds);
    const allProfiles = Object.values(profileMap).flat();
    return this.deduplicateProfiles(allProfiles);
  }
}

// Export singleton instance
export const wlanAssignmentService = new WLANAssignmentService();
