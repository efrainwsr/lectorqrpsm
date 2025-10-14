// Lazy-load Firebase only at runtime (client). This prevents Vite/Rollup from
// trying to resolve `firebase/*` during SSR/build steps (fixes Vercel build).
const firebaseConfig = {
    apiKey: 'AIzaSyDPDPdfVf_x8T2s1i8qRFZXyZahDAADjTs',
    authDomain: 'qrpsm-7d918.firebaseapp.com',
    projectId: 'qrpsm-7d918',
    storageBucket: 'qrpsm-7d918.firebasestorage.app',
    messagingSenderId: '670291055635',
    appId: '1:670291055635:web:e2a4e6e366d13cc73d1be6',
    measurementId: 'G-MXF9DJZ3ZL'
};

let initPromise = null;
let cached = { app: null, db: null };

async function initFirebase() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        // run only in browser
        if (typeof window === 'undefined') return cached;

        const { initializeApp } = await import('firebase/app');
        const { getAnalytics } = await import('firebase/analytics').catch(() => ({}));
        const firestore = await import('firebase/firestore');

        const app = initializeApp(firebaseConfig);
        try {
            if (getAnalytics) getAnalytics(app);
        } catch (e) {
            // ignore
        }

        const { getFirestore, enableIndexedDbPersistence } = firestore;
        const db = getFirestore(app);
        try {
            await enableIndexedDbPersistence(db);
        } catch (e) {
            console.warn('Could not enable IndexedDB persistence:', e);
        }

        cached = { app, db };
        return cached;
    })();
    return initPromise;
}

// Helpers
async function getGraduando(cedula) {
    const { db } = await initFirebase();
    if (!db) return null;
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, 'graduandos', String(cedula));
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

async function setGraduando(cedula, data) {
    const { db } = await initFirebase();
    if (!db) return null;
    const { doc, setDoc } = await import('firebase/firestore');
    const ref = doc(db, 'graduandos', String(cedula));
    return setDoc(ref, data, { merge: true });
}

async function onGraduando(cedula, callback) {
    const { db } = await initFirebase();
    if (!db) return () => {};
    const { doc, onSnapshot } = await import('firebase/firestore');
    const ref = doc(db, 'graduandos', String(cedula));
    return onSnapshot(ref, (snap) => callback(snap.exists() ? snap.data() : null));
}

async function markScan(cedula, estudiante = {}) {
    const { db } = await initFirebase();
    if (!db) return null;
    const { doc, setDoc, getDoc, serverTimestamp, increment } = await import('firebase/firestore');
    const ref = doc(db, 'scans', String(cedula));
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
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

async function subscribeScans(callback) {
    const { db } = await initFirebase();
    if (!db) return () => {};
    const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
    const scansCol = collection(db, 'scans');
    const q = query(scansCol, orderBy('lastScanned', 'desc'));
    return onSnapshot(
        q,
        (snapshot) => {
            const items = [];
            snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
            callback(items);
        },
        (err) => console.error('Error en snapshot de scans:', err)
    );
}

async function deleteAllScans() {
    const { db } = await initFirebase();
    if (!db) return;
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const snaps = await getDocs(collection(db, 'scans'));
    const deletes = [];
    snaps.forEach((d) => deletes.push(deleteDoc(doc(db, 'scans', d.id))));
    await Promise.all(deletes);
}

export { getGraduando, setGraduando, onGraduando, markScan, subscribeScans, deleteAllScans };

// Subscribe to the 'graduandos' collection (ordered by nombres)
async function subscribeGraduandos(callback) {
    const { db } = await initFirebase();
    if (!db) return () => {};
    const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
    const col = collection(db, 'graduandos');
    const q = query(col, orderBy('nombres'));
    return onSnapshot(
        q,
        (snapshot) => {
            const items = [];
            snapshot.forEach((d) => {
                const data = d.data() || {};
                items.push({ id: d.id, ...data, ci: data.ci || d.id });
            });
            callback(items);
        },
        (err) => console.error('Error en snapshot de graduandos:', err)
    );
}

export { subscribeGraduandos };
