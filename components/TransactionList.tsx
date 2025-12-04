import React from 'react';
import { Transaction } from '../types';
import { TransactionItem } from './TransactionItem';
import { Spinner } from './Spinner';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white">No Transactions Yet!</h3>
        <p className="text-gray-400 mt-2">Click "Deposit" or "Withdraw" to start tracking your funds.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-auto max-h-[70vh] shadow-inner relative custom-scrollbar">
      <table className="min-w-full relative border-collapse">
        <thead className="bg-gray-800 sticky top-0 z-10 shadow-md">
          <tr>
            <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12"></th>
            <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type & Date</th>
            <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </tbody>
      </table>
    </div>
  );
};