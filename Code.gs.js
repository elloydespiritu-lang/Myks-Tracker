// --- Google Apps Script for Myks Tracker ---
// Instructions:
// 1. In any Google Sheet (it can be blank), go to Extensions > Apps Script.
// 2. Paste this code into the script editor. The script will automatically create 'Bets' and 'Transactions' tabs.
// 3. Deploy as a Web App (Deploy > New deployment > Select type: Web app).
// 4. Configure: Execute as "Me", Who has access "Anyone".
// 5. Authorize the script when prompted.
// 6. Copy the final Web App URL and paste it into the app's Settings modal.

const BETS_SHEET_NAME = 'Bets';
const BETS_HEADERS = ['id', 'description', 'stake', 'odds', 'status', 'payout', 'createdAt'];

const TRANSACTIONS_SHEET_NAME = 'Transactions';
const TRANSACTIONS_HEADERS = ['id', 'type', 'amount', 'description', 'createdAt'];

// Helper function for debugging deployment. You can visit the web app URL in a browser.
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', message: 'Myks Tracker Script is running. Please use POST requests to interact with the API.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// A more robust function to ensure a sheet and its headers are correctly set up.
function initializeSheet(sheetName, requiredHeaders) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = activeSpreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = activeSpreadsheet.insertSheet(sheetName);
    // New sheet, so it definitely needs headers.
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  // Ensure top row is frozen for better UX even if sheet exists
  sheet.setFrozenRows(1);

  if (sheet.getLastRow() < 1) {
    // Sheet exists but is empty.
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return sheet;
  }
  
  // Sheet has content, check if headers are correct.
  const range = sheet.getRange(1, 1, 1, requiredHeaders.length);
  const currentHeaders = range.getValues()[0];
  
  let headersMatch = true;
  for (var i = 0; i < requiredHeaders.length; i++) {
    // If a header doesn't match, we need to update.
    if (currentHeaders[i] !== requiredHeaders[i]) {
      headersMatch = false;
      break;
    }
  }

  if (!headersMatch) {
    // Overwrite the headers to ensure they are correct.
    range.setValues([requiredHeaders]);
  }
  
  return sheet;
}


// Main entry point for the web app. Handles POST requests.
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Wait up to 30 seconds for lock

    const betsSheet = initializeSheet(BETS_SHEET_NAME, BETS_HEADERS);
    const transactionsSheet = initializeSheet(TRANSACTIONS_SHEET_NAME, TRANSACTIONS_HEADERS);
    
    const payload = JSON.parse(e.postData.contents);
    let data;

    switch (payload.action) {
      case 'GET_BETS':
        data = getRecords(betsSheet, BETS_HEADERS, ['stake', 'odds', 'payout']);
        break;
      case 'ADD_BET':
        data = addBet(betsSheet, payload);
        break;
      case 'EDIT_BET':
        data = editBet(betsSheet, payload);
        break;
      case 'UPDATE_BET':
        data = updateBetStatus(betsSheet, payload.id, payload.status);
        break;
      case 'DELETE_BET':
        data = deleteRecordById(betsSheet, payload.id);
        break;
      case 'GET_TRANSACTIONS':
        data = getRecords(transactionsSheet, TRANSACTIONS_HEADERS, ['amount']);
        break;
      case 'ADD_TRANSACTION':
        data = addTransaction(transactionsSheet, payload);
        break;
      default:
        throw new Error('Invalid action provided.');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error); // Use Logger for better debugging in Apps Script IDE
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString(), stack: error.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
      lock.releaseLock();
  }
}

function getRecords(sheet, headers, numericFields) {
  numericFields = numericFields || [];
  if (sheet.getLastRow() <= 1) {
    return [];
  }
  // Use headers.length to avoid issues with empty but formatted columns
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  
  return data.map(function(row) {
    let record = {};
    headers.forEach(function(header, i) {
      if (i < row.length) {
        if (numericFields.indexOf(header) !== -1 && row[i] !== '') {
          record[header] = Number(row[i]);
        } else {
          record[header] = row[i];
        }
      }
    });
    return record;
  }).filter(function(record) { return record.id; }); // Filter out empty rows
}

