import React from 'react';
import { Bet, BetStatus } from '../types';
import { Icon } from './Icon';

interface BetItemProps {
  bet: Bet;
  startBalance?: number;
  endingBalance?: number;
  onUpdateStatus: (id: string, status: BetStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (bet: Bet) => void;
  isUpdating: boolean;
}

const statusPillStyles: { [key in BetStatus]: { bg: string; text: string; icon: React.ReactNode } } = {
  [BetStatus.PENDING]: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', icon: <Icon type="Hourglass" className="w-5 h-5" /> },
  [BetStatus.WON]: { bg: 'bg-green-900/50', text: 'text-green-300', icon: <Icon type="Trophy" className="w-5 h-5" /> },
  [BetStatus.LOST]: { bg: 'bg-red-900/50', text: 'text-red-300', icon: <Icon type="ThumbDown" className="w-5 h-5" /> },
};

const statusRowStyles: { [key in BetStatus]: { border: string; hover: string; } } = {
  [BetStatus.PENDING]: { border: 'border-l-4 border-transparent', hover: 'hover:bg-gray-800/50' },
  [BetStatus.WON]: { border: 'border-l-4 border-green-500', hover: 'hover:bg-green-900/40' },
  [BetStatus.LOST]: { border: 'border-l-4 border-red-500', hover: 'hover:bg-red-900/40' },
};

export const BetItem: React.FC<BetItemProps> = ({ bet, startBalance, endingBalance, onUpdateStatus, onDelete, onEdit, isUpdating }) => {
  const pillStyle = statusPillStyles[bet.status];
  const rowStyle = statusRowStyles[bet.status];

  // Format date only, treating it as UTC to avoid timezone-related day shifts.
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(bet.createdAt));

  const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className: string; title: string; ariaLabel: string }> = ({ onClick, children, className, title, ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={`p-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );

  return (
    <tr className={`border-b border-gray-700 transition-colors ${rowStyle.border} ${rowStyle.hover}`}>
      <td className="p-4 align-top">
        <p className="font-semibold text-white">{bet.description}</p>
      </td>
      <td className="p-4 align-top text-sm text-gray-400 whitespace-nowrap">
        {formattedDate}
      </td>
      <td className="p-4 align-top text-right text-gray-400 whitespace-nowrap">
        ₱{startBalance !== undefined ? startBalance.toFixed(2) : '-'}
      </td>
      <td className="p-4 align-top text-right text-gray-300 whitespace-nowrap">
        ₱{bet.stake.toFixed(2)}
      </td>
      <td className="p-4 align-top text-right text-gray-300 whitespace-nowrap">
        @{bet.odds}
      </td>
      <td className="p-4 align-top text-right text-gray-300 whitespace-nowrap">
        ₱{(bet.stake * bet.odds).toFixed(2)}
      </td>
      <td className="p-4 align-top text-right text-gray-300 whitespace-nowrap font-medium">
        ₱{endingBalance !== undefined ? endingBalance.toFixed(2) : '-'}
      </td>
      <td className="p-4 align-top text-center">
        <div className={`flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${pillStyle.bg} ${pillStyle.text}`}>
          {pillStyle.icon}
          <span>{bet.status}</span>
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="flex items-center justify-end space-x-2">
           {bet.status === BetStatus.PENDING && (
            <>
              <ActionButton onClick={() => onUpdateStatus(bet.id, BetStatus.WON)} className="bg-green-500/20 text-green-300 hover:bg-green-500/40" title="Mark as Won" ariaLabel={`Mark bet ${bet.id} as won`}>
                <Icon type="Trophy" className="w-5 h-5" />
              </ActionButton>
              <ActionButton onClick={() => onUpdateStatus(bet.id, BetStatus.LOST)} className="bg-red-500/20 text-red-300 hover:bg-red-500/40" title="Mark as Lost" ariaLabel={`Mark bet ${bet.id} as lost`}>
                <Icon type="ThumbDown" className="w-5 h-5" />
              </ActionButton>
            </>
          )}
           <ActionButton onClick={() => onEdit(bet)} className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/40" title="Edit Bet" ariaLabel={`Edit bet ${bet.id}`}>
            <Icon type="Edit" className="w-5 h-5" />
          </ActionButton>
          <ActionButton onClick={() => onDelete(bet.id)} className="bg-gray-600/50 text-gray-300 hover:bg-gray-500/50" title="Delete Bet" ariaLabel={`Delete bet ${bet.id}`}>
            <Icon type="Trash" className="w-5 h-5" />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
};