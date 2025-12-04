import React, { useState } from 'react';
import { TransactionType } from '../types';
import { Spinner } from './Spinner';

interface AddTransactionFormProps {
  type: TransactionType;
  onSave: (transaction: { type: TransactionType, amount: number, description: string }) => Promise<void>;
  onClose: () => void;
  currentBalance: number;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ type, onSave, onClose, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDeposit = type === TransactionType.DEPOSIT;
  const isWithdrawal = type === TransactionType.WITHDRAW;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    
    if (isWithdrawal && amountNum > currentBalance) {
      setError(`Withdrawal amount cannot exceed your current balance of ₱${currentBalance.toFixed(2)}.`);
      return;
    }
    
    setIsSubmitting(true);

    try {
        await onSave({ type, amount: amountNum, description });
        onClose();
    } catch (err) {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
      
      {isWithdrawal && (
        <div className="bg-gray-700/50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-lg font-semibold text-blue-400">₱{currentBalance.toFixed(2)}</p>
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
          Amount (₱)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="5000.00"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description (Optional)
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={isDeposit ? "e.g., Payday deposit" : "e.g., Bank transfer"}
        />
      </div>

      <div className="flex justify-end pt-2 space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 text-white rounded-md transition-colors flex items-center disabled:cursor-not-allowed ${
            isDeposit ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
          }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          <span className="ml-2">{isDeposit ? 'Add Deposit' : 'Add Withdrawal'}</span>
        </button>
      </div>
    </form>
  );
};