import { Bet, BetStatus, Transaction, TransactionType } from '../types';

// The key used to store the Google Sheet URL in localStorage.
const URL_STORAGE_KEY = 'googleSheetWebAppUrl';

// --- Configuration Functions ---

/**
 * Retrieves the Google Sheet Web App URL from localStorage.
 * @returns {string | null} The URL if it exists, otherwise null.
 */
export const getGoogleSheetUrl = (): string | null => {
  return localStorage.getItem(URL_STORAGE_KEY);
};

/**
 * Saves the Google Sheet Web App URL to localStorage.
 * @param {string} url - The URL to save.
 */
export const setGoogleSheetUrl = (url: string): void => {
  localStorage.setItem(URL_STORAGE_KEY, url);
};


// --- API Service Functions ---

// Helper function to handle fetch requests to our Google Apps Script
async function postToSheet(action: string, payload?: object): Promise<any> {
  const webAppUrl = getGoogleSheetUrl();
  
  if (!webAppUrl) {
    throw new Error("Google Sheet URL is not configured. Please set it in the settings.");
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script web apps often work best with text/plain
      },
      body: JSON.stringify({ action, ...payload }),
      mode: 'cors',
    });

    if (!response.ok) {
      // Try to get more specific error from Google Script redirect if possible
      if (response.type === 'opaque' || response.redirected) {
          throw new Error(`Network request failed. This may be due to a CORS issue or an invalid Apps Script URL. Please verify the URL and deployment settings.`);
      }
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error(`Error during action "${action}":`, error);
     if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const helpfulMessage = `Failed to connect to the Google Sheet. This is often a network or CORS issue. Please check:
1. Your internet connection.
2. The Web App URL in Settings is correct.
3. The script is deployed with "Who has access" set to "Anyone".
4. If you've changed the script, you may need to create a new deployment and re-authorize permissions.`;
        throw new Error(helpfulMessage);
    }
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown network error occurred.');
  }
}

// Bet Functions
export const fetchBets = async (): Promise<Bet[]> => {
  console.log("Fetching bets from Google Sheet...");
  const bets = await postToSheet('GET_BETS');
  // Add fallback to empty array to prevent crash if backend returns undefined data
  const betsArray = bets || [];
  // Sort by most recent
  const sortedBets = [...betsArray].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  console.log("Received bets.", sortedBets);
  return sortedBets;
};

export const addBet = async (betData: Omit<Bet, 'id' | 'payout'>): Promise<Bet> => {
  console.log("Adding bet to Google Sheet...", betData);
  const newBet = await postToSheet('ADD_BET', betData);
  console.log("Bet added.", newBet);
  return newBet;
};

export const editBet = async (betData: Omit<Bet, 'payout'>): Promise<Bet> => {
  console.log("Editing bet in Google Sheet...", betData);
  const updatedBet = await postToSheet('EDIT_BET', betData);
  console.log("Bet edited.", updatedBet);
  return updatedBet;
};

export const updateBet = async (id: string, newStatus: BetStatus): Promise<Bet> => {
  console.log(`Updating bet ${id} to ${newStatus} in Google Sheet...`);
  const updatedBet = await postToSheet('UPDATE_BET', { id, status: newStatus });
  console.log("Bet updated.", updatedBet);
  return updatedBet;
};

export const deleteBet = async (id: string): Promise<{ id: string }> => {
  console.log(`Deleting bet ${id} from Google Sheet...`);
  await postToSheet('DELETE_BET', { id });
  console.log(`Bet ${id} deleted.`);
  return { id };
};

// Transaction Functions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  console.log("Fetching transactions from Google Sheet...");
  const transactions = await postToSheet('GET_TRANSACTIONS');
  // Add fallback to empty array
  const transactionsArray = transactions || [];
  const sortedTransactions = [...transactionsArray].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  console.log("Received transactions.", sortedTransactions);
  return sortedTransactions;
}

export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  console.log("Adding transaction to Google Sheet...", transactionData);
  const newTransaction = await postToSheet('ADD_TRANSACTION', transactionData);
  console.log("Transaction added.", newTransaction);
  return newTransaction;
};