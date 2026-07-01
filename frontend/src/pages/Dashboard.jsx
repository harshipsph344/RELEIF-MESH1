import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resourceAPI, helpRequestAPI, shelterAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/Map';
import ResourceForm from '@/components/ResourceForm';
import HelpRequestForm from '@/components/HelpRequestForm';
import ShelterForm from '@/components/ShelterForm';
import { LogOut, RefreshCw, Filter, MapPin, Shield, CheckCircle, Home, Box, AlertCircle, FileText, Bell, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resources, setResources] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [filteredHelpRequests, setFilteredHelpRequests] = useState([]);
  const [filteredShelters, setFilteredShelters] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Navigation + Tab state — sidebar clicks drive the tab view
  const [activeNav, setActiveNav] = useState('Workspace');
  const [activeTab, setActiveTab] = useState('resources');
  const tabsSectionRef = useRef(null);

  const navToTab = { 'Resources': 'resources', 'Help Requests': 'help', 'Shelters': 'shelters' };

  const handleNavClick = (label) => {
    setActiveNav(label);
    if (navToTab[label]) {
      setActiveTab(navToTab[label]);
      // Small timeout lets React re-render the tab before scrolling
      setTimeout(() => {
        tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Filter states
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [helpTypeFilter, setHelpTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [radiusFilter, setRadiusFilter] = useState('all');

  // Fetch all data
  const fetchData = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const params = userLocation ? {
        user_lat: userLocation.latitude,
        user_lon: userLocation.longitude,
        ...(radiusFilter && radiusFilter !== 'all' && { radius: radiusFilter })
      } : {};

      const [resourcesRes, helpRequestsRes, sheltersRes] = await Promise.all([
        resourceAPI.getAll(params),
        helpRequestAPI.getAll(params),
        shelterAPI.getAll(params)
      ]);

      setResources(resourcesRes.data.resources);
      setHelpRequests(helpRequestsRes.data.help_requests);
      setShelters(sheltersRes.data.shelters);

      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "All information has been updated.",
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: error.response?.data?.error || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setUserLocation({ latitude: 28.6139, longitude: 77.2090 });
        }
      );
    } else {
      setUserLocation({ latitude: 28.6139, longitude: 77.2090 });
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (userLocation) {
      fetchData();
    }
  }, [userLocation]);

  // Auto-refresh polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [userLocation, radiusFilter]);

  // Apply filters
  useEffect(() => {
    let filtered = [...resources];
    if (resourceTypeFilter && resourceTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.resource_type === resourceTypeFilter);
    }
    setFilteredResources(filtered);
  }, [resources, resourceTypeFilter]);

  useEffect(() => {
    let filtered = [...helpRequests];
    if (helpTypeFilter && helpTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.help_type === helpTypeFilter);
    }
    if (urgencyFilter && urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }
    setFilteredHelpRequests(filtered);
  }, [helpRequests, helpTypeFilter, urgencyFilter]);

  useEffect(() => {
    setFilteredShelters([...shelters]);
  }, [shelters]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDataUpdate = () => {
    fetchData(false);
  };

  const getMapCenter = () => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return [28.6139, 77.2090];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Count metrics for Meta Cards
  const totalHelpRequests = helpRequests.length;
  const criticalRequests = helpRequests.filter(r => r.urgency === 'critical').length;
  const openShelters = shelters.filter(s => s.operational_status === 'open').length;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--color-bg-app)' }}>
      {/* 
        ========================================
        TOPBAR (full width, white, h-14)
        ========================================
      */}
      <header className="h-14 bg-white flex items-center justify-between px-4 z-10 shrink-0" style={{ boxShadow: '0 1px 0 var(--color-border)' }}>
        {/* Left - Logo */}
        <div className="flex items-center gap-2 lg:w-60">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--color-primary)' }}>
            RM
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>ReliefMesh</span>
        </div>

        {/* Center - Breadcrumb (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 items-center px-6">
          <div className="flex items-center space-x-2 text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>Dashboard</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Operations</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Crisis Feed</span>
          </div>
        </div>

        {/* Right - Action Chips */}
        <div className="flex items-center gap-3">
          {user?.is_admin && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 h-8 hidden sm:flex"
              onClick={() => navigate('/admin')}
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Admin</span>
            </Button>
          )}

          <button className="flex items-center justify-center w-8 h-8 rounded-full border bg-white relative hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>3</span>
          </button>

          <button className="flex items-center justify-center w-8 h-8 rounded-full border bg-white relative hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>1</span>
          </button>

        </div>
      </header>

      {/* 
        ========================================
        MAIN LAYOUT
        ========================================
      */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR (240px) */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-full border-r" style={{ background: 'var(--color-bg-sidebar)', borderColor: 'var(--color-border)' }}>
          <div className="flex-1 overflow-y-auto pt-4 px-3 pb-4 flex flex-col gap-1">

            <NavItem icon={<Home className="w-[18px] h-[18px]" />} label="Home" active={activeNav === 'Home'} onClick={() => handleNavClick('Home')} />
            <NavItem icon={<LayoutDashboard className="w-[18px] h-[18px]" />} label="Workspace" active={activeNav === 'Workspace'} onClick={() => handleNavClick('Workspace')} />

            <div className="mt-4 mb-1 px-3">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">Coordination</span>
            </div>

            <NavItem icon={<Box className="w-[18px] h-[18px]" />} label="Resources" active={activeNav === 'Resources'} onClick={() => handleNavClick('Resources')} suffix={<ChevronDown className="w-4 h-4 opacity-50" />} />
            <NavItem icon={<AlertCircle className="w-[18px] h-[18px]" />} label="Help Requests" active={activeNav === 'Help Requests'} onClick={() => handleNavClick('Help Requests')} suffix={<ChevronDown className="w-4 h-4 opacity-50" />} />
            <NavItem icon={<MapPin className="w-[18px] h-[18px]" />} label="Shelters" active={activeNav === 'Shelters'} onClick={() => handleNavClick('Shelters')} suffix={<ChevronDown className="w-4 h-4 opacity-50" />} />

          </div>

          {/* Bottom User Row */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <span className="text-xs font-bold text-gray-600">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none" style={{ color: 'var(--color-text-primary)' }}>{user?.username}</span>
                <span className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline" onClick={handleLogout}>Log out</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-[1600px] mx-auto w-full">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Crisis Feed Overview</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Live updates on resources, requests, and shelters.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing} className="h-9 px-3 bg-white">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {/* Quick Actions mapping to old buttons */}
              <ResourceForm onSuccess={handleDataUpdate} />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <HelpRequestForm onSuccess={handleDataUpdate} />
            <ShelterForm onSuccess={handleDataUpdate} />
          </div>

          {/* Meta Cards Row (Asymmetric implementation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 rounded-2xl shadow-sm bg-transparent mb-8">

            {/* Card 1 */}
            <div className="bg-white p-4 border-r border-b lg:border-b-0 border-gray-100 rounded-tl-2xl rounded-tr-2xl lg:rounded-tr-none">
              <span className="text-xs uppercasetracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-status-in-progress)' }}></div>
                <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Active Response</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-4 border-r border-b lg:border-b-0 border-gray-100">
              <span className="text-xs uppercasetracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Help Requests</span>
              <div className="mt-1 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalHelpRequests}</div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-4 border-r border-b lg:border-b-0 border-gray-100">
              <span className="text-xs uppercasetracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Open Shelters</span>
              <div className="mt-1 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{openShelters}</div>
            </div>

            {/* Card 4 - Risk/Critical Card (Gradient) */}
            <div className="p-4 lg:col-span-1 border-b lg:border-b-0" style={{ background: 'var(--gradient-risk)' }}>
              <span className="text-xs text-white/80 font-medium tracking-wide">Critical Requests</span>
              <div className="mt-1 text-2xl font-bold text-white">{criticalRequests}</div>
            </div>

            {/* Card 5 - Accent Block (Solid Red, No Content) */}
            <div className="hidden lg:block w-full h-full rounded-tr-2xl rounded-br-2xl" style={{ background: 'var(--color-risk-very-high)' }}></div>

          </div>

          {/* Filtering unified row */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Data Scope</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everywhere</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                </SelectContent>
              </Select>

              <Select value={helpTypeFilter} onValueChange={setHelpTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Help Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Help</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="rescue">Rescue</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Detail Body: 2-Col Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

            {/* Left Column (flex-1) - Map & Data */}
            <div className="xl:col-span-2 flex flex-col gap-6">

              {/* Map Card */}
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader className="bg-white border-b border-gray-50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    Operational Map
                  </CardTitle>
                  <CardDescription>Visualizing resources (Green), requests (Red), and shelters (Yellow).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] w-full bg-gray-100 relative">
                    <Map
                      resources={filteredResources}
                      helpRequests={filteredHelpRequests}
                      shelters={filteredShelters}
                      center={getMapCenter()}
                    />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Highlight Cards */}
            <div className="flex flex-col gap-4">

              {/* Detail Card 1 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Location Scope</span>
                <div className="text-base font-semibold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                  {radiusFilter === 'all' ? "Global Visibility" : `Within ${radiusFilter}km`}
                </div>
              </div>

              {/* Detail Card 2 - Residual Risk Style */}
              <div className="rounded-xl p-4 shadow-sm border border-red-50 flex flex-col justify-between" style={{ background: 'var(--color-residual-bg)' }}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-rose-900">Critical Alerts</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-residual-dot)' }}></div>
                </div>
                <div className="text-2xl font-bold mt-2 text-rose-700">{criticalRequests}</div>
              </div>

              {/* Vulnerability Card (Dark) mapped to urgent requests list preview */}
              <div className="rounded-xl p-5 shadow-md flex flex-col h-full mt-2" style={{ background: 'var(--color-card-dark-bg)', color: 'var(--color-card-dark-text)' }}>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Escalations</span>
                <h4 className="text-base font-semibold mt-1 mb-4 leading-tight">Highest Priority Help Requests</h4>

                <div className="flex-1 flex flex-col gap-3">
                  {filteredHelpRequests.filter(r => r.urgency === 'critical').slice(0, 3).map(req => (
                    <div key={req.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{req.help_type.toUpperCase()}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[120px]">{req.name}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {req.people_affected}
                      </div>
                    </div>
                  ))}
                  {criticalRequests === 0 && (
                    <p className="text-sm text-gray-400">No critical requests at the moment.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* TAB BAR & TABLES */}
          <div ref={tabsSectionRef} className="mb-8" style={{ scrollMarginTop: '1rem' }}>
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); const navKey = Object.keys(navToTab).find(k => navToTab[k] === val); if (navKey) setActiveNav(navKey); }} className="w-full">
              {/* Pill style tab list */}
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">

                <TabsTrigger
                  value="resources"
                  className="rounded-full border border-gray-200 bg-white data-[state=active]:border-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-1.5 text-sm transition-all"
                >
                  Resources <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100">{filteredResources.length}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="help"
                  className="rounded-full border border-gray-200 bg-white data-[state=active]:border-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-1.5 text-sm transition-all"
                >
                  Help Requests <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100">{filteredHelpRequests.length}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="shelters"
                  className="rounded-full border border-gray-200 bg-white data-[state=active]:border-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-1.5 text-sm transition-all"
                >
                  Shelters <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100">{filteredShelters.length}</span>
                </TabsTrigger>

                {/* High Risk Badge aligned to end mentally */}
                <div className="ml-auto hidden sm:flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--color-risk-high-badge)', color: 'var(--color-risk-high-badge-text)' }}>
                  Auto-sync Active
                </div>

              </TabsList>

              {/* TABS CONTENT (Clean wide tables) */}
              <TabsContent value="resources" className="m-0 focus-visible:outline-none">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Quantity</th>
                          <th className="px-5 py-3 font-medium">Contact</th>
                          <th className="px-5 py-3 font-medium">Location</th>
                          <th className="px-5 py-3 font-medium">Distance</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredResources.map((resource) => (
                          <tr key={resource.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-5 py-3 capitalize font-medium text-gray-900">{resource.resource_type.replace('_', ' ')}</td>
                            <td className="px-5 py-3 text-gray-600">{resource.quantity}</td>
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-900">{resource.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{resource.contact_number}</div>
                            </td>
                            <td className="px-5 py-3 text-gray-600 truncate max-w-[200px]">{resource.location_address}</td>
                            <td className="px-5 py-3 font-medium text-gray-900">{resource.distance ? `${resource.distance} km` : 'N/A'}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${resource.status === 'available' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {resource.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredResources.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No resources match your filters.</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="help" className="m-0 focus-visible:outline-none">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Urgency</th>
                          <th className="px-5 py-3 font-medium">People</th>
                          <th className="px-5 py-3 font-medium">Contact</th>
                          <th className="px-5 py-3 font-medium">Location</th>
                          <th className="px-5 py-3 font-medium">Distance</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredHelpRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 capitalize font-medium text-gray-900">{request.help_type}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${request.urgency === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                request.urgency === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  request.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                {request.urgency}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-medium text-gray-900">{request.people_affected}</td>
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-900">{request.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{request.contact_number}</div>
                            </td>
                            <td className="px-5 py-3 text-gray-600 truncate max-w-[200px]">{request.location_address}</td>
                            <td className="px-5 py-3 font-medium text-gray-900">{request.distance ? `${request.distance} km` : 'N/A'}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {request.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredHelpRequests.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No help requests match your filters.</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shelters" className="m-0 focus-visible:outline-none">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3 font-medium">Name</th>
                          <th className="px-5 py-3 font-medium">Contact</th>
                          <th className="px-5 py-3 font-medium">Location</th>
                          <th className="px-5 py-3 font-medium">Capacity</th>
                          <th className="px-5 py-3 font-medium">Facilities</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredShelters.map((shelter) => (
                          <tr key={shelter.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-900">{shelter.shelter_name}</td>
                            <td className="px-5 py-3">
                              <div className="text-gray-900">{shelter.contact_person}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{shelter.contact_number}</div>
                            </td>
                            <td className="px-5 py-3 text-gray-600 truncate max-w-[150px]">{shelter.location_address}</td>
                            <td className="px-5 py-3">
                              <span className="font-bold text-gray-900">{shelter.current_occupancy}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-gray-600">{shelter.total_capacity}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1.5 flex-wrap">
                                {shelter.has_food && <div className="w-2 h-2 rounded-full bg-green-500" title="Food available"></div>}
                                {shelter.has_water && <div className="w-2 h-2 rounded-full bg-blue-500" title="Water available"></div>}
                                {shelter.has_medical && <div className="w-2 h-2 rounded-full bg-red-500" title="Medical available"></div>}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${shelter.operational_status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                                shelter.operational_status === 'full' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {shelter.operational_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredShelters.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No shelters match your filters.</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </main>
      </div>
    </div>
  );
}

// Simple NavItem component for Sidebar
function NavItem({ icon, label, active, onClick, suffix }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full h-10 px-3 rounded-md transition-colors ${active
        ? 'bg-gray-900 text-white'
        : 'text-gray-700 hover:bg-gray-50'
        }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {suffix && suffix}
    </button>
  );
}
