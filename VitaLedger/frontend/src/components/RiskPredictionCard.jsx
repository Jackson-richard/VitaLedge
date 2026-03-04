import React from 'react';
import { ActivitySquare } from 'lucide-react';

const RiskPredictionCard = ({ aiResult }) => {
    if (!aiResult) return null;

    const isHighRisk = aiResult.risk_score_percentage >= 70;
    const isModerateRisk = aiResult.risk_score_percentage >= 40 && aiResult.risk_score_percentage < 70;

    let theme = 'bg-green-50 border-green-200 text-green-800';
    let barColor = 'bg-green-500';
    if (isHighRisk) {
        theme = 'bg-red-50 border-red-200 text-red-800';
        barColor = 'bg-red-500';
    } else if (isModerateRisk) {
        theme = 'bg-yellow-50 border-yellow-200 text-yellow-800';
        barColor = 'bg-yellow-500';
    }

    return (
        <div className={`p-5 rounded-xl border ${theme} shadow-sm transition-all`}>
            <div className="flex items-center gap-2 mb-3">
                <ActivitySquare className="opacity-80" />
                <h3 className="text-lg font-bold">Risk Assessment Score: {aiResult.risk_score_percentage}%</h3>
            </div>

            <div className="w-full bg-white rounded-full h-2.5 mb-4 border border-slate-200 overflow-hidden">
                <div className={`h-2.5 rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${aiResult.risk_score_percentage}%` }}></div>
            </div>

            <p className="text-sm font-medium opacity-90 leading-relaxed">
                {aiResult.recommendation}
            </p>
        </div>
    );
};

export default RiskPredictionCard;