function addBet(sheet, betData) {
  const stakeNum = Number(betData.stake);
  const oddsNum = Number(betData.odds);
  let payout = 0;
  
  if (betData.status === 'WON') {
      payout = stakeNum * oddsNum;
  }

  const newBet = {
    id: Utilities.getUuid(),
    description: betData.description,
    stake: stakeNum,
    odds: oddsNum,
    status: betData.status,
    payout: payout,
    createdAt: betData.createdAt || new Date().toISOString(),
  };

  const newRow = BETS_HEADERS.map(function(header) { return newBet[header]; });
  sheet.appendRow(newRow);
  return newBet;
}

function addTransaction(sheet, transData) {
  const newTransaction = {
    id: Utilities.getUuid(),
    type: transData.type,
    amount: Number(transData.amount),
    description: transData.description || '', // Ensure description is not undefined
    createdAt: new Date().toISOString(),
  };

  const newRow = TRANSACTIONS_HEADERS.map(function(header) { return newTransaction[header]; });
  sheet.appendRow(newRow);
  return newTransaction;
}

// Replaced findIndex with a for loop for better compatibility
function findRowById(sheet, id) {
  if (sheet.getLastRow() <= 1) return -1;
  const idColumnValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const stringId = String(id);
  
  for (var i = 0; i < idColumnValues.length; i++) {
    if (String(idColumnValues[i][0]) === stringId) {
      return i + 2; // +2 because data starts at row 2
    }
  }
  return -1; // Not found
}

function editBet(sheet, betData) {
  const rowIndex = findRowById(sheet, betData.id);
  if (rowIndex === -1) throw new Error('Bet not found to edit.');

  const stakeNum = Number(betData.stake);
  const oddsNum = Number(betData.odds);
  let payout = 0;

  if (betData.status === 'WON') {
    payout = stakeNum * oddsNum;
  }
  
  // Create the full object to be saved and returned.
  const updatedBet = {
    id: betData.id,
    description: betData.description,
    stake: stakeNum,
    odds: oddsNum,
    status: betData.status,
    payout: payout,
    createdAt: betData.createdAt,
  };

  // Create an array in the correct order for the sheet.
  const newRowValues = BETS_HEADERS.map(function(header) {
    return updatedBet[header];
  });
  
  // Write the entire row at once for atomicity and reliability.
  sheet.getRange(rowIndex, 1, 1, BETS_HEADERS.length).setValues([newRowValues]);

  return updatedBet;
}

function updateBetStatus(sheet, id, newStatus) {
  const rowIndex = findRowById(sheet, id);
  if (rowIndex === -1) throw new Error('Bet not found.');

  const statusColIndex = BETS_HEADERS.indexOf('status') + 1;
  const payoutColIndex = BETS_HEADERS.indexOf('payout') + 1;
  const stakeColIndex = BETS_HEADERS.indexOf('stake') + 1;
  const oddsColIndex = BETS_HEADERS.indexOf('odds') + 1;

  sheet.getRange(rowIndex, statusColIndex).setValue(newStatus);
  
  let payout = 0;
  if (newStatus === 'WON') {
    const stake = sheet.getRange(rowIndex, stakeColIndex).getValue();
    const odds = sheet.getRange(rowIndex, oddsColIndex).getValue();
    payout = Number(stake) * Number(odds);
  }
  sheet.getRange(rowIndex, payoutColIndex).setValue(payout);
  
  const updatedRowValues = sheet.getRange(rowIndex, 1, 1, BETS_HEADERS.length).getValues()[0];
  const updatedBet = {};
  BETS_HEADERS.forEach(function(header, i) {
    const isNumericField = ['stake', 'odds', 'payout'].indexOf(header) !== -1;
    updatedBet[header] = isNumericField && updatedRowValues[i] !== '' ? Number(updatedRowValues[i]) : updatedRowValues[i];
  });

  return updatedBet;
}

function deleteRecordById(sheet, id) {
  const rowIndex = findRowById(sheet, id);
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    return { id: id, message: 'Record deleted successfully.' };
  } else {
    throw new Error('Record not found for deletion.');
  }
}