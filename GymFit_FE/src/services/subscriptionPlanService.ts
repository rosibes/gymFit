import axios from "axios";
import type { SubscriptionPlan } from "../types/subscriptionPlan";

export const subscriptionPlanService = {
    getAll: async (): Promise<SubscriptionPlan[]> => {
        try {
            const response = await axios.get('http://localhost:5083/odata/SubscriptionPlans', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.value;
        } catch (error) {
            throw error;
        }
    },

    create: async (subscriptionPlan: SubscriptionPlan): Promise<SubscriptionPlan> => {
        try {
            const response = await axios.post('http://localhost:5083/odata/SubscriptionPlans', subscriptionPlan, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    throw new Error('Nu ai permisiunea să creezi un plan de abonament');
                }
                throw new Error(error.response?.data?.message || 'Eroare la crearea planului de abonament');
            }
            throw error;
        }
    }
};