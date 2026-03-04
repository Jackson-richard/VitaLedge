import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import ActionButton from './ActionButton';

const BlockchainVerifyButton = ({ chainStatus, onVerify }) => {
    return (
        <div className="flex flex-col gap-4">
            <ActionButton
                onClick={onVerify}
                variant="demo"
                icon={ShieldCheck}
                className="w-full py-3"
            >
                Verify Blockchain Integrity
            </ActionButton>

            {chainStatus && (
                <div className={`p-4 rounded-xl border-l-4 ${chainStatus.status === 'valid' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
                    <h3 className="font-bold mb-1 flex items-center gap-2">
                        {chainStatus.status === 'valid' ? <ShieldCheck className="text-green-600" /> : <ShieldAlert className="text-red-600" />}
                        {chainStatus.status === 'valid' ? 'Chain is Valid' : 'Integrity Violation Detected'}
                    </h3>
                    {chainStatus.status !== 'valid' && (
                        <p className="text-sm mt-2 opacity-90">
                            Block {chainStatus.block_index} failed verification: {chainStatus.reason}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlockchainVerifyButton;
