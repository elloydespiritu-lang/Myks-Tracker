import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Icon } from './Icon';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isDeposit = transaction.type === TransactionType.DEPOSIT;

  const style = {
    icon: isDeposit ? <Icon type="ArrowUpCircle" className="w-6 h-6 text-green-400" /> : <Icon type="ArrowDownCircle" className="w-6 h-6 text-red-400" />,
    textColor: isDeposit ? 'text-green-400' : 'text-red-400',
    sign: isDeposit ? '+' : '-',
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(transaction.createdAt));

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="p-4 w-12 text-center">{style.icon}</td>
      <td className="p-4">
        <p className="font-semibold text-white">{transaction.type}</p>
        <p className="text-sm text-gray-400">{formattedDate}</p>
      </td>
      <td className="p-4 text-gray-300">{transaction.description || <span className="text-gray-500">No description</span>}</td>
      <td className={`p-4 text-right font-semibold text-lg ${style.textColor}`}>
        {style.sign} ₱{transaction.amount.toFixed(2)}
      </td>
    </tr>
  );
};
