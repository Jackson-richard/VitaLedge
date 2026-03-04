import React from 'react';
import { Loader2 } from 'lucide-react';

const ActionButton = ({ onClick, type = "button", variant = "primary", icon: Icon, children, className = '', disabled = false, loading = false }) => {

    const baseStyle = "relative overflow-hidden font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 outline-none group";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:bg-blue-800 border border-transparent",
        secondary: "bg-sky-100 text-blue-700 hover:bg-sky-200 border border-sky-200 shadow-sm",
        danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm",
        demo: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2 animate-pulse",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none hover:text-slate-900 border border-transparent"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled || loading}
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (Icon && <Icon size={18} className={`transition-transform ${!disabled ? 'group-hover:scale-110' : ''}`} />)}
            {children}
        </button>
    );
};

export default ActionButton;
