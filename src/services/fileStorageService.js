// File and Web Link Storage Service using IndexedDB

const DB_NAME = 'lippboard_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let dbInstance = null;

/**
 * Initialize IndexedDB and create stores if needed.
 */
function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('Error opening IndexedDB:', e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Get all files and links stored in IndexedDB.
 */
export async function getAllFiles() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get a specific file by ID from IndexedDB (including content).
 * @param {string} id - The ID of the file.
 */
export async function getFile(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Add or update a file or link.
 * @param {object} fileObj - Object containing id, name, type, size, date, content (Blob) or url (string)
 */
export async function saveFile(fileObj) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(fileObj);

    request.onsuccess = () => {
      resolve(fileObj);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Delete a file or link by ID.
 * @param {string} id - The ID of the item.
 */
export async function deleteFile(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Helper to format file size.
 * @param {number} bytes 
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
