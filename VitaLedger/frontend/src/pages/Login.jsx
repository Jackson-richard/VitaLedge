import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Shield, ActivitySquare, LogIn, UserPlus } from 'lucide-react';
import ActionButton from '../components/ActionButton';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'patient' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = isLogin
                ? await authService.login(formData.username, formData.password)
                : await authService.register(formData);

            localStorage.setItem('token', res.access_token);
            localStorage.setItem('role', res.role);
            if (res.user_id) localStorage.setItem('user_id', res.user_id);
            if (res.abha_id) localStorage.setItem('abha_id', res.abha_id);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 w-full h-1/2 bg-blue-600 rounded-b-[100px] shadow-lg opacity-10"></div>
            <div className="absolute top-[20%] left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute top-[10%] right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="p-8 pb-10">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 mb-4 shadow-inner border border-blue-100 flex items-center justify-center">
                            <ActivitySquare size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1">
                            Vita<span className="text-blue-600">Ledger</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 text-sm text-center px-4">
                            Blockchain-secured Electronic Health Records Protocol
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-center text-slate-700 mb-6">
                        {isLogin ? 'Sign in to portal' : 'Create secure account'}
                    </h2>

                    {error && (
                        <div className="p-4 mb-6 text-sm font-medium text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                            <Shield className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white"
                                value={formData.username}
                                placeholder="Enter your username"
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                <span>Password</span>
                                {isLogin && <a href="#" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">Forgot?</a>}
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white"
                                value={formData.password}
                                placeholder="Enter your password"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Role Context</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer font-medium text-slate-700 bg-slate-50"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="patient">Patient Context</option>
                                    <option value="doctor">Medical Professional Context</option>
                                    <option value="admin">System Admin Context</option>
                                </select>
                            </div>
                        )}

                        <div className="pt-2">
                            <ActionButton
                                type="submit"
                                className="w-full py-3"
                                icon={isLogin ? LogIn : UserPlus}
                                loading={loading}
                            >
                                {isLogin ? 'Authenticate Securely' : 'Provision Account'}
                            </ActionButton>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 p-6 text-center text-sm font-medium border-t border-slate-100 flex items-center justify-center gap-2">
                    <span className="text-slate-500">
                        {isLogin ? "Don't have an account? " : "Already registered? "}
                    </span>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                        {isLogin ? 'Register now' : 'Sign in instead'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
