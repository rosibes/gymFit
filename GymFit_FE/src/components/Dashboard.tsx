import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Subscriptions } from './Subscriptions';
import { Appointments } from './Appointments';
import { appointmentsService } from '../services/appointmentsService';
import type { Appointment } from '../types/appointment';
import { subscriptionService } from "../services/subscriptionService";
import type { Subscription } from "../types/subscription";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from 'react-hot-toast';
import { DashboardHeader } from './DashboardHeader';

export const Dashboard = () => {
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

        const fetchSubscriptions = async () => {
            try {
                setLoading(true);
                const data = await subscriptionService.getUserSubscriptions(user.id);
                setSubscriptions(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch subscriptions');
                toast.error(err.message || 'Failed to fetch subscriptions');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingAppointments();
        fetchSubscriptions();
    }, [user, authLoading, navigate]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <DashboardHeader title="GymFit Dashboard" />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Quick Actions Section */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/subscription-plans')}
                        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-indigo-200 group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Subscription</h3>
                                <p className="text-sm text-gray-500">Explore and purchase new subscription plans</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/schedule-appointment')}
                        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-indigo-200 group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Schedule Appointment</h3>
                                <p className="text-sm text-gray-500">Book a new training session</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Welcome Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                    <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent ${authLoading ? 'animate-pulse' : ''}`}>
                        Welcome to your Dashboard
                    </h2>
                    <p className={`text-gray-600 mb-6 ${authLoading ? 'animate-pulse' : ''}`}>
                        Track your fitness journey and manage your subscriptions all in one place.
                    </p>
                    <div className="bg-indigo-50 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Appointments</h2>
                            <Link to="/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View All Appointments →
                            </Link>
                        </div>
                        <Appointments filterStatus="Pending" showTitle={pendingAppointments.length > 0} />
                    </div>
                </div>

                {/* Subscriptions Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                        Your Subscriptions
                    </h2>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
                            <p className="text-gray-600 mb-6">Start your fitness journey with our subscription plans!</p>
                            <button
                                onClick={() => navigate('/subscription-plans')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-200"
                            >
                                View Plans
                                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="px-4">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Active Subscriptions</h2>
                                    <Link to="/subscriptions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View All Subscriptions →
                                    </Link>
                                </div>
                                <Slider {...settings}>
                                    {subscriptions.map((subscription) => (
                                        <div key={subscription.Id} className="px-2">
                                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden h-64 flex flex-col border border-gray-100 hover:border-indigo-200 transition-all duration-200">
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h3 className="text-xl font-semibold text-gray-900">
                                                                    {subscription.Type}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(subscription.StartDate).toLocaleDateString()} - {new Date(subscription.EndDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.IsActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {subscription.IsActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto">
                                                        <div className="flex items-center text-gray-600">
                                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-lg font-semibold">{subscription.Price} Eur</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 