import { useState, useEffect, useMemo } from 'react';
import { Users, Package, Calendar, TrendingUp, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('orders').select('*');
    if (data) {
      setOrders(data);
    }
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
      const date = new Date(order.created_at);
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
    { title: 'Custom Packages Built', value: packageData.reduce((acc, curr) => acc + curr.value, 0), trend: '+18%', icon: Package },
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
          className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#003366]/20 flex items-center gap-2"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

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
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#003366]/10 flex items-center justify-center text-[#003366]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-gray-500 font-medium text-sm">{stat.title}</h3>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#003366" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#003366' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#b7791f' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">Not enough data to display chart.</div>
            )}
          </div>
        </div>

        {/* Popular Packages Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Popular Packages</h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
             {packageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {packageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="text-gray-400 font-medium">Not enough data to display chart.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
