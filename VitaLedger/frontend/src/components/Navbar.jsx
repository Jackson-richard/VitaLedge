import React from 'react';
import { ActivitySquare, LogOut } from 'lucide-react';

const Navbar = ({ role, onLogout }) => {
    return (
        <nav className="bg-white border-b border-slate-200 px-6 h-[70px] flex justify-between items-center shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-[1.02]">
                <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
                    <ActivitySquare className="text-white" size={24} />
                </div>
                <span className="text-slate-800 font-extrabold text-2xl tracking-tight">Vita<span className="text-blue-600">Ledger</span></span>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${role}&backgroundColor=2563eb`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 capitalize leading-tight">{role} User</span>
                        <span className="text-xs text-blue-600 font-semibold leading-tight">Verified Node</span>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-semibold text-sm px-4 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                >
                    <LogOut size={18} /> <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
