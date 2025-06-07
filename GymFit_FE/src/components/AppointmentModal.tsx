import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Trainer } from '../types/trainer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface TimeSlot {
    id: number;
    hour: number;
    isAvailable: boolean;
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    trainer: Trainer;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, trainer }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleDateChange = async (date: string) => {
        setSelectedDate(date);
        setSelectedTimeSlot(null);
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5083/odata/timeslots/available/${trainer.Id}/${date}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAvailableTimeSlots(response.data);
        } catch (error) {
            toast.error('Eroare la verificarea disponibilității');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeSlotClick = (slot: TimeSlot) => {
        if (selectedTimeSlot?.id === slot.id) {
            setSelectedTimeSlot(null);
        } else {
            setSelectedTimeSlot(slot);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error('Te rugăm să selectezi data și ora');
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5083/odata/appointments/new', {
                trainerId: trainer.Id,
                date: selectedDate,
                hour: selectedTimeSlot.hour,
                userId: user?.id,
                status: "Pending"
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.success('Programarea a fost creată cu succes!');
            onClose();
            navigate('/appointments');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data) {
                toast.error(error.response.data.message || 'Eroare la crearea programării');
            } else {
                toast.error('Eroare la crearea programării');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Programează o sesiune cu {trainer.User?.Name}</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selectează Data
                    </label>
                    <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>

                {selectedDate && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selectează Ora
                        </label>
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {availableTimeSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleTimeSlotClick(slot)}
                                        className={`p-2 rounded-lg text-center transition-colors ${selectedTimeSlot?.id === slot.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {slot.hour}:00
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Anulează
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedTimeSlot}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Se procesează...' : 'Programează'}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AppointmentModal;

