import { useEffect, useState } from 'react';
import { trainerService } from '../services/trainerService';
import type { Trainer } from '../types/trainer';
import type { SubscriptionPlan } from '../types/subscriptionPlan';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: SubscriptionPlan;
    onSubscribe: (planId: number, trainerId: number) => void;
}

export const SubscriptionModal = ({ isOpen, onClose, plan, onSubscribe }: SubscriptionModalProps) => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTrainers();
        }
    }, [isOpen, plan.Type]);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching trainers for specialization:', plan.Type);
            const data = await trainerService.getTrainersBySpecialization(plan.Type);
            console.log('Received trainers data:', data);
            setTrainers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Error in fetchTrainers:', err);
            setError(err.message || 'Failed to fetch trainers');
            setTrainers([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{plan.Name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Details</h3>
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                <span className="font-medium">Description:</span> {plan.Description}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Price:</span> ${plan.Price}/month
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Duration:</span> {plan.DurationInDays} days
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Type:</span> {plan.Type}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Trainers</h3>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-20 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-red-500">{error}</div>
                        ) : trainers.length === 0 ? (
                            <p className="text-gray-500">No trainers available for this specialization.</p>
                        ) : (
                            <div className="space-y-4">
                                {trainers.map((trainer) => (
                                    <div
                                        key={trainer.Id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTrainer === trainer.Id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                        onClick={() => setSelectedTrainer(trainer.Id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {trainer.User?.Name}
                                                </h4>
                                                <p className="text-sm text-gray-600">{trainer.Specialization}</p>
                                            </div>
                                            {selectedTrainer === trainer.Id && (
                                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{trainer.Introduction}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => selectedTrainer && onSubscribe(plan.Id, selectedTrainer)}
                            disabled={!selectedTrainer}
                            className={`px-4 py-2 text-white rounded-md transition-colors ${selectedTrainer
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 