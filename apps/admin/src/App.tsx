import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
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
          <Route path="packages" element={<Packages />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="videos" element={<Videos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
