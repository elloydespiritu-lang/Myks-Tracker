import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType } from '../types';
import * as sheetService from '../services/googleSheetService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const syncTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await sheetService.fetchTransactions();
      setTransactions(fetchedTransactions);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred while fetching transactions.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only sync if a URL is present
    if (sheetService.getGoogleSheetUrl()) {
      syncTransactions();
    } else {
      setIsLoading(false); // No URL, so stop loading
    }
  }, [syncTransactions]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await sheetService.addTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to add transaction: ${e.message}`);
      } else {
         setError('An unknown error occurred while adding the transaction.');
      }
      console.error(e);
      // Re-throw to inform the caller
      throw e;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    syncTransactions,
    addTransaction,
    setTransactionsError: setError,
  };
};
