import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useParent } from '@/context/ParentContext';

const ParentFees = ({ currentUser }) => {
    const { selectedChild, isLoading } = useParent();
    const [invoices] = useLocalStorage('invoices', []);

    const childInvoices = useMemo(() =>
        invoices.filter(invoice => invoice.studentId === selectedChild?.id),
        [invoices, selectedChild]
    );

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <h1 className="text-2xl font-bold text-gray-800">Fee History</h1>
                <p className="text-gray-600 mt-1">View and manage {selectedChild?.name}'s fee payments</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                {childInvoices.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-200">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No fee records found</p>
                    </div>
                ) : (
                    childInvoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Invoice #{invoice.id}</p>
                                            <p className="text-sm text-gray-600">{invoice.description}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-11">Due Date: {invoice.dueDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">₹{invoice.amount}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : invoice.status === 'overdue'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default ParentFees;
