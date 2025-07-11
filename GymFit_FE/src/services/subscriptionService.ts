import axios from "axios"
import type { Subscription } from "../types/subscription"

export const subscriptionService = {
    getUserSubscriptions: async (userId: number): Promise<Subscription[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/subscriptions', {
                params: {
                    $filter: `UserId eq ${userId}`,
                    $expand: 'User'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.value;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste abonamente');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea abonamentelor');
            }
            throw error;
        }
    },
    getSubscriptionsCount: async (userId: number): Promise<number> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/subscriptions', {
                params: {
                    $filter: `UserId eq ${userId}`,
                    $select: 'Id'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.value.length;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să accesezi aceste abonamente');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea numărului de abonamente');
            }
            throw error;
        }
    },

    createSubscription: async (subscription: Subscription): Promise<Subscription> => {
        try {
            const response = await axios.post('http://localhost:5083/odata/subscriptions', subscription, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să creezi un abonament');
                }
                else {
                    if (error.response?.data?.error === "Duplicate subscription") {
                        throw new Error('Subscription already exists');
                    }
                }
            }
            throw error;
        }
    },


    getAllSubscriptions: async (): Promise<Subscription[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/subscriptions', {
                params: {
                    $expand: 'User'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.value;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să vezi toate abonamentele');
                }
                throw new Error(error.response?.data?.message || 'Eroare la obținerea abonamentelor');
            }
            throw error;
        }
    },

    deleteSubscription: async (id: number): Promise<void> => {
        try {
            await axios.delete(`http://localhost:5083/odata/subscriptions/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('You are not authorized to delete this subscription');
                }
                throw new Error(error.response?.data?.message || 'Error deleting subscription');
            }
        }
    }
}