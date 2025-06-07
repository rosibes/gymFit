import axios from "axios"
import type { Appointment } from "../types/appointment";
import type { Subscription } from "../types/subscription";

export const appointmentsService = {
    getUserAppointments: async (userId: number): Promise<Appointment[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/appointments', {
                params: {
                    $filter: `UserId eq ${userId}`,
                    $expand: 'User,Trainer,TimeSlot'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            return response.data.value;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste programari');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea programarilor');
            }
            throw error;
        }
    },

    getAppointmentByStatus: async (userId: number, status: string): Promise<Appointment[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/appointments', {
                params: {
                    $filter: `UserId eq ${userId} and Status eq '${status}'`,
                    $expand: 'User,Trainer,TimeSlot'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            return response.data.value;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste programari');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea programarilor');
            }
            throw error;
        }
    },

    getAppointmentsCount: async (userId: number): Promise<number> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/appointments', {
                params: {
                    $filter: `UserId eq ${userId}`,
                    $select: 'Id'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            return response.data.value.length;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste programari');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea numărului de programari');
            }
            throw error;
        }
    },

    getTrainerAppointments: async (userId: number): Promise<Appointment[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/appointments', {
                params: {
                    $filter: `TrainerId eq ${userId}`,
                    $expand: 'User,Trainer,TimeSlot'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            return response.data.value;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste programari');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea progamarilor');
            }
            throw error;
        }
    },

    createAppointment: async (appointmentsData: Appointment) => {
        try {
            const response = await axios.post("http://localhost:5083/odata/appointments/new",
                appointmentsData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să creezi programari pentru alți utilizatori');
                }
                throw new Error(error.response?.data?.message || 'Eroare la crearea programarii');
            }
            throw error;
        }
    },

    getAppointmentsCountByStatus: async (userId: number, status: string): Promise<number> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/appointments', {
                params: {
                    $filter: `UserId eq ${userId} and Status eq '${status}'`,
                    $select: 'Id'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            return response.data.value.length;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste programari');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea numărului de programari');
            }
            throw error;
        }
    },

    handleCancelAppointment: async (appointmentId: number): Promise<Appointment> => {
        try {
            const response = await axios.put(`http://localhost:5083/odata/appointments/${appointmentId}`,
                { Status: 'Cancelled' },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să anulezi această programare');
                }
                throw new Error(error.response?.data?.message || 'Eroare la anularea programării');
            }
            throw error;
        }
    },


}