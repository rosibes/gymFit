import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import AuthPage from './components/AuthPage'
import { Dashboard } from './components/Dashboard'
import { Trainers } from './components/Trainers';
import { Subscriptions } from './components/Subscriptions';
import { AuthProvider } from './context/AuthContext';
import { Appointments } from './components/Appointments';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { ScheduleAppointment } from './components/ScheduleAppointment';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage isSingin={true} />} />
          <Route path="/register" element={<AuthPage isSingin={false} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/trainers' element={<Trainers />} />
          <Route path='/subscriptions' element={<Subscriptions />} />
          <Route path='/appointments' element={<Appointments />} />
          <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
          <Route path="/" element={<AuthPage isSingin={true} />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
