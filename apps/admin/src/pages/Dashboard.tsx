import { Users, Package, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Inquiries', value: '124', trend: '+12%', icon: Users },
    { title: 'Custom Packages', value: '28', trend: '+5%', icon: Package },
    { title: 'Booked Dates', value: '45', trend: '+18%', icon: Calendar },
    { title: 'Revenue (Est)', value: '$84k', trend: '+22%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back to your studio command center.</p>
        </div>
        <button className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-[#003366]/30">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
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
                <p className="text-4xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Inquiries</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-medium">No recent inquiries</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Once you connect the Firebase backend, all contact form submissions will appear right here in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
