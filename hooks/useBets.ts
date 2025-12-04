import { useState, useEffect, useCallback } from 'react';
import { Bet, BetStatus } from '../types';
import * as sheetService from '../services/googleSheetService';

export const useBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBetId, setUpdatingBetId] = useState<string | null>(null);

  const syncBets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBets = await sheetService.fetchBets();
      setBets(fetchedBets);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred while fetching bets.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only sync if a URL is present
    if (sheetService.getGoogleSheetUrl()) {
      syncBets();
    } else {
      setIsLoading(false); // No URL, so stop loading
    }
  }, [syncBets]);

  const addBet = async (betData: Omit<Bet, 'id' | 'payout'>) => {
    try {
      const newBet = await sheetService.addBet(betData);
      setBets(prevBets => [newBet, ...prevBets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to add bet: ${e.message}`);
      } else {
         setError('An unknown error occurred while adding the bet.');
      }
      console.error(e);
      // Re-throw to inform the caller
      throw e;
    }
  };
  
  const updateBetDetails = async (betData: Omit<Bet, 'payout'>) => {
    setUpdatingBetId(betData.id);
    try {
      const updatedBet = await sheetService.editBet(betData);
      setBets(prevBets => prevBets.map(b => (b.id === betData.id ? updatedBet : b))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to update bet: ${e.message}`);
      } else {
         setError('An unknown error occurred while updating the bet.');
      }
      console.error(e);
      throw e;
    } finally {
      setUpdatingBetId(null);
    }
  };

  const updateBetStatus = async (id: string, newStatus: BetStatus) => {
    setUpdatingBetId(id);
    try {
      const updatedBet = await sheetService.updateBet(id, newStatus);
      setBets(prevBets => prevBets.map(b => (b.id === id ? updatedBet : b)));
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to update bet status: ${e.message}`);
      } else {
        setError('An unknown error occurred while updating the bet.');
      }
      console.error(e);
    } finally {
      setUpdatingBetId(null);
    }
  };

  const deleteBet = async (id: string) => {
    setUpdatingBetId(id);
    try {
      await sheetService.deleteBet(id);
      setBets(prevBets => prevBets.filter(b => b.id !== id));
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to delete bet: ${e.message}`);
      } else {
        setError('An unknown error occurred while deleting the bet.');
      }
      console.error(e);
    } finally {
      setUpdatingBetId(null);
    }
  };

  return {
    bets,
    isLoading,
    error,
    updatingBetId,
    syncBets,
    addBet,
    updateBetStatus,
    deleteBet,
    updateBetDetails,
    setBetsError: setError,
  };
};