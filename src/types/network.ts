// Network/WLAN type definitions for automatic profile assignment

export interface Service {
  id: string;
  name?: string;
  serviceName?: string;
  ssid: string;
  security: 'open' | 'wpa2-psk' | 'wpa3-sae' | 'wpa2-enterprise';
  passphrase?: string;
  vlan?: number;
  band: '2.4GHz' | '5GHz' | 'dual';
  enabled: boolean;
  sites?: string[]; // Site IDs this service is assigned to
  profiles?: string[]; // Profile IDs this service is assigned to
  description?: string;
  hidden?: boolean;
  maxClients?: number;
}

export interface Site {
  id: string;
  name: string;
  siteName?: string;
  location?: string;
  country?: string;
  timezone?: string;
  description?: string;
  deviceGroups?: string[]; // May be inline or require separate fetch
  status?: string;
}

export interface DeviceGroup {
  id: string;
  name: string;
  siteId: string;
  siteName?: string;
  deviceCount?: number;
  profiles?: string[]; // Profile IDs assigned to this group
  apSerialNumbers?: string[];
  description?: string;
}

export interface Profile {
  id: string;
  name: string;
  profileName?: string;
  deviceGroupId?: string;
  services?: string[]; // Service IDs assigned to this profile
  syncStatus?: 'synced' | 'pending' | 'error';
  lastSync?: string;
  enabled?: boolean;
  description?: string;
}

export interface CreateServiceRequest {
  name: string;
  ssid: string;
  security: string;
  passphrase?: string;
  vlan?: number;
  band: string;
  enabled: boolean;
  sites: string[]; // Sites to assign to
  description?: string;
}

export interface AutoAssignmentResponse {
  serviceId: string;
  sitesProcessed: number;
  deviceGroupsFound: number;
  profilesAssigned: number;
  assignments: AssignmentResult[];
  syncResults?: SyncResult[];
  success: boolean;
  errors?: string[];
}

export interface AssignmentResult {
  profileId: string;
  profileName: string;
  success: boolean;
  error?: string;
}

export interface SyncResult {
  profileId: string;
  profileName: string;
  success: boolean;
  error?: string;
  syncTime?: string;
}

// Form data for WLAN creation dialog
export interface WLANFormData {
  ssid: string;
  security: 'open' | 'wpa2-psk' | 'wpa3-sae' | 'wpa2-enterprise';
  passphrase: string;
  vlan: number | null;
  band: '2.4GHz' | '5GHz' | 'dual';
  enabled: boolean;
  selectedSites: string[];
}
