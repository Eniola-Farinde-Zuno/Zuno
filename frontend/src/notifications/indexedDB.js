const DB_NAME = 'zuno-notification-db';
const DB_VERSION = 2;
const STORE_NAME = 'received-notifications';
const OFFLINE_OPERATIONS_STORE = 'offline-operations';

export function openIndexedDBClient() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            //create notifications store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('read', 'read', { unique: false });
            }
            //create offline operations store if it doesn't exist
            if (!db.objectStoreNames.contains(OFFLINE_OPERATIONS_STORE)) {
                const offlineStore = db.createObjectStore(OFFLINE_OPERATIONS_STORE, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
                offlineStore.createIndex('type', 'type', { unique: false });
                offlineStore.createIndex('processed', 'processed', { unique: false });
            }
        };
        request.onsuccess = event => {
            resolve(event.target.result);
        };
    });
}

//function to get all stored notifications
export async function getAllStoredNotifications() {
    const db = await openIndexedDBClient();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const allNotifications = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    await tx.done; // Ensure transaction completes
    return allNotifications;
}

//function to add a notification to IndexedDB
export async function addNotification(notification) {
    const db = await openIndexedDBClient();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const notificationToStore = {
        ...notification,
        timestamp: notification.timestamp || Date.now(),
        read: notification.read || false
    };
    const id = await new Promise((resolve, reject) => {
        const request = store.add(notificationToStore);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
    await tx.done;
    return id;
}

//function to queue an operation for when the device comes back online
export async function queueOfflineOperation(operationType, data) {
    const db = await openIndexedDBClient();
    const tx = db.transaction(OFFLINE_OPERATIONS_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_OPERATIONS_STORE);
    const operation = {
        type: operationType,
        data: data,
        timestamp: Date.now(),
        processed: false
    };
    const id = await new Promise((resolve, reject) => {
        const request = store.add(operation);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });

    await tx.done;
    return id;
}

//function to get all pending offline operations
export async function getPendingOfflineOperations() {
    const db = await openIndexedDBClient();
    const tx = db.transaction(OFFLINE_OPERATIONS_STORE, 'readonly');
    const store = tx.objectStore(OFFLINE_OPERATIONS_STORE);
    const index = store.index('processed');

    // Get all operations where processed = false
    const operations = await new Promise((resolve, reject) => {
        const request = index.getAll(false);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });

    await tx.done;
    return operations;
}

//function to mark an offline operation as processed
export async function markOfflineOperationAsProcessed(operationId) {
    const db = await openIndexedDBClient();
    const tx = db.transaction(OFFLINE_OPERATIONS_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_OPERATIONS_STORE);
    const operation = await new Promise((resolve, reject) => {
        const request = store.get(operationId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
    //mark as processed
    operation.processed = true;
    //update in IndexedDB
    await new Promise((resolve, reject) => {
        const request = store.put(operation);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });

    await tx.done;
    return true;
}

//function to process all pending offline operations
export async function processOfflineOperations(apiNotifications) {
    const pendingOperations = await getPendingOfflineOperations();
    console.log(`Processing ${pendingOperations.length} pending offline operations.`);

    let successCount = 0;
    let failedCount = 0;

    for (const operation of pendingOperations) {
        switch (operation.type) {
            case 'markAsRead':
                await apiNotifications.markAsRead(operation.data.notificationId);
                break;
            case 'markAllAsRead':
                await apiNotifications.markAllAsRead();
                break;
            default:
                break;
        }
        await markOfflineOperationAsProcessed(operation.id);
        successCount++;
    }
    return { success: successCount };

}
