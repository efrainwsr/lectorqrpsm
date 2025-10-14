// Service for students using Firestore real-time updates with offline support
import { subscribeGraduandos } from '@/firebase';

let cachedEstudents = [];

export function subscribeEstudents(callback) {
    // delegate to firebase helper (lazy-loaded) which returns an unsubscribe
    const unsubPromise = subscribeGraduandos((items) => {
        cachedEstudents = items;
        callback(items);
    });
    // subscribeGraduandos returns the unsubscribe function (or a promise resolving to it)
    // We need to return a function that cancels subscription; if unsubPromise is a promise,
    // return a function that waits for it and calls it.
    return () => {
        // best-effort: if unsubPromise is a function, call it; if it's a promise, await then call
        if (typeof unsubPromise === 'function') return unsubPromise();
        if (unsubPromise && typeof unsubPromise.then === 'function') {
            unsubPromise.then((u) => {
                if (typeof u === 'function') u();
            }).catch((e) => console.warn('Error cancelling graduandos subscription', e));
        }
    };
}

export function getCachedEstudents() {
    return cachedEstudents;
}

// Default export for backward compatibility with existing imports in components
export default getCachedEstudents();
