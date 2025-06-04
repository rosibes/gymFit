import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Subscriptions } from './Subscriptions';
import { Appointments } from './Appointments';
import { appointmentsService } from '../services/appointmentsService';
import type { Appointment } from '../types/appointment';

export const Dashboard = () => {
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchPendingAppointments = async () => {
            try {
                const data = await appointmentsService.getAppointmentByStatus(user.id, 'Pending');
                setPendingAppointments(data);
            } catch (err) {
                console.error('Failed to fetch pending appointments:', err);
            }
        };
        fetchPendingAppointments();
    }, [user, authLoading, navigate]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className={`text-xl font-bold ${authLoading ? 'text-transparent bg-gray-200 rounded animate-pulse' : ''}`}>
                                GymFit Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <span className={`mr-4 ${authLoading ? 'text-transparent bg-gray-200 rounded animate-pulse' : ''}`}>
                                Welcome, {user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 rounded ${authLoading ? 'bg-gray-200 animate-pulse' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white border-4 border-dashed border-gray-200 rounded-lg p-4 mb-8">
                        <h2 className={`text-2xl font-bold mb-4 ${authLoading ? 'text-transparent bg-gray-200 rounded animate-pulse' : ''}`}>
                            Welcome to your Dashboard
                        </h2>
                        <p className={`mb-8 ${authLoading ? 'text-transparent bg-gray-200 rounded animate-pulse' : ''}`}>
                            This is where you'll see your workout plans and progress.
                        </p>
                        <div>
                            <Appointments filterStatus="Pending" showTitle={pendingAppointments.length > 0} />
                        </div>
                    </div>

                    {/* Subscriptions Section */}
                    <div className="mt-8">
                        <Subscriptions />
                    </div>
                </div>
            </main>
        </div>
    );
} 