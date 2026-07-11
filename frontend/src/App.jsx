import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import EmployeeForm from './pages/admin/EmployeeForm';
import EmployeeProfile from './pages/admin/EmployeeProfile';
import EmploymentTypes from './pages/admin/EmploymentTypes';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeaves from './pages/admin/Leaves';
import AdminHolidays from './pages/admin/Holidays';

import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeLeaves from './pages/employee/Leaves';
import EmployeeHolidays from './pages/employee/Holidays';
import Profile from './pages/Profile';

function withLayout(element) {
  return <AppLayout>{element}</AppLayout>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin">{withLayout(<AdminDashboard />)}</ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute allowedRole="admin">{withLayout(<Employees />)}</ProtectedRoute>} />
      <Route path="/admin/employees/new" element={<ProtectedRoute allowedRole="admin">{withLayout(<EmployeeForm />)}</ProtectedRoute>} />
      <Route path="/admin/employees/:id" element={<ProtectedRoute allowedRole="admin">{withLayout(<EmployeeProfile />)}</ProtectedRoute>} />
      <Route path="/admin/employees/:id/edit" element={<ProtectedRoute allowedRole="admin">{withLayout(<EmployeeForm />)}</ProtectedRoute>} />
      <Route path="/admin/employment-types" element={<ProtectedRoute allowedRole="admin">{withLayout(<EmploymentTypes />)}</ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="admin">{withLayout(<AdminAttendance />)}</ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute allowedRole="admin">{withLayout(<AdminLeaves />)}</ProtectedRoute>} />
      <Route path="/admin/holidays" element={<ProtectedRoute allowedRole="admin">{withLayout(<AdminHolidays />)}</ProtectedRoute>} />
     
      {/* Employee routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRole="employee">{withLayout(<EmployeeDashboard />)}</ProtectedRoute>} />
      <Route path="/employee/leaves" element={<ProtectedRoute allowedRole="employee">{withLayout(<EmployeeLeaves />)}</ProtectedRoute>} />
      <Route path="/employee/holidays" element={<ProtectedRoute allowedRole="employee">{withLayout(<EmployeeHolidays />)}</ProtectedRoute>} />
     
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
