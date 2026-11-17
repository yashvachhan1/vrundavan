import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lock } from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Team from './pages/Team';
import Deliverables from './pages/Deliverables';
import Finance from './pages/Finance';
import Equipment from './pages/Equipment';
import Calendar from './pages/Calendar';
import Packages from './pages/Packages';
import Discounts from './pages/Discounts';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import CustomPlanItems from './pages/CustomPlanItems';
import AdvanceRules from './pages/AdvanceRules';
import Reels from './pages/Reels';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Using import.meta.env for Vite environment variables, falling back to a default for demo purposes
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'vrundavan2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-[#003366]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#003366]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Portal</h1>
          <p className="text-slate-500 text-center text-sm mb-8">Enter your secure password to access the Vrundavan management dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all text-slate-900 ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-2 font-medium ml-1">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244] text-white py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="team" element={<Team />} />
          <Route path="deliverables" element={<Deliverables />} />
          <Route path="finance" element={<Finance />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="plan-builder" element={<CustomPlanItems />} />
          <Route path="advance-rules" element={<AdvanceRules />} />
          <Route path="packages" element={<Packages />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="videos" element={<Videos />} />
          <Route path="reels" element={<Reels />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
