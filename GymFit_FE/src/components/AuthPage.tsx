import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ isSingin }: { isSingin: boolean }) {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = isSingin ? "login" : "register";
        const data = isSingin
            ? { email, password }
            : { name, phoneNumber, dateOfBirth, email, password };

        try {
            const response = await axios.post(`http://localhost:5083/odata/auth/${endpoint}`, data);

            if (isSingin) {
                login(response.data.token);
                navigate('/dashboard');
            } else {
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data || 'A apărut o eroare la comunicarea cu serverul');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-black text-center mb-4">
                    {isSingin ? "Sign In" : "Sign Up"}
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isSingin && (
                        <>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white p-3 rounded"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white p-3 rounded"
                                required
                            />
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white p-3 rounded"
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white p-3 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white p-3 rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
                    >
                        {isSingin ? "Sign In" : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}