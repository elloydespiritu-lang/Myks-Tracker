import React from 'react';
import { Bet, BetStatus } from '../types';
import { BetItem } from './BetItem';
import { Spinner } from './Spinner';

interface BetListProps {
  bets: Bet[];
  isLoading: boolean;
  updatingBetId: string | null;
  onUpdateStatus: (id: string, status: BetStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (bet: Bet) => void;
  totalBetsCount: number;
}

export const BetList: React.FC<BetListProps> = ({ bets, isLoading, updatingBetId, onUpdateStatus, onDelete, onEdit, totalBetsCount }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white">
          {totalBetsCount === 0 ? 'No Bets Yet!' : 'No Bets Match Filters'}
        </h3>
        <p className="text-gray-400 mt-2">
           {totalBetsCount === 0 
            ? 'Click "Add New Bet" to start tracking your wagers.'
            : 'Try adjusting or clearing your filters to see more bets.'
           }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-auto max-h-[70vh] shadow-inner relative custom-scrollbar">
      <table className="min-w-full relative border-collapse">
        <thead className="bg-gray-800 sticky top-0 z-10 shadow-md">
          <tr>
            <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bet</th>
            <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Stake</th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Odds</th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Payout</th>
            <th scope="col" className="p-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {bets.map(bet => (
            <BetItem 
              key={bet.id}
              bet={bet}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onEdit={onEdit}
              isUpdating={updatingBetId === bet.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};