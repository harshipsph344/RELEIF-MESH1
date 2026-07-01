import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Users, Package, AlertCircle, Home, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const detailRef = useRef(null);

  const switchSection = (section) => {
    setActiveSection(section);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        statsAPI.get(),
        authAPI.getAllUsers()
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data.users);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error fetching statistics",
        description: error.response?.data?.error || "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.is_admin) {
      toast({ title: "Access Denied", description: "You do not have admin privileges", variant: "destructive" });
      navigate('/');
      return;
    }
    fetchStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const totalEntries = (stats?.resources?.total || 0) + (stats?.help_requests?.total || 0) + (stats?.shelters?.total || 0);
  const occupancyRate = stats?.shelters?.total_capacity > 0
    ? ((stats.shelters.total_occupancy / stats.shelters.total_capacity) * 100).toFixed(1) : 0;
  const availabilityRate = stats?.resources?.total > 0
    ? ((stats.resources.available / stats.resources.total) * 100).toFixed(1) : 0;

  const sectionTitle = {
    overview: 'Admin Overview',
    help: 'Help Requests',
    shelters: 'Shelter Capacity',
    resources: 'Resources',
    users: 'Users',
  };

  const show = (section) => activeSection === 'overview' || activeSection === section;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--color-bg-app)' }}>

      {/* TOPBAR */}
      <header className="h-14 bg-white flex items-center justify-between px-4 z-10 shrink-0" style={{ boxShadow: '0 1px 0 var(--color-border)' }}>
        <div className="flex items-center gap-2 lg:w-60">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--color-primary)' }}>
            RM
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>ReliefMesh</span>
        </div>

        <div className="hidden md:flex flex-1 items-center px-6">
          <div className="flex items-center space-x-2 text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>Dashboard</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Admin Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="rounded-full h-8 border-gray-200 hidden sm:flex">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Operations</span>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStats} className="h-8 w-8 p-0 rounded-full border-gray-200">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r" style={{ background: 'var(--color-bg-sidebar)', borderColor: 'var(--color-border)' }}>
          <div className="flex-1 pt-4 px-3 pb-4 flex flex-col gap-1">
            <SideItem label="System Overview" active={activeSection === 'overview'} onClick={() => switchSection('overview')} />
            <SideItem label="Help Requests" active={activeSection === 'help'} onClick={() => switchSection('help')} />
            <SideItem label="Shelters" active={activeSection === 'shelters'} onClick={() => switchSection('shelters')} />
            <SideItem label="Resources" active={activeSection === 'resources'} onClick={() => switchSection('resources')} />
            <SideItem label="Users" active={activeSection === 'users'} onClick={() => switchSection('users')} />
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs font-bold text-gray-600">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none" style={{ color: 'var(--color-text-primary)' }}>{user?.username}</span>
              <span className="text-xs text-gray-400 mt-0.5">Administrator</span>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-[1600px] mx-auto w-full">

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {sectionTitle[activeSection]}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Real-time system statistics and platform health.</p>
          </div>

          {/* Overview-only: Meta Stats Row + Quick Cards */}
          {activeSection === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 rounded-2xl shadow-sm mb-8 overflow-hidden">
                <StatMetaCard label="Total Users" value={stats?.users?.total || 0} />
                <StatMetaCard label="Resources" value={stats?.resources?.total || 0} />
                <StatMetaCard label="Requests" value={stats?.help_requests?.total || 0} />
                <div className="p-4" style={{ background: 'var(--gradient-risk)' }}>
                  <span className="text-xs text-white/80 font-medium tracking-wide">Critical Requests</span>
                  <div className="mt-1 text-2xl font-bold text-white">{stats?.help_requests?.critical || 0}</div>
                </div>
                <div className="hidden lg:block" style={{ background: 'var(--color-risk-very-high)' }}></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <QuickStatCard icon={<Users className="h-4 w-4" />} label="Total Users" value={stats?.users?.total || 0} color="text-gray-900" />
                <QuickStatCard icon={<Package className="h-4 w-4 text-green-600" />} label="Available Resources" value={stats?.resources?.available || 0} sub={`of ${stats?.resources?.total || 0} total`} color="text-green-600" />
                <QuickStatCard icon={<AlertCircle className="h-4 w-4 text-red-500" />} label="Pending Requests" value={stats?.help_requests?.pending || 0} sub={`of ${stats?.help_requests?.total || 0} total`} color="text-red-600" />
                <QuickStatCard icon={<Home className="h-4 w-4 text-amber-500" />} label="Open Shelters" value={stats?.shelters?.open || 0} sub={`of ${stats?.shelters?.total || 0} total`} color="text-amber-600" />
              </div>
            </>
          )}

          {/* Detail Grid — sections shown based on activeSection */}
          <div ref={detailRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ scrollMarginTop: '1rem' }}>

            {/* Help Requests Panel */}
            {show('help') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Help Requests</span>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <DetailRow label="Critical" sub="Require immediate action" value={stats?.help_requests?.critical || 0} bg="bg-red-50" textVal="text-red-600" />
                  <DetailRow label="Pending" sub="Awaiting fulfillment" value={stats?.help_requests?.pending || 0} bg="bg-orange-50" textVal="text-orange-600" />
                  <DetailRow label="People Affected" sub="Across all requests" value={stats?.help_requests?.people_affected || 0} bg="bg-blue-50" textVal="text-blue-600" />
                </div>
              </div>
            )}

            {/* Shelter Capacity Panel */}
            {show('shelters') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Home className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Shelter Capacity</span>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <DetailRow label="Total Capacity" sub="Max shelter spaces" value={stats?.shelters?.total_capacity || 0} bg="bg-green-50" textVal="text-green-600" />
                  <DetailRow label="Current Occupancy" sub="Currently occupied" value={stats?.shelters?.total_occupancy || 0} bg="bg-yellow-50" textVal="text-yellow-600" />
                  <DetailRow label="Available Spaces" sub="Remaining capacity" value={stats?.shelters?.available_spaces || 0} bg="bg-blue-50" textVal="text-blue-600" />
                  {stats?.shelters?.total_capacity > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Occupancy Rate</span>
                        <span className="font-semibold text-gray-800">{occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${occupancyRate}%`, background: 'var(--color-primary)' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resources Summary */}
            {show('resources') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Resources</span>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <DetailRow label="Total Resources" sub="All donated resources" value={stats?.resources?.total || 0} bg="bg-green-50" textVal="text-green-600" />
                  <DetailRow label="Available" sub="Ready for distribution" value={stats?.resources?.available || 0} bg="bg-blue-50" textVal="text-blue-600" />
                  {stats?.resources?.total > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Availability Rate</span>
                        <span className="font-semibold text-gray-800">{availabilityRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${availabilityRate}%`, background: '#16a34a' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Health — Dark Card (overview + users) */}
            {(activeSection === 'overview' || activeSection === 'users') && (
              <div className="rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ background: 'var(--color-card-dark-bg)' }}>
                <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-sm text-gray-200">System Health</span>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Active Entries</p>
                    <p className="text-4xl font-bold text-white">{totalEntries}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DarkMiniCard label="Resources" value={stats?.resources?.total || 0} />
                    <DarkMiniCard label="Requests" value={stats?.help_requests?.total || 0} />
                    <DarkMiniCard label="Shelters" value={stats?.shelters?.total || 0} />
                    <DarkMiniCard label="Users" value={stats?.users?.total || 0} />
                  </div>
                </div>
              </div>
            )}

            {/* Users section placeholder - NOW DYNAMIC */}
            {activeSection === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Registered Users</span>
                  </div>
                  <div className="text-xs px-2.5 py-1 bg-gray-100 rounded-full font-semibold">{usersList.length} Total</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-medium">User ID</th>
                        <th className="px-6 py-3 font-medium">Username</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Role</th>
                        <th className="px-6 py-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-medium text-gray-400">#{usr.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{usr.username}</td>
                          <td className="px-6 py-4 text-gray-600">{usr.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${usr.is_admin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                              {usr.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(usr.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usersList.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No users found in the system.</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SideItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full h-10 px-3 rounded-md text-sm font-medium transition-colors ${active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );
}

function StatMetaCard({ label, value }) {
  return (
    <div className="bg-white p-4 border-r border-b lg:border-b-0 border-gray-100">
      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="mt-1 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}

function QuickStatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function DetailRow({ label, sub, value, bg, textVal }) {
  return (
    <div className={`flex justify-between items-center p-4 rounded-xl ${bg}`}>
      <div>
        <p className="font-semibold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
      <div className={`text-2xl font-bold ${textVal}`}>{value}</div>
    </div>
  );
}

function DarkMiniCard({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-gray-800">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
