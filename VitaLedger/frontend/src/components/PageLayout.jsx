import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageLayout = ({ role, onLogout, title, subtitle, children }) => {
    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans">
            <Navbar role={role} onLogout={onLogout} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-10 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                            {subtitle && <p className="text-slate-500 font-medium mt-1">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PageLayout;
