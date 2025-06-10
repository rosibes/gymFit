import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import AuthPage from './components/AuthPage'
import { Dashboard } from './components/Dashboard'
import { Trainers } from './components/Trainers';
import { Subscriptions } from './components/Subscriptions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Appointments } from './components/Appointments';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { ScheduleAppointment } from './components/ScheduleAppointment';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { AdminSubscriptions } from './components/AdminSubscriptions';

// import { ClientDashboard } from './components/ClientDashboard';
// import { AdminSubscriptions } from './components/AdminSubscriptions';
// import { CreateAppointment } from './components/CreateAppointment';
// import { CreateSubscription } from './components/CreateSubscription';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userRole.toString())) {
    console.log(user.userRole.toString())
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<AuthPage isSingin={true} />} />
      <Route path="/register" element={<AuthPage isSingin={false} />} />
      <Route path="/" element={
        <PrivateRoute allowedRoles={['0', '1', '2']}>
          {user?.userRole === 0 ? (
            <Navigate to="/admin" replace />
          ) : user?.userRole === 1 ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/trainer" replace />
          )}
        </PrivateRoute>
      } />
      <Route path="/trainer" element={
        <PrivateRoute allowedRoles={['2']}>
          <TrainerDashboard />
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['0']}>
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/admin/subscriptions" element={
        <PrivateRoute allowedRoles={['0']}>
          <AdminSubscriptions />
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['1']}>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path='/trainers' element={<Trainers />} />
      <Route path='/subscriptions' element={<Subscriptions />} />
      <Route path='/appointments' element={<Appointments />} />
      <Route path="/subscription-plans" element={<SubscriptionPlans />} />
      <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
