import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';
import type { Subscription } from '../types/subscription';
import { useAuth } from '../context/AuthContext';

const SubscriptionSkeleton = () => (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
    </div>
);

export const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [skeletonCount, setSkeletonCount] = useState(0);
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchSubscriptions = async () => {
            try {
                setLoading(true);
                const count = await subscriptionService.getSubscriptionsCount(user.id);
                setSkeletonCount(count);

                const data = await subscriptionService.getUserSubscriptions(user.id);
                setSubscriptions(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch subscriptions');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [user, authLoading, navigate]);

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subscriptions</h1>

                {(loading) ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: skeletonCount }).map((_, index) => (
                            <SubscriptionSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center flex flex-row gap-6 justify-center items-center py-12">
                        <div className="bg-white rounded-lg shadow p-6 text-center w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
                            <p className="text-gray-600 mb-4">Get access to premium features and personalized training.</p>
                            <button
                                onClick={() => navigate('/subscription-plans')}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Buy Subscription
                            </button>
                        </div>                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
                        {subscriptions.map((subscription) => (
                            <div key={subscription.Id} className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {subscription.Type} Subscription
                                </h2>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Price:</span> ${subscription.Price}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Start Date:</span>{' '}
                                        {new Date(subscription.StartDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">End Date:</span>{' '}
                                        {new Date(subscription.EndDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`font-medium ${new Date(subscription.EndDate) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                                            {new Date(subscription.EndDate) > new Date() ? 'Active' : 'Expired'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};