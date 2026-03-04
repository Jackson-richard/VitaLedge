import React from 'react';

const Card = ({ children, title, icon: Icon, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden transition-all hover:shadow-lg ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    {Icon && <div className="p-1.5 bg-blue-100/50 rounded-lg text-blue-600"><Icon size={20} /></div>}
                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;
