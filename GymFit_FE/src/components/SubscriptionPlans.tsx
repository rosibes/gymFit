import { useEffect, useState } from "react";
import { subscriptionPlanService } from "../services/subscriptionPlanService";
import type { SubscriptionPlan } from "../types/subscriptionPlan";

export const SubscriptionPlans = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    const fetchSubscriptionPlans = async () => {
        try {
            setLoading(true);
            const response = await subscriptionPlanService.getAll();
            setPlans(response);
            setLoading(false);
            setError(null);
        } catch (error) {
            console.error("Error fetching subscription plans:", error);
            setError(error instanceof Error ? error.message : 'Failed to fetch subscription plans');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Subscription Plans</h1>
            {loading && (
                <div className="flex justify-center">
                    <p className="text-lg">Loading...</p>
                </div>
            )}
            {error && (
                <div className="flex justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.Id}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
                    >
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{plan.Name}</h2>
                                <p className="text-gray-600 mb-4">{plan.Description}</p>
                                <div className="flex items-baseline mb-4">
                                    <span className="text-3xl font-bold text-gray-900">${plan.Price}</span>
                                    <span className="text-gray-500 ml-1">/month</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-semibold">Duration:</span> {plan.DurationInDays} days
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold">Type:</span> {plan.Type}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}