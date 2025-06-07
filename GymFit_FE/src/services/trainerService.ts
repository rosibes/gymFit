import axios from "axios";
import type { Trainer } from "../types/trainer";

export const trainerService = {
    getTrainersBySpecialization: async (specialization: string): Promise<Trainer[]> => {
        try {
            const response = await axios.get(
                `http://localhost:5083/odata/trainer?$filter=Specialization eq '${specialization}'&$expand=User`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('OData Response:', response.data);
            // OData returns data directly as an array
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            console.error('Error fetching trainers:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch trainers');
        }
    }
}; 