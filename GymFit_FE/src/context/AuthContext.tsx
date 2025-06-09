import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    userRole: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);


    const fetchUser = async (token: string) => {
        try {
            const response = await axios.get('http://localhost:5083/odata/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUser(response.data);
            console.log(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError('Failed to fetch user data');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await fetchUser(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 