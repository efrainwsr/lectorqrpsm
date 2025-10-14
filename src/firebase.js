// Firebase initialization and Firestore with offline persistence
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence, collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, increment, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDPDPdfVf_x8T2s1i8qRFZXyZahDAADjTs',
    authDomain: 'qrpsm-7d918.firebaseapp.com',
    projectId: 'qrpsm-7d918',
    storageBucket: 'qrpsm-7d918.firebasestorage.app',
    messagingSenderId: '670291055635',
    appId: '1:670291055635:web:e2a4e6e366d13cc73d1be6',
    measurementId: 'G-MXF9DJZ3ZL'
};

const app = initializeApp(firebaseConfig);
try {
    // analytics may throw in some environments (SSR etc.)
    getAnalytics(app);
} catch (e) {
    // ignore analytics errors
}

const db = getFirestore(app);

// Enable offline persistence using IndexedDB. If another tab has persistence
// enabled, this will fail; we catch and log the error.
enableIndexedDbPersistence(db).catch((err) => {
    // Possible errors: failed-precondition (multiple tabs) or unimplemented (browser)
    console.warn('Could not enable IndexedDB persistence:', err);
});

export { db };

// Minimal helpers for the `graduandos` collection.
// Each document's ID is the cedula (cédula de identidad) as you described.
const graduandosCol = collection(db, 'graduandos');

async function getGraduando(cedula) {
    const ref = doc(db, 'graduandos', String(cedula));
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

async function setGraduando(cedula, data) {
    const ref = doc(db, 'graduandos', String(cedula));
    // merge: true so we don't overwrite unintentionally
    return setDoc(ref, data, { merge: true });
}

function onGraduando(cedula, callback) {
    const ref = doc(db, 'graduandos', String(cedula));
    // returns unsubscribe function
    return onSnapshot(ref, (snap) => {
        callback(snap.exists() ? snap.data() : null);
    });
}

export { graduandosCol, getGraduando, setGraduando, onGraduando };

// Scans helpers: store and subscribe to scanned QRs so all clients can see them.
const scansCol = collection(db, 'scans');

/**
 * Mark a cedula as scanned: increments a counter and sets lastScanned timestamp.
 * Returns the latest scan doc data after the update.
 */
async function markScan(cedula, estudiante = {}) {
    const ref = doc(db, 'scans', String(cedula));
    // merge an incremented counter and metadata
    await setDoc(
        ref,
        {
            ci: String(cedula),
            nombres: estudiante.nombres || '',
            titulo: estudiante.titulo || '',
            count: increment(1),
            lastScanned: serverTimestamp()
        },
        { merge: true }
    );

    // read back current value (may be eventually consistent but works with persistence)
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

function subscribeScans(callback) {
    const q = query(scansCol, orderBy('lastScanned', 'desc'));
    return onSnapshot(
        q,
        (snapshot) => {
            const items = [];
            snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
            callback(items);
        },
        (err) => {
            console.error('Error en snapshot de scans:', err);
        }
    );
}

export { scansCol, markScan, subscribeScans };

/**
 * Delete all documents in the scans collection. This issues individual deletes
 * for each document (batched deletes could be used for large sets).
 * Returns a promise that resolves when all deletes have been sent.
 */
async function deleteAllScans() {
    const snaps = await getDocs(scansCol);
    const deletes = [];
    snaps.forEach((d) => {
        const ref = doc(db, 'scans', d.id);
        deletes.push(deleteDoc(ref));
    });
    await Promise.all(deletes);
}

export { deleteAllScans };
