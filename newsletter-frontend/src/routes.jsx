import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Subscribers from './pages/Subscribers.jsx';
import Lists from './pages/Lists.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Templates from './pages/Templates.jsx';
import Analytics from './pages/Analytics.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './hooks/useAuth.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="lists" element={<Lists />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
