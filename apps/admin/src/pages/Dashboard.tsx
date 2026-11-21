import { useState, useEffect, useMemo } from 'react';
import { Users, Package, Calendar, TrendingUp, RefreshCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DEFAULT_MOCK_ORDERS } from '../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    let loadedOrders: any[] = [];
    
    const LIVE_FRONTEND_URL = 'https://vrundavan-frontend.vercel.app';
    const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? LIVE_FRONTEND_URL
      : 'http://localhost:3000';
    const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

    // 1. Fetch live orders from frontend API store
    try {
      const apiRes = await fetch(`${apiUrl}/api/orders`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (Array.isArray(apiData) && apiData.length > 0) {
          loadedOrders = apiData;
          setIsUsingDemo(false);
        }
      }
    } catch {
      // API unavailable or blocked
    }

    // 1b. If on localhost, also check live production frontend
    if (apiUrl !== LIVE_FRONTEND_URL) {
      try {
        const liveRes = await fetch(`${LIVE_FRONTEND_URL}/api/orders`);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          if (Array.isArray(liveData) && liveData.length > 0) {
            const existingKeys = new Set(loadedOrders.map(o => o.quote_id || o.id));
            const newLive = liveData.filter((o: any) => !existingKeys.has(o.quote_id || o.id));
            loadedOrders = [...loadedOrders, ...newLive];
            setIsUsingDemo(false);
          }
        }
      } catch {
        // live fetch optional
      }
    }

    // 2. Fetch from Supabase
    try {
      const { data, error } = await supabase.from('orders').select('*');
      if (data && data.length > 0 && !error) {
        const existingIds = new Set(loadedOrders.map(o => o.id));
        const newFromDb = data.filter(o => !existingIds.has(o.id));
        loadedOrders = [...loadedOrders, ...newFromDb];
        setIsUsingDemo(false);
      }
    } catch {
      // Supabase connection error
    }

    // 3. Fallback to localStorage (only if it has valid non-empty items)
    if (loadedOrders.length === 0) {
      const local = localStorage.getItem('vrundavan_orders');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedOrders = parsed;
          }
        } catch {
          // ignore
        }
      }
    }

    // 4. Default Mock Orders fallback if still empty
    if (loadedOrders.length === 0) {
      loadedOrders = DEFAULT_MOCK_ORDERS;
      localStorage.setItem('vrundavan_orders', JSON.stringify(DEFAULT_MOCK_ORDERS));
      setIsUsingDemo(true);
    }

    setOrders(loadedOrders);
    setIsLoading(false);
  };

  const { totalInquiries, confirmedBookings, totalRevenue, chartData, packageData } = useMemo(() => {
    const totalInquiries = orders.length;
    const confirmedBookings = orders.filter(o => o.status === 'confirmed').length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    // Process data for revenue over time (group by month)
    const monthlyRevenue: Record<string, number> = {};
    const packageCounts: Record<string, number> = {};

    orders.forEach(order => {
      // Line chart data
      const date = new Date(order.created_at || Date.now());
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(order.total_amount || 0);

      // Pie chart data
      if (order.package) {
        const pkgName = order.package.split(':')[0] || order.package;
        packageCounts[pkgName] = (packageCounts[pkgName] || 0) + 1;
      }
    });

    const chartData = Object.keys(monthlyRevenue).map(month => ({
      name: month,
      revenue: monthlyRevenue[month]
    }));

    const COLORS = ['#003366', '#b7791f', '#059669', '#3b82f6', '#8b5cf6'];
    const packageData = Object.keys(packageCounts).map((key, index) => ({
      name: key,
      value: packageCounts[key],
      color: COLORS[index % COLORS.length]
    }));

    return { totalInquiries, confirmedBookings, totalRevenue, chartData, packageData };
  }, [orders]);

  const stats = [
    { title: 'Total Inquiries', value: totalInquiries, trend: '+12%', icon: Users },
    { title: 'Confirmed Bookings', value: confirmedBookings, trend: '+5%', icon: Calendar },
    { title: 'Custom Packages Built', value: packageData.reduce((acc, curr) => acc + curr.value, 0) || totalInquiries, trend: '+18%', icon: Package },
    { title: 'Total Est. Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, trend: '+22%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back to your studio command center.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#003366]/20 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {isUsingDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Showing Demo Studio Data (Supabase Paused or Disconnected)</p>
              <p className="text-amber-800">
                Aapka Supabase database inactive hone ki wajah se pause ho sakta hai. Live data sync karne ke liye Supabase Dashboard mein jakar <strong>Restore / Resume Project</strong> karein.
              </p>
            </div>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shrink-0 ml-4"
          >
            Open Supabase
          </a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#003366]/20 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-24 h-24 text-[#003366]" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
            <p className="text-sm text-gray-400 mt-1">Monthly estimated earnings distribution</p>
          </div>
          <div className="h-[280px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    tickFormatter={(val) => `₹${val / 1000}k`} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#003366" 
                    strokeWidth={3} 
                    dot={{ fill: '#003366', strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Not enough data to display chart.
              </div>
            )}
          </div>
        </div>

        {/* Popular Packages Doughnut */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Popular Packages</h3>
            <p className="text-sm text-gray-400 mt-1">Breakdown of custom plans chosen</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {packageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {packageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'Bookings']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Not enough data to display chart.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
