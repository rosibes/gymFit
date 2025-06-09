import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { appointmentsService } from "../services/appointmentsService"
import type { Appointment, AppointmentStatus } from "../types/appointment"
import toast from 'react-hot-toast';

interface AppointmentsProps {
    filterStatus?: AppointmentStatus | 'All';
    showTitle?: boolean;
}

const AppointmentSkeleton = () => (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white">
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            <div className="mt-4">
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

export const Appointments = ({ filterStatus = 'All', showTitle = true }: AppointmentsProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [skeletonCount, setSkeletonCount] = useState(0);
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const handleCancelAppointment = async (appointmentId: number) => {
        const toastId = toast.loading('Cancelling appointment...');

        try {
            await appointmentsService.handleCancelAppointment(appointmentId);

            // Re-fetch appointments based on user role and filter status
            let data;
            if (user!.userRole === 2) { // Trainer
                const allAppointments = await appointmentsService.getTrainerAppointments();
                data = filterStatus === 'All'
                    ? allAppointments
                    : allAppointments.filter(a => a.Status === filterStatus);
            } else {
                data = filterStatus === 'All'
                    ? await appointmentsService.getUserAppointments(user!.id)
                    : await appointmentsService.getAppointmentByStatus(user!.id, filterStatus);
            }

            setAppointments(data);
            toast.success('Appointment cancelled successfully!', {
                id: toastId,
            });
        } catch (err: any) {
            toast.error(err.message || 'Failed to cancel appointment', {
                id: toastId,
            });
        }
    };

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            navigate('/login')
            return
        }

        const fetchAppointments = async () => {
            try {
                setLoading(true);

                let data;
                if (user.userRole === 2) { // Trainer
                    const allAppointments = await appointmentsService.getTrainerAppointments();
                    data = filterStatus === 'All'
                        ? allAppointments
                        : allAppointments.filter(a => a.Status === filterStatus);
                } else {
                    const count = filterStatus === 'All'
                        ? await appointmentsService.getAppointmentsCount(user.id)
                        : await appointmentsService.getAppointmentsCountByStatus(user.id, filterStatus);
                    setSkeletonCount(count);

                    data = filterStatus === 'All'
                        ? await appointmentsService.getUserAppointments(user.id)
                        : await appointmentsService.getAppointmentByStatus(user.id, filterStatus);
                }

                setAppointments(data);
                console.log("appointments", data)
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch appointments');
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments()
    }, [user, authLoading, navigate, filterStatus])


    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {showTitle && <h1 className="text-3xl text-center font-bold mb-8">My Appointments</h1>}

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <AppointmentSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="flex flex-row gap-6 justify-center items-center py-12">
                    <div className="bg-white rounded-lg shadow p-6 text-center w-full max-w-md">
                        {user.userRole === 2 ? (
                            <>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Found</h3>
                                <p className="text-gray-600 mb-4">You don't have any appointments scheduled at the moment.</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Scheduled</h3>
                                <p className="text-gray-600 mb-4">Book a session with one of our professional trainers.</p>
                                <button
                                    onClick={() => navigate('/trainers')}
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Find a Trainer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((appointment) => (
                        <div
                            key={appointment.Id}
                            className="rounded-lg shadow-lg overflow-hidden bg-white"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {appointment.Trainer?.User?.Name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{appointment.Trainer?.Specialization}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.Status)}`}>
                                        {appointment.Status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{new Date(appointment.Date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{appointment.TimeSlot?.Hour ? `${appointment.TimeSlot.Hour}:00` : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{appointment.Trainer?.Location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>{appointment.Trainer?.User ? `${appointment.Trainer.User.Name}` : 'N/A'}</span>
                                    </div>
                                </div>

                                {appointment.Status === 'Pending' && (
                                    <div className="mt-4 flex space-x-2">
                                        <button
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                            onClick={() => handleCancelAppointment(appointment.Id!)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}