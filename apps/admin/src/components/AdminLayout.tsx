import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Image as ImageIcon, Video, Package, Settings, LogOut, Bell, Search, UserSquare2, ShoppingBag, KanbanSquare, IndianRupee, Camera } from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Orders & Bookings', path: '/orders', icon: ShoppingBag },
  { name: 'Financials', path: '/finance', icon: IndianRupee },
  { name: 'Equipment Manager', path: '/equipment', icon: Camera },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Team Management', path: '/team', icon: UserSquare2 },
  { name: 'Post-Production', path: '/deliverables', icon: KanbanSquare },
  { name: 'Bundled Packages', path: '/packages', icon: Package },
  { name: 'Plan Builder Items', path: '/plan-builder', icon: Package },
  { name: 'Discounts & Coupons', path: '/discounts', icon: ShoppingBag },
  { name: 'Gallery Portfolio', path: '/gallery', icon: ImageIcon },
  { name: 'Video Showcase', path: '/videos', icon: Video },
  { name: 'Instagram Reels', path: '/reels', icon: Video },
];

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#003366] selection:text-white">
      {/* Sidebar - Deep Blue Theme */}
      <aside className="w-60 bg-[#003366] text-white flex flex-col shadow-2xl z-10 relative">
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          <div className="text-center w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-widest text-white mb-1 mt-2" style={{ fontFamily: 'system-ui, sans-serif' }}>VRUNDAVAN</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-2 px-2">Menu</p>
          
          <div className="space-y-1 flex-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group border border-transparent ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/5 hover:text-white font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={2} />
                      <span className="text-[13px]">{link.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
            
            <button className="flex items-center gap-4 px-4 py-2.5 w-full rounded-xl text-blue-200 hover:bg-white/5 hover:text-white transition-all duration-300 font-medium group text-left">
              <Settings className="w-[18px] h-[18px] group-hover:rotate-45 transition-transform duration-300" strokeWidth={2} />
              <span className="text-[13px]">Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl text-white font-medium bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md group">
            <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={2} />
            <span className="text-[13px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full border border-gray-200 w-80 focus-within:ring-2 focus-within:ring-[#003366]/20 transition-all">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search leads, packages..." 
              className="bg-transparent border-none outline-none ml-2 text-[13px] w-full placeholder:text-gray-500 text-gray-900"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-[#003366] transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-gray-900 leading-tight">Admin User</p>
                <p className="text-[11px] text-gray-500">Super Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003366] to-[#0055aa] flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:shadow-lg transition-all border border-[#003366]/20">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
