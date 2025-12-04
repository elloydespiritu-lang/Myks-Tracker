import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBets } from './hooks/useBets';
import { useTransactions } from './hooks/useTransactions';
import { DashboardStats } from './components/DashboardStats';
import { BetList } from './components/BetList';
import { TransactionList } from './components/TransactionList';
import { Modal } from './components/Modal';
import { AddBetForm } from './components/AddBetForm';
import { AddTransactionForm } from './components/AddTransactionForm';
import { SettingsForm } from './components/SettingsForm';
import { Filters } from './components/Filters';
import { Pagination } from './components/Pagination';
import { Icon } from './components/Icon';
import { Spinner } from './components/Spinner';
import { Logo } from './components/Logo';
import { setGoogleSheetUrl, getGoogleSheetUrl } from './services/googleSheetService';
import { Bet, TransactionType, BetStatus } from './types';

type ActiveView = 'bets' | 'transactions';

export default function App() {
  const { bets, isLoading: isLoadingBets, updatingBetId, syncBets, addBet, updateBetStatus, deleteBet, updateBetDetails, error: betsError, setBetsError } = useBets();
  const { transactions, isLoading: isLoadingTransactions, syncTransactions, addTransaction, error: transactionsError, setTransactionsError } = useTransactions();
  
  const [activeView, setActiveView] = useState<ActiveView>('bets');
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [betToEdit, setBetToEdit] = useState<Bet | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<BetStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const appError = betsError || transactionsError;
  const isLoading = isLoadingBets || isLoadingTransactions;

  const stats = useMemo(() => {
    // Bet stats
    const wonBets = bets.filter(b => b.status === BetStatus.WON);
    const lostBets = bets.filter(b => b.status === BetStatus.LOST);
    const pendingBets = bets.filter(b => b.status === BetStatus.PENDING);

    const totalPayout = wonBets.reduce((sum, bet) => sum + bet.payout, 0);
    const totalWonStake = wonBets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalLostStake = lostBets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalPendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);
    
    const netProfit = totalPayout - totalWonStake - totalLostStake;
    
    const totalSettledStake = totalWonStake + totalLostStake;
    const roi = totalSettledStake > 0 ? (netProfit / totalSettledStake) * 100 : 0;
    
    const wonCount = wonBets.length;
    const lostCount = lostBets.length;
    const totalSettledCount = wonCount + lostCount;
    const winRate = totalSettledCount > 0 ? (wonCount / totalSettledCount) * 100 : 0;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.stake, 0);
    
    // Transaction stats
    const totalDeposits = transactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalWithdrawals = transactions
      .filter(t => t.type === TransactionType.WITHDRAW)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const equity = totalDeposits - totalWithdrawals + netProfit;
    const balance = equity - totalPendingStake;

    return { 
      totalWagered, 
      netProfit, 
      roi, 
      winRate, 
      balance, 
      totalDeposits, 
      totalWithdrawals
    };
  }, [bets, transactions]);

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      // Status filter
      const statusMatch = statusFilter === 'all' || bet.status === statusFilter;

      // Date filter
      const betDate = new Date(bet.createdAt);
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

      if(fromDate) fromDate.setHours(0, 0, 0, 0); // Start of day
      if(toDate) toDate.setHours(23, 59, 59, 999); // End of day

      const dateMatch = (!fromDate || betDate >= fromDate) && (!toDate || betDate <= toDate);
      
      return statusMatch && dateMatch;
    });
  }, [bets, statusFilter, dateFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredBets.length / itemsPerPage), [filteredBets.length, itemsPerPage]);

  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBets, currentPage, itemsPerPage]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, itemsPerPage]);

  // Ensure current page is valid if total pages change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // On initial load, check if URL is configured. If not, open settings.
  useEffect(() => {
    if (!getGoogleSheetUrl()) {
        setIsSettingsModalOpen(true);
    }
  }, []);

  const handleOpenAddBetModal = () => {
    setBetToEdit(undefined);
    setIsBetModalOpen(true);
  };

  const handleOpenEditBetModal = (bet: Bet) => {
    setBetToEdit(bet);
    setIsBetModalOpen(true);
  };
  
  const handleOpenTransactionModal = (type: TransactionType) => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  }

  const handleCloseModals = () => {
    setIsBetModalOpen(false);
    setIsTransactionModalOpen(false);
    setTimeout(() => {
      setBetToEdit(undefined);
      setTransactionType(null);
    }, 300);
  };

  const handleSaveSettings = (url: string) => {
    setGoogleSheetUrl(url);
    setIsSettingsModalOpen(false);
    syncAllData();
  };

  const syncAllData = useCallback(() => {
    syncBets();
    syncTransactions();
  }, [syncBets, syncTransactions]);
  
  const handleDateChange = (type: 'from' | 'to', date: string) => {
    setDateFilter(prev => ({ ...prev, [type]: date }));
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter({ from: '', to: '' });
  };


  const handleSaveBet = async (formData: Parameters<typeof addBet>[0] | Parameters<typeof updateBetDetails>[0]) => {
      try {
        if ('id' in formData) {
            await updateBetDetails(formData);
        } else {
            await addBet(formData);
        }
        handleCloseModals();
      } catch (err) {
        console.error("Failed to save bet from form.");
      }
  };

  const handleSaveTransaction = async (formData: Parameters<typeof addTransaction>[0]) => {
    try {
      await addTransaction(formData);
      handleCloseModals();
    } catch (err) {
      console.error("Failed to save transaction from form.");
    }
  }

  const isUrlError = appError && (appError.includes("URL is not configured") || appError.includes("invalid Apps Script URL"));
  
  const NavButton: React.FC<{view: ActiveView, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors w-full sm:w-auto ${activeView === view ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-700 gap-4">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <h1 className="text-3xl font-bold text-white text-center sm:text-left">Myks Tracker</h1>
          </div>
          <div className="flex items-center justify-end flex-wrap gap-2">
            <button onClick={syncAllData} disabled={isLoading} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50" title="Sync Data" aria-label="Sync all data from Google Sheet">
              {isLoading && !updatingBetId ? <Spinner size="sm"/> : <Icon type="Sync" className="w-5 h-5"/>}
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Settings" aria-label="Open settings">
                <Icon type="Settings" className="w-5 h-5"/>
            </button>
          </div>
        </header>

        {!getGoogleSheetUrl() && !appError && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Configuration Needed: </strong>
                <span className="block sm:inline">Please set your Google Sheet Web App URL in the settings.</span>
                <button onClick={() => setIsSettingsModalOpen(true)} className="ml-2 py-1 px-2 text-sm underline rounded-md hover:bg-yellow-800/50">Open Settings</button>
            </div>
        )}

        {appError && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{appError}</span>
              {isUrlError && 
                <button onClick={() => setIsSettingsModalOpen(true)} className="ml-2 py-1 px-2 text-sm underline rounded-md hover:bg-red-800/50">Open Settings</button>
              }
            </div>
        )}

        <main>
          <DashboardStats stats={stats} />

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex w-full sm:w-auto bg-gray-800 p-1 rounded-lg space-x-1">
                <NavButton view="bets" label="Bets" icon={<Icon type="Trophy" className="w-5 h-5"/>} />
                <NavButton view="transactions" label="Transactions" icon={<Icon type="Wallet" className="w-5 h-5"/>}/>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 {activeView === 'bets' ? (
                     <button onClick={handleOpenAddBetModal} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full" title="Add a new bet">
                       <Icon type="Plus" className="w-5 h-5"/>
                       <span>Add New Bet</span>
                     </button>
                 ) : (
                   <>
                    <button onClick={() => handleOpenTransactionModal(TransactionType.DEPOSIT)} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full" title="Add a new deposit">
                       <Icon type="ArrowUpCircle" className="w-5 h-5"/>
                       <span>Deposit</span>
                     </button>
                     <button onClick={() => handleOpenTransactionModal(TransactionType.WITHDRAW)} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors w-full" title="Add a new withdrawal">
                       <Icon type="ArrowDownCircle" className="w-5 h-5"/>
                       <span>Withdraw</span>
                     </button>
                   </>
                 )}
              </div>
          </div>
          
          {activeView === 'bets' ? (
             <>
               <Filters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                dateFilter={dateFilter}
                onDateChange={handleDateChange}
                onClear={handleClearFilters}
                resultCount={filteredBets.length}
                totalCount={bets.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                currentPage={currentPage}
              />
               <BetList 
                  bets={paginatedBets} 
                  isLoading={isLoadingBets && bets.length === 0} 
                  updatingBetId={updatingBetId}
                  onUpdateStatus={updateBetStatus} 
                  onDelete={deleteBet}
                  onEdit={handleOpenEditBetModal}
                  totalBetsCount={bets.length}
                />
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
             </>
          ) : (
            <TransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions && transactions.length === 0}
            />
          )}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by React, Tailwind CSS, and Google Sheets.</p>
        </footer>

      </div>

      <Modal isOpen={isBetModalOpen} onClose={handleCloseModals} title={betToEdit ? 'Edit Bet' : 'Add a New Bet'}>
        <AddBetForm onSave={handleSaveBet} onClose={handleCloseModals} betToEdit={betToEdit} currentBalance={stats.balance} />
      </Modal>

      <Modal isOpen={isTransactionModalOpen} onClose={handleCloseModals} title={transactionType === TransactionType.DEPOSIT ? 'Add Deposit' : 'Add Withdrawal'}>
        {transactionType && <AddTransactionForm type={transactionType} onSave={handleSaveTransaction} onClose={handleCloseModals} currentBalance={stats.balance} />}
      </Modal>

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Settings">
        <SettingsForm onSave={handleSaveSettings} onClose={() => setIsSettingsModalOpen(false)} />
      </Modal>

    </div>
  );
}
