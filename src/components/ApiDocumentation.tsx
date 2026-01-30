import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Server,
  Wifi,
  Users,
  Building2,
  Shield,
  Network,
  HardDrive,
  Activity,
  Settings,
  FileText,
  Key,
  MapPin,
  Radio,
  Globe,
  Cpu,
  Database,
  Lock,
  UserPlus,
  Gauge,
  Package
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: string[];
}

interface ApiCategory {
  name: string;
  icon: any;
  description: string;
  endpoints: ApiEndpoint[];
}

const apiCategories: ApiCategory[] = [
  {
    name: 'Authentication',
    icon: Key,
    description: 'User authentication and session management',
    endpoints: [
      { method: 'POST', path: '/management/v1/oauth2/token', description: 'Login and obtain access token' },
      { method: 'POST', path: '/management/v1/oauth2/revoke', description: 'Logout and revoke token' },
      { method: 'GET', path: '/management/v1/oauth2/validate', description: 'Validate current session' },
    ]
  },
  {
    name: 'Sites',
    icon: Building2,
    description: 'Site configuration and management',
    endpoints: [
      { method: 'GET', path: '/v1/sites', description: 'Get all sites' },
      { method: 'GET', path: '/v1/sites/{siteId}', description: 'Get site by ID', parameters: ['siteId'] },
      { method: 'PUT', path: '/v1/sites/{siteId}', description: 'Update site configuration', parameters: ['siteId'] },
      { method: 'DELETE', path: '/v1/sites/{siteId}', description: 'Delete site', parameters: ['siteId'] },
      { method: 'GET', path: '/v1/state/sites', description: 'Get site states' },
      { method: 'GET', path: '/v1/report/sites', description: 'Get site reports' },
      { method: 'GET', path: '/v1/report/sites/{siteId}', description: 'Get specific site report', parameters: ['siteId'] },
      { method: 'GET', path: '/v1/report/sites/{siteId}/smartrf', description: 'Get site SmartRF data', parameters: ['siteId'] },
    ]
  },
  {
    name: 'Access Points',
    icon: Wifi,
    description: 'Access point management and monitoring',
    endpoints: [
      { method: 'GET', path: '/v1/aps', description: 'Get all access points' },
      { method: 'POST', path: '/v1/aps/query', description: 'Query access points with filters' },
      { method: 'GET', path: '/v1/aps/query/columns', description: 'Get available query columns' },
      { method: 'GET', path: '/v1/aps/query/visualize', description: 'Get AP visualization data' },
      { method: 'GET', path: '/v1/aps/{serialNumber}', description: 'Get AP details', parameters: ['serialNumber'] },
      { method: 'PUT', path: '/v1/aps/{serialNumber}', description: 'Update AP configuration', parameters: ['serialNumber'] },
      { method: 'DELETE', path: '/v1/aps/{serialNumber}', description: 'Delete access point', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/aps/{serialNumber}/stations', description: 'Get AP connected stations', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/aps/{serialNumber}/lldp', description: 'Get AP LLDP neighbors', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/aps/ifstats', description: 'Get AP interface statistics (bulk)' },
      { method: 'GET', path: '/v1/aps/ifstats/{serialNumber}', description: 'Get AP interface statistics', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/state/aps', description: 'Get AP states' },
      { method: 'GET', path: '/v1/aps/displaynames', description: 'Get AP display names' },
      { method: 'GET', path: '/v1/aps/swversion', description: 'Get AP software versions' },
      { method: 'GET', path: '/v1/aps/list', description: 'Get AP list summary' },
      { method: 'POST', path: '/v1/aps/{serialNumber}/reboot', description: 'Reboot access point', parameters: ['serialNumber'] },
      { method: 'POST', path: '/v1/aps/{serialNumber}/reset', description: 'Factory reset access point', parameters: ['serialNumber'] },
      { method: 'POST', path: '/v1/aps/{serialNumber}/upgrade', description: 'Upgrade AP firmware', parameters: ['serialNumber'] },
      { method: 'PUT', path: '/v1/aps/{serialNumber}/site', description: 'Change AP site assignment', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/aps/upgradeimagelist', description: 'Get available upgrade images' },
      { method: 'GET', path: '/v1/aps/upgradeschedule', description: 'Get upgrade schedules' },
      { method: 'GET', path: '/v1/aps/adoptionrules', description: 'Get AP adoption rules' },
      { method: 'GET', path: '/v1/report/aps/{serialNumber}', description: 'Get AP report', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/report/aps/{serialNumber}/smartrf', description: 'Get AP SmartRF data', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/ap/environment/{serialNumber}', description: 'Get AP environment data', parameters: ['serialNumber'] },
    ]
  },
  {
    name: 'Stations / Clients',
    icon: Users,
    description: 'Connected client management',
    endpoints: [
      { method: 'GET', path: '/v1/stations', description: 'Get all connected stations' },
      { method: 'POST', path: '/v1/stations/query', description: 'Query stations with filters' },
      { method: 'GET', path: '/v1/stations/query/columns', description: 'Get available query columns' },
      { method: 'GET', path: '/v1/stations/{macAddress}', description: 'Get station details', parameters: ['macAddress'] },
      { method: 'GET', path: '/v1/stations/{macAddress}/history', description: 'Get station history', parameters: ['macAddress'] },
      { method: 'GET', path: '/v1/stations/{macAddress}/location', description: 'Get station location', parameters: ['macAddress'] },
      { method: 'GET', path: '/v1/stations/events/{macAddress}', description: 'Get station events', parameters: ['macAddress'] },
      { method: 'POST', path: '/v1/stations/{macAddress}/deauth', description: 'Deauthenticate station', parameters: ['macAddress'] },
      { method: 'POST', path: '/v1/stations/{macAddress}/block', description: 'Block station', parameters: ['macAddress'] },
      { method: 'DELETE', path: '/v1/stations/{macAddress}/block', description: 'Unblock station', parameters: ['macAddress'] },
      { method: 'POST', path: '/v1/stations/{macAddress}/bandwidth/limit', description: 'Set bandwidth limit', parameters: ['macAddress'] },
      { method: 'POST', path: '/v1/stations/disassociate', description: 'Disassociate multiple stations' },
      { method: 'POST', path: '/v1/stations/reauthenticate', description: 'Reauthenticate multiple stations' },
      { method: 'DELETE', path: '/v1/stations', description: 'Delete station records' },
      { method: 'GET', path: '/v1/stations/blocked', description: 'Get blocked stations list' },
      { method: 'POST', path: '/v1/stations/allowlist', description: 'Add to allow list' },
      { method: 'POST', path: '/v1/stations/denylist', description: 'Add to deny list' },
      { method: 'GET', path: '/v1/report/stations/{macAddress}', description: 'Get station report', parameters: ['macAddress'] },
    ]
  },
  {
    name: 'Services / Networks',
    icon: Network,
    description: 'Wireless network services (SSIDs)',
    endpoints: [
      { method: 'GET', path: '/v1/services', description: 'Get all services' },
      { method: 'POST', path: '/v1/services', description: 'Create new service' },
      { method: 'GET', path: '/v1/services/{serviceId}', description: 'Get service details', parameters: ['serviceId'] },
      { method: 'PUT', path: '/v1/services/{serviceId}', description: 'Update service', parameters: ['serviceId'] },
      { method: 'DELETE', path: '/v1/services/{serviceId}', description: 'Delete service', parameters: ['serviceId'] },
      { method: 'GET', path: '/v1/services/{serviceId}/stations', description: 'Get service stations', parameters: ['serviceId'] },
      { method: 'GET', path: '/v1/report/services/{serviceId}', description: 'Get service report', parameters: ['serviceId'] },
    ]
  },
  {
    name: 'Roles',
    icon: Shield,
    description: 'User role management and policies',
    endpoints: [
      { method: 'GET', path: '/v1/roles', description: 'Get all roles' },
      { method: 'POST', path: '/v1/roles', description: 'Create new role' },
      { method: 'GET', path: '/v1/roles/{roleId}', description: 'Get role details', parameters: ['roleId'] },
      { method: 'PUT', path: '/v1/roles/{roleId}', description: 'Update role', parameters: ['roleId'] },
      { method: 'DELETE', path: '/v1/roles/{roleId}', description: 'Delete role', parameters: ['roleId'] },
      { method: 'GET', path: '/v1/report/roles/{roleId}', description: 'Get role report', parameters: ['roleId'] },
    ]
  },
  {
    name: 'Switches',
    icon: Server,
    description: 'Network switch management',
    endpoints: [
      { method: 'GET', path: '/v1/switches', description: 'Get all switches' },
      { method: 'GET', path: '/v1/switches/{serialNumber}', description: 'Get switch details', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/switches/{serialNumber}/ports', description: 'Get switch ports', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/switches/{serialNumber}/poe', description: 'Get switch PoE status', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/switches/displaynames', description: 'Get switch display names' },
      { method: 'GET', path: '/v1/switches/list', description: 'Get switch list summary' },
      { method: 'GET', path: '/v1/report/switches/{serialNumber}', description: 'Get switch report', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/report/switches/{serialNumber}/ports', description: 'Get switch ports report', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/report/ports/{portId}', description: 'Get port report', parameters: ['portId'] },
    ]
  },
  {
    name: 'Profiles',
    icon: Settings,
    description: 'Configuration profiles',
    endpoints: [
      { method: 'GET', path: '/v1/profiles', description: 'Get all profiles' },
      { method: 'GET', path: '/v1/profiles/{profileId}', description: 'Get profile details', parameters: ['profileId'] },
      { method: 'GET', path: '/v1/profiles/rf-management', description: 'Get RF management profiles' },
      { method: 'GET', path: '/v1/profiles/iot', description: 'Get IoT profiles' },
      { method: 'GET', path: '/v1/profiles/adsp', description: 'Get ADSP profiles' },
      { method: 'GET', path: '/v1/profiles/analytics', description: 'Get analytics profiles' },
      { method: 'GET', path: '/v1/profiles/positioning', description: 'Get positioning profiles' },
      { method: 'GET', path: '/v1/profiles/switch-port', description: 'Get switch port profiles' },
      { method: 'GET', path: '/v1/devicegroups', description: 'Get device groups' },
      { method: 'GET', path: '/v1/devicegroups/{siteId}', description: 'Get device groups by site', parameters: ['siteId'] },
    ]
  },
  {
    name: 'Reports & Analytics',
    icon: Activity,
    description: 'Reporting and analytics data',
    endpoints: [
      { method: 'GET', path: '/v1/report/flex/{duration}', description: 'Get flexible duration report', parameters: ['duration'] },
      { method: 'GET', path: '/v1/reports/templates', description: 'Get report templates' },
      { method: 'GET', path: '/v1/reports/scheduled', description: 'Get scheduled reports' },
      { method: 'GET', path: '/v1/reports/generated', description: 'Get generated reports' },
      { method: 'GET', path: '/v1/reports/widgets', description: 'Get report widgets' },
      { method: 'GET', path: '/v1/state/entityDistribution', description: 'Get entity distribution' },
      { method: 'GET', path: '/v1/analytics/wireless/interference', description: 'Get RF interference analytics' },
      { method: 'GET', path: '/v1/analytics/wireless/coverage', description: 'Get coverage analytics' },
      { method: 'GET', path: '/v1/analytics/clients/roaming', description: 'Get client roaming analytics' },
    ]
  },
  {
    name: 'Radio & RF',
    icon: Radio,
    description: 'Radio and RF management',
    endpoints: [
      { method: 'GET', path: '/v1/radios/channels', description: 'Get radio channels' },
      { method: 'GET', path: '/v1/radios/modes', description: 'Get radio modes' },
      { method: 'GET', path: '/v1/rtlsprofile', description: 'Get RTLS profiles' },
      { method: 'GET', path: '/v1/dpisignatures', description: 'Get DPI signatures' },
      { method: 'GET', path: '/v1/ratelimiters', description: 'Get rate limiters' },
      { method: 'GET', path: '/v1/cos', description: 'Get Class of Service profiles' },
    ]
  },
  {
    name: 'Security',
    icon: Lock,
    description: 'Security and threat management',
    endpoints: [
      { method: 'POST', path: '/v1/security/rogue-ap/detect', description: 'Trigger rogue AP detection' },
      { method: 'GET', path: '/v1/security/rogue-ap/list', description: 'Get detected rogue APs' },
      { method: 'POST', path: '/v1/security/rogue-ap/{mac}/classify', description: 'Classify rogue AP', parameters: ['mac'] },
      { method: 'GET', path: '/v1/security/threats', description: 'Get security threats' },
      { method: 'POST', path: '/v1/security/wids/enable', description: 'Enable WIDS' },
      { method: 'GET', path: '/v1/aaapolicy', description: 'Get AAA policies' },
      { method: 'GET', path: '/v1/accesscontrol', description: 'Get access control rules' },
    ]
  },
  {
    name: 'Guest Management',
    icon: UserPlus,
    description: 'Guest access and captive portal',
    endpoints: [
      { method: 'GET', path: '/v1/guests', description: 'Get all guests' },
      { method: 'POST', path: '/v1/guests/create', description: 'Create guest account' },
      { method: 'DELETE', path: '/v1/guests/{id}', description: 'Delete guest', parameters: ['id'] },
      { method: 'POST', path: '/v1/guests/{id}/voucher', description: 'Generate guest voucher', parameters: ['id'] },
      { method: 'GET', path: '/v1/guests/portal/config', description: 'Get portal configuration' },
      { method: 'POST', path: '/v1/guests/portal/customize', description: 'Customize guest portal' },
      { method: 'GET', path: '/v1/eguest', description: 'Get eGuest configuration' },
    ]
  },
  {
    name: 'Location Services',
    icon: MapPin,
    description: 'Location tracking and analytics',
    endpoints: [
      { method: 'POST', path: '/v1/location/zone/create', description: 'Create location zone' },
      { method: 'GET', path: '/v1/location/zone/list', description: 'Get location zones' },
      { method: 'POST', path: '/v1/location/presence/notify', description: 'Send presence notification' },
      { method: 'GET', path: '/v1/location/analytics/dwell', description: 'Get dwell time analytics' },
      { method: 'GET', path: '/v1/location/analytics/traffic', description: 'Get traffic analytics' },
      { method: 'GET', path: '/v1/report/location/aps/{serialNumber}', description: 'Get AP location report', parameters: ['serialNumber'] },
      { method: 'GET', path: '/v1/report/location/floor/{floorId}', description: 'Get floor location report', parameters: ['floorId'] },
      { method: 'GET', path: '/v1/report/location/stations/{stationId}', description: 'Get station location report', parameters: ['stationId'] },
    ]
  },
  {
    name: 'QoS',
    icon: Gauge,
    description: 'Quality of Service management',
    endpoints: [
      { method: 'POST', path: '/v1/qos/policy/create', description: 'Create QoS policy' },
      { method: 'GET', path: '/v1/qos/statistics', description: 'Get QoS statistics' },
      { method: 'POST', path: '/v1/qos/bandwidth/allocate', description: 'Allocate bandwidth' },
      { method: 'GET', path: '/v1/qos/dscp/mappings', description: 'Get DSCP mappings' },
    ]
  },
  {
    name: 'Events & Alarms',
    icon: Activity,
    description: 'System events and alarms',
    endpoints: [
      { method: 'GET', path: '/v1/events', description: 'Get system events' },
      { method: 'GET', path: '/v1/alarms', description: 'Get all alarms' },
      { method: 'GET', path: '/v1/alarms/active', description: 'Get active alarms' },
      { method: 'POST', path: '/v1/alarms/{id}/acknowledge', description: 'Acknowledge alarm', parameters: ['id'] },
      { method: 'POST', path: '/v1/alarms/{id}/clear', description: 'Clear alarm', parameters: ['id'] },
      { method: 'GET', path: '/v1/auditlogs', description: 'Get audit logs' },
    ]
  },
  {
    name: 'Platform Manager',
    icon: Cpu,
    description: 'OS ONE system management',
    endpoints: [
      { method: 'GET', path: '/platformmanager/v1/reports/systeminformation', description: 'Get system information' },
      { method: 'GET', path: '/platformmanager/v1/reports/manufacturinginformation', description: 'Get manufacturing information' },
      { method: 'GET', path: '/platformmanager/v1/configuration/backups', description: 'Get configuration backups' },
      { method: 'POST', path: '/platformmanager/v1/configuration/backup', description: 'Create configuration backup' },
      { method: 'POST', path: '/platformmanager/v1/configuration/restore', description: 'Restore configuration' },
      { method: 'GET', path: '/platformmanager/v1/configuration/download/{filename}', description: 'Download backup file', parameters: ['filename'] },
      { method: 'GET', path: '/platformmanager/v1/license/info', description: 'Get license information' },
      { method: 'GET', path: '/platformmanager/v1/license/usage', description: 'Get license usage' },
      { method: 'POST', path: '/platformmanager/v1/license/install', description: 'Install license' },
      { method: 'GET', path: '/platformmanager/v1/flash/files', description: 'Get flash files' },
      { method: 'GET', path: '/platformmanager/v1/flash/usage', description: 'Get flash usage' },
      { method: 'DELETE', path: '/platformmanager/v1/flash/files/{filename}', description: 'Delete flash file', parameters: ['filename'] },
      { method: 'POST', path: '/platformmanager/v1/network/ping', description: 'Network ping test' },
      { method: 'POST', path: '/platformmanager/v1/network/traceroute', description: 'Network traceroute' },
      { method: 'POST', path: '/platformmanager/v1/network/dns', description: 'DNS lookup' },
    ]
  },
  {
    name: 'Packet Capture',
    icon: Database,
    description: 'Network packet capture',
    endpoints: [
      { method: 'POST', path: '/platformmanager/v1/startappacketcapture', description: 'Start AP packet capture' },
      { method: 'PUT', path: '/platformmanager/v1/stopappacketcapture', description: 'Stop AP packet capture' },
      { method: 'GET', path: '/v1/packetcapture/active', description: 'Get active captures' },
      { method: 'GET', path: '/v1/packetcapture/files', description: 'Get capture files' },
      { method: 'GET', path: '/v1/packetcapture/download/{id}', description: 'Download capture file', parameters: ['id'] },
      { method: 'DELETE', path: '/v1/packetcapture/delete/{id}', description: 'Delete capture file', parameters: ['id'] },
      { method: 'GET', path: '/v1/packetcapture/status/{id}', description: 'Get capture status', parameters: ['id'] },
    ]
  },
  {
    name: 'Applications',
    icon: Package,
    description: 'Container and application management',
    endpoints: [
      { method: 'GET', path: '/appsmanager/v1/applications', description: 'Get installed applications' },
      { method: 'POST', path: '/appsmanager/v1/applications/install', description: 'Install application' },
      { method: 'GET', path: '/appsmanager/v1/containers', description: 'Get running containers' },
      { method: 'POST', path: '/appsmanager/v1/containers/create', description: 'Create container' },
      { method: 'GET', path: '/appsmanager/v1/storage', description: 'Get storage info' },
      { method: 'GET', path: '/appsmanager/v1/images', description: 'Get container images' },
    ]
  },
  {
    name: 'AFC (6 GHz)',
    icon: Globe,
    description: 'Automated Frequency Coordination',
    endpoints: [
      { method: 'GET', path: '/v1/afc/plans', description: 'Get AFC plans' },
      { method: 'POST', path: '/v1/afc/plans', description: 'Create AFC plan' },
      { method: 'POST', path: '/v1/afc/plans/{id}/analyze', description: 'Analyze AFC plan', parameters: ['id'] },
      { method: 'DELETE', path: '/v1/afc/plans/{id}', description: 'Delete AFC plan', parameters: ['id'] },
    ]
  },
  {
    name: 'System',
    icon: Settings,
    description: 'System configuration',
    endpoints: [
      { method: 'GET', path: '/v1/system/config', description: 'Get system configuration' },
      { method: 'GET', path: '/v1/version', description: 'Get API version' },
      { method: 'GET', path: '/v1/cluster/status', description: 'Get cluster status' },
      { method: 'GET', path: '/v1/globalsettings', description: 'Get global settings' },
      { method: 'GET', path: '/v1/snmp', description: 'Get SNMP configuration' },
      { method: 'GET', path: '/v1/nsightconfig', description: 'Get NSight configuration' },
      { method: 'GET', path: '/v1/bestpractices/evaluate', description: 'Evaluate best practices' },
      { method: 'GET', path: '/v1/workflow', description: 'Get workflow configuration' },
      { method: 'GET', path: '/v1/administrators', description: 'Get administrators' },
      { method: 'GET', path: '/v1/appkeys', description: 'Get API keys' },
      { method: 'GET', path: '/v1/devices/types', description: 'Get device types' },
      { method: 'GET', path: '/v1/deviceimages/{hwType}', description: 'Get device images', parameters: ['hwType'] },
    ]
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

interface ApiDocumentationProps {
  onClose?: () => void;
}

export function ApiDocumentation({ onClose }: ApiDocumentationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Authentication']));
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return apiCategories;

    const query = searchQuery.toLowerCase();
    return apiCategories
      .map(category => ({
        ...category,
        endpoints: category.endpoints.filter(
          endpoint =>
            endpoint.path.toLowerCase().includes(query) ||
            endpoint.description.toLowerCase().includes(query) ||
            endpoint.method.toLowerCase().includes(query)
        )
      }))
      .filter(category =>
        category.endpoints.length > 0 ||
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
      );
  }, [searchQuery]);

  const totalEndpoints = useMemo(() =>
    apiCategories.reduce((sum, cat) => sum + cat.endpoints.length, 0),
    []
  );

  const toggleCategory = (name: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(apiCategories.map(c => c.name)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const copyToClipboard = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Documentation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Campus Controller REST API • {apiCategories.length} categories • {totalEndpoints} endpoints
            </p>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Search and controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints, methods, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-5xl mx-auto">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCategories.has(category.name);

            return (
              <Card key={category.name} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.name)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {category.name}
                              <Badge variant="secondary" className="font-normal">
                                {category.endpoints.length}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <Separator />
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {category.endpoints.map((endpoint, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors group"
                          >
                            <Badge
                              variant="outline"
                              className={`w-16 justify-center font-mono text-xs ${methodColors[endpoint.method]}`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="flex-1 text-sm font-mono text-foreground/90">
                              {endpoint.path}
                            </code>
                            <span className="text-sm text-muted-foreground hidden md:block flex-shrink-0 max-w-xs truncate">
                              {endpoint.description}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(endpoint.path)}
                            >
                              {copiedPath === endpoint.path ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No endpoints found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiDocumentation;
