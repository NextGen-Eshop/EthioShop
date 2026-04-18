import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/components/layout/AdminLayout';
import Orders from './admin/pages/Orders';
import Overview from './admin/pages/Overview';
import Products from './admin/pages/Products';
import Users from './admin/pages/Users';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';
import Login from './admin/pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
