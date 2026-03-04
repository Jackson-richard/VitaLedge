import React from 'react';
import { NavLink } from 'react-router-dom';
import { ActivitySquare, FileText, ShieldCheck, BrainCircuit, Activity, Settings } from 'lucide-react';

const Sidebar = () => {
    const role = localStorage.getItem('role') || 'patient';

    const getTabsForRole = () => {
        if (role === 'doctor') {
            return [
                { name: "Dashboard", path: "/dashboard", icon: <Activity size={20} /> },
                { name: "Patients", path: "/patients", icon: <FileText size={20} /> },
                { name: "Blockchain Status", path: "/blockchain", icon: <ShieldCheck size={20} /> },
            ];
        } else if (role === 'patient') {
            return [
                { name: "My Profile", path: "/dashboard", icon: <Activity size={20} /> },
                { name: "Doctor Requests", path: "/requests", icon: <ShieldCheck size={20} /> },
                { name: "My Medical Records", path: "/records", icon: <FileText size={20} /> },
            ];
        } else if (role === 'admin') {
            return [
                { name: "Dashboard", path: "/dashboard", icon: <Activity size={20} /> },
                { name: "Blockchain Status", path: "/blockchain", icon: <ShieldCheck size={20} /> },
            ];
        }
        return [];
    };

    const tabs = getTabsForRole();

    return (
        <aside className="w-72 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] border-r border-slate-200 h-full hidden md:flex flex-col py-6 px-4">
            <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-3">Menu</p>
            </div>
            <nav className="flex-1 space-y-2">
                {tabs.map((tab, i) => (
                    <NavLink
                        key={i}
                        to={tab.path}
                        end
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 border border-transparent hover:border-slate-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`${isActive ? 'text-white' : 'text-slate-400'} group-hover:text-blue-600`}>
                                    {tab.icon}
                                </div>
                                <span className="text-[15px]">{tab.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto p-5 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center shadow-inner">
                <ShieldCheck size={28} className="text-blue-600 mb-3" />
                <p className="text-sm font-bold text-slate-800">Secured Node</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Connected to Mainnet</p>
            </div>
        </aside>
    );
};

export default Sidebar;
