import React from 'react';

const DataTable = ({ columns, data, emptyMessage = "No data available", renderRow }) => {
    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase bg-slate-50/50 tracking-wide">
                        {columns.map((col, index) => (
                            <th key={index} className="py-4 px-5">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item, index) => renderRow(item, index))}
                </tbody>
            </table>

            {data.length === 0 && (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl m-4">
                    <p className="text-slate-500 font-medium text-lg">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};

export default DataTable;
