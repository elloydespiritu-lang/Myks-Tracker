
import React, { useState, useEffect } from 'react';
import { Bet, BetStatus } from '../types';
import { Spinner } from './Spinner';

type BetFormData = Omit<Bet, 'id' | 'payout'>;
type EditableBet = Omit<Bet, 'payout'>;

interface AddBetFormProps {
  onSave: (bet: BetFormData | EditableBet) => Promise<void>;
  onClose: () => void;
  betToEdit?: Bet;
  currentBalance: number;
}

/**
 * Converts a date to a 'YYYY-MM-DD' string suitable for an <input type="date">.
 * It correctly handles timezone offsets to prevent the date from being off by one day.
 * @param isoString - An optional ISO date string. If not provided, uses the current date.
 * @returns {string} The date formatted as 'YYYY-MM-DD'.
 */
const toInputDateString = (isoString?: string): string => {
  const date = isoString ? new Date(isoString) : new Date();
  // Adjust for the timezone offset to get the correct local date string
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 10);
};


export const AddBetForm: React.FC<AddBetFormProps> = ({ onSave, onClose, betToEdit, currentBalance }) => {
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState('1000');
  const [odds, setOdds] = useState('2.0');
  const [status, setStatus] = useState<BetStatus>(BetStatus.PENDING);
  const [createdAt, setCreatedAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!betToEdit;

  useEffect(() => {
    if (isEditing) {
      setDescription(betToEdit.description);
      setStake(betToEdit.stake.toString());
      setOdds(betToEdit.odds.toString());
      setStatus(betToEdit.status);
      setCreatedAt(toInputDateString(betToEdit.createdAt));
    } else {
      // Reset form for adding
      setDescription('');
      setStake('1000');
      setOdds('2.0');
      setStatus(BetStatus.PENDING);
      setCreatedAt(toInputDateString());
    }
  }, [betToEdit, isEditing]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);

    if (!description || !stake || !odds || isNaN(stakeNum) || isNaN(oddsNum) || stakeNum <= 0 || oddsNum <= 1 || !createdAt) {
      setError('Please fill in all fields with valid values. Stake must be > 0 and Odds > 1.');
      return;
    }

    if (!isEditing && stakeNum > currentBalance) {
      setError(`Your stake of ₱${stakeNum.toFixed(2)} cannot exceed your available balance of ₱${currentBalance.toFixed(2)}.`);
      return;
    }
    
    setIsSubmitting(true);

    // Convert 'YYYY-MM-DD' back to a full ISO string. Appending 'T00:00:00Z' treats the date as UTC midnight,
    // which prevents timezone-related bugs where the date could shift by a day.
    const betData = { 
        description, 
        stake: stakeNum, 
        odds: oddsNum, 
        status, 
        createdAt: new Date(createdAt + 'T00:00:00Z').toISOString() 
    };

    try {
        if (isEditing) {
          await onSave({ ...betData, id: betToEdit.id });
        } else {
          await onSave(betData);
        }
        onClose();
    } catch (err) {
        // Error is handled in the hook, just stop submitting
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
      
       {!isEditing && (
        <div className="bg-gray-700/50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-400">Available Balance</p>
            <p className="text-lg font-semibold text-blue-400">₱{currentBalance.toFixed(2)}</p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Bet Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Real Madrid to win Champions League"
          required
        />
      </div>

       <div>
        <label htmlFor="createdAt" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
        <input
            id="createdAt"
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label htmlFor="stake" className="block text-sm font-medium text-gray-300 mb-1">Stake (₱)</label>
          <input
            id="stake"
            type="number"
            step="0.01"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000.00"
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="odds" className="block text-sm font-medium text-gray-300 mb-1">Odds (Decimal)</label>
          <input
            id="odds"
            type="number"
            step="0.0001"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2.0"
            required
          />
        </div>
      </div>
      
       <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as BetStatus)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={BetStatus.PENDING}>Pending</option>
          <option value={BetStatus.WON}>Won</option>
          <option value={BetStatus.LOST}>Lost</option>
        </select>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Spinner size="sm" />}
          <span className="ml-2">{isEditing ? 'Save Changes' : 'Add Bet'}</span>
        </button>
      </div>
    </form>
  );
};
