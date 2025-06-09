import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<AuthPage isSingin={true} />} />
      <Route path="/register" element={<AuthPage isSingin={false} />} />
      <Route path="/dashboard" element={user?.userRole === 1 ? <Dashboard /> : user?.userRole === 2 ? <TrainerDashboard /> : <AdminDashboard />} />
      <Route path='/trainers' element={<Trainers />} />
      <Route path='/subscriptions' element={<Subscriptions />} />
      <Route path='/appointments' element={<Appointments />} />
      <Route path="/subscription-plans" element={<SubscriptionPlans />} />
      <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
      <Route path="/" element={<AuthPage isSingin={true} />} />
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
