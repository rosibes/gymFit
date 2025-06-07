import { useEffect, useState } from "react";
import type { Trainer } from "../types/trainer";
import axios from "axios";

export const Trainers = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {


                const response = await axios('http://localhost:5083/odata/trainer?$expand=User');
                console.log('Răspuns de la server:', response.data);
                setTrainers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setError('A apărut o eroare la încărcarea antrenorilor');
                setLoading(false);
            }
        }
        fetchTrainers();
    }, []);

    const handleAppointmentClick = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrainer(null);
    };

    if (error) return <div className="text-red-500">{error}</div>;
    if (!loading && (!trainers || trainers.length === 0)) return <div>Nu există antrenori disponibili</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">Antrenorii Noștri</h1>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        // Skeleton cards
                        Array(6).fill(0).map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                                {/* Skeleton pentru header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>

                                {/* Skeleton pentru detalii */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        trainers.map((t) => (
                            <div key={t.Id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                                {/* Header cu informații de contact */}
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.User?.Name || 'Nume indisponibil'}</h2>
                                    <div className="space-y-2 text-gray-600">
                                        <p className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {t.User?.Email || 'Email indisponibil'}
                                        </p>
                                        <p className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {t.User?.PhoneNumber || 'Telefon indisponibil'}
                                        </p>
                                    </div>
                                </div>

                                {/* Detalii despre antrenor */}
                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Specializare</h3>
                                            <p className="text-gray-600">{t.Specialization}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Experiență</h3>
                                            <p className="text-gray-600">{t.Experience}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Introducere</h3>
                                            <p className="text-gray-600">{t.Introduction}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Disponibilitate</h3>
                                            <p className="text-gray-600 whitespace-pre-line">{t.Availability}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Locație</h3>
                                            <p className="text-gray-600">{t.Location}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => handleAppointmentClick(t)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Programează o sesiune
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* {selectedTrainer && (
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    trainer={selectedTrainer}
                />
            )} */}
        </div>
    );
};