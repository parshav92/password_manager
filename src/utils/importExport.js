// Import/Export utilities for vault data

import { getAllEntries, addEntry } from '../storage/vaultStore';

/**
 * Export vault entries as encrypted .vault file (JSON with ciphertext)
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<Blob>}
 */
export async function exportEncrypted(key) {
  const { encryptObject } = await import('../crypto/encryption');
  const entries = await getAllEntries(key);

  const { ciphertext, iv } = await encryptObject(entries, key);
  const exportData = {
    format: 'vaultsoft-v1',
    exportedAt: new Date().toISOString(),
    data: { ciphertext, iv },
  };

  return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
}

/**
 * Import from encrypted .vault file
 * @param {File} file - The .vault file
 * @param {CryptoKey} key - Encryption key (must match the key used to export)
 * @returns {Promise<number>} Number of entries imported
 */
export async function importEncrypted(file, key) {
  const { decryptObject } = await import('../crypto/encryption');
  const text = await file.text();
  const exportData = JSON.parse(text);

  if (exportData.format !== 'vaultsoft-v1') {
    throw new Error('Unsupported file format');
  }

  const entries = await decryptObject(exportData.data.ciphertext, exportData.data.iv, key);
  let count = 0;

  for (const entry of entries) {
    const { id, createdAt, updatedAt, passwordLastChanged, ...data } = entry;
    await addEntry(data, key);
    count++;
  }

  return count;
}

/**
 * Export vault entries as CSV
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<Blob>}
 */
export async function exportCSV(key) {
  const entries = await getAllEntries(key);

  const headers = ['title', 'username', 'password', 'url', 'notes', 'category', 'tags'];
  const rows = entries.map(entry => {
    return headers.map(h => {
      let val = entry[h] || '';
      if (Array.isArray(val)) val = val.join('; ');
      // Escape CSV
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  return new Blob([csv], { type: 'text/csv' });
}

/**
 * Import from CSV file (supports Chrome/Firefox/generic format)
 * Expected columns: name/title, username/login, password, url/website, notes
 *
 * @param {File} file - CSV file
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<number>} Number of entries imported
 */
export async function importCSV(file, key) {
  const text = await file.text();
  const lines = parseCSVLines(text);
  if (lines.length < 2) return 0;

  const headers = lines[0].map(h => h.toLowerCase().trim());

  // Map common column names
  const colMap = {
    title: headers.findIndex(h => ['title', 'name', 'entry'].includes(h)),
    username: headers.findIndex(h => ['username', 'login', 'login_username', 'user', 'email'].includes(h)),
    password: headers.findIndex(h => ['password', 'login_password'].includes(h)),
    url: headers.findIndex(h => ['url', 'website', 'login_uri', 'web', 'site'].includes(h)),
    notes: headers.findIndex(h => ['notes', 'comments', 'extra', 'note'].includes(h)),
  };

  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i];
    if (cols.length < 2) continue;

    const entry = {
      title: (colMap.title >= 0 ? cols[colMap.title] : '') || `Import ${i}`,
      username: colMap.username >= 0 ? cols[colMap.username] || '' : '',
      password: colMap.password >= 0 ? cols[colMap.password] || '' : '',
      url: colMap.url >= 0 ? cols[colMap.url] || '' : '',
      notes: colMap.notes >= 0 ? cols[colMap.notes] || '' : '',
      category: 'other',
      tags: [],
      customFields: [],
      isFavorite: false,
    };

    await addEntry(entry, key);
    count++;
  }

  return count;
}

/**
 * Simple CSV parser that handles quoted fields
 */
function parseCSVLines(text) {
  const lines = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && text[i + 1] === '\n') i++;
        current.push(field);
        field = '';
        if (current.some(c => c.trim())) lines.push(current);
        current = [];
      } else {
        field += char;
      }
    }
  }

  // Last field
  current.push(field);
  if (current.some(c => c.trim())) lines.push(current);

  return lines;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
