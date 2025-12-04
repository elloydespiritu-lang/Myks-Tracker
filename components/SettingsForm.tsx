import React, { useState } from 'react';
import { getGoogleSheetUrl } from '../services/googleSheetService';

interface SettingsFormProps {
  onSave: (url: string) => void;
  onClose: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ onSave, onClose }) => {
  const [url, setUrl] = useState(getGoogleSheetUrl() || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    // Basic URL validation
    if (!url || !url.startsWith('https://script.google.com/macros/')) {
        setError('Please enter a valid Google Apps Script Web App URL.');
        return;
    }
    setError('');
    onSave(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sheet-url" className="block text-sm font-medium text-gray-300 mb-1">
          Google Sheet Web App URL
        </label>
        <input
          id="sheet-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste your deployed Apps Script URL here"
          required
          aria-describedby="url-help"
        />
        <p id="url-help" className="mt-2 text-sm text-gray-400">
            This URL is generated when you deploy your Google Apps Script as a Web App. It is stored locally in your browser.
        </p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
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
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save and Sync
        </button>
      </div>
    </div>
  );
};