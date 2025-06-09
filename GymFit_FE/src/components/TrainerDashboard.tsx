import { useEffect, useState } from "react"
import { appointmentsService } from "../services/appointmentsService"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import type { Appointment, AppointmentStatus } from "../types/appointment"
import axios from 'axios'
import { Appointments } from './Appointments'
import type { Trainer } from "../types/trainer"

interface TrainerStats {
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
}

export const TrainerDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'All'>('All');
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [stats, setStats] = useState<TrainerStats>({
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
    });

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            navigate('/login')
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const appointments = await appointmentsService.getTrainerAppointments();

                // Calculate stats
                setStats({
                    totalAppointments: appointments.length,
                    pendingAppointments: appointments.filter(a => a.Status === 'Pending').length,
                    completedAppointments: appointments.filter(a => a.Status === 'Completed').length,
                    cancelledAppointments: appointments.filter(a => a.Status === 'Cancelled').length
                });

                // Get trainer data from the first appointment (if any)
                if (appointments.length > 0 && appointments[0]?.Trainer) {
                    setTrainer(appointments[0].Trainer as Trainer);
                }
                console.log(trainer)

                setAppointments(appointments);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch appointments');
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, navigate]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                <p className="text-gray-600">Here's your training dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Appointments</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancelled</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                </div>
                <Appointments filterStatus="Pending" showTitle={false} />
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-lg shadow p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Availability</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-600">
                        {trainer?.Availability || 'No availability set'}
                    </p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-700">Specialization</h3>
                        <p className="text-gray-600">{trainer?.Specialization || 'Not specified'}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-700">Experience</h3>
                        <p className="text-gray-600">{trainer?.Experience || 'Not specified'}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-700">Location</h3>
                        <p className="text-gray-600">{trainer?.Location || 'Not specified'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}