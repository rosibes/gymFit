import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardHeader } from './DashboardHeader';
import { appointmentsService } from '../services/appointmentsService';
import { trainerService } from '../services/trainerService';
import type { AppointmentStatus } from '../types/appointment';
import { Appointments } from './Appointments';
import { subscriptionService } from '../services/subscriptionService';



interface AdminStats {
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalTrainers: number;
    totalClients: number;
}

export const AdminDashboard = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'All'>('All');
    const [selectedClientsCard, setSelectedClientsCard] = useState(false);
    const [stats, setStats] = useState<AdminStats>({
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalTrainers: 0,
        totalClients: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) return;
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const [appointments, subscriptions] = await Promise.all([
                    appointmentsService.getAllAppointments(),
                    subscriptionService.getAllSubscriptions()
                ]);

                // Calculate stats
                const stats = {
                    totalAppointments: appointments.length,
                    pendingAppointments: appointments.filter(a => a.Status === 'Pending').length,
                    completedAppointments: appointments.filter(a => a.Status === 'Completed').length,
                    cancelledAppointments: appointments.filter(a => a.Status === 'Cancelled').length,
                    totalTrainers: subscriptions.length,
                    totalClients: subscriptions.length
                };

                setStats(stats);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, navigate]);

    const handleStatClick = (status: AppointmentStatus | 'All') => {
        setSelectedStatus(status);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <DashboardHeader title="GymFit Admin Dashboard" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <DashboardHeader title="GymFit Admin Dashboard" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <DashboardHeader title="GymFit Admin Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">

                    <div
                        onClick={() => handleStatClick('All')}
                        className={`bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${selectedStatus === 'All' ? 'ring-2 ring-blue-500' : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Appointments</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
                    </div>
                    <div
                        onClick={() => handleStatClick('Pending')}
                        className={`bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${selectedStatus === 'Pending' ? 'ring-2 ring-yellow-500' : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                    </div>
                    <div
                        onClick={() => handleStatClick('Completed')}
                        className={`bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${selectedStatus === 'Completed' ? 'ring-2 ring-green-500' : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
                    </div>
                    <div
                        onClick={() => handleStatClick('Cancelled')}
                        className={`bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${selectedStatus === 'Cancelled' ? 'ring-2 ring-red-500' : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancelled Appointments</h3>
                        <p className="text-3xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Trainers</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalTrainers}</p>
                    </div>
                    <div
                        onClick={() => {
                            navigate('/admin/subscriptions');
                            setSelectedClientsCard(true);
                        }}
                        className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 ${selectedClientsCard ? 'ring-2 ring-indigo-500' : ''}`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Clients</h3>
                        <p className="text-3xl font-bold text-indigo-600">{stats.totalClients}</p>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {selectedStatus === 'All' ? 'All Appointments' : selectedStatus === 'Pending' ? 'Upcoming Appointments' : selectedStatus === 'Completed' ? 'Completed Appointments' : 'Cancelled Appointments'}
                        </h2>
                    </div>
                    <Appointments filterStatus={selectedStatus} showTitle={false} />
                </div>
            </div>
        </div>
    );
};