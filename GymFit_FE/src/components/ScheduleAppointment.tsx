import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Trainer } from '../types/trainer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AppointmentModal from './AppointmentModal';

const specializations = [
    'Fitness',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Boxing',
    'Swimming',
    'Dance'
];

export const ScheduleAppointment = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await axios('http://localhost:5083/odata/trainer?$expand=User');
                setTrainers(response.data);
                setFilteredTrainers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                toast.error('A apărut o eroare la încărcarea antrenorilor');
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    useEffect(() => {
        if (selectedSpecialization) {
            const filtered = trainers.filter(trainer =>
                trainer.Specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
            );
            setFilteredTrainers(filtered);
        } else {
            setFilteredTrainers(trainers);
        }
    }, [selectedSpecialization, trainers]);

    const handleTrainerSelect = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Programează o sesiune</h2>

                    <div className="mb-8">
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                            Specializare
                        </label>
                        <select
                            id="specialization"
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Toate specializările</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrainers.map((trainer) => (
                            <div
                                key={trainer.Id}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => handleTrainerSelect(trainer)}
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-lg font-semibold">
                                                {trainer.User?.Name?.[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {trainer.User?.Name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{trainer.Specialization}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{trainer.Experience} ani experiență</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{trainer.Location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedTrainer && (
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTrainer(null);
                    }}
                    trainer={selectedTrainer}
                />
            )}
        </div>
    );
}; 