// src/services/messageService.js
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    onSnapshot,
    Timestamp,
    collection
} from 'firebase/firestore';
import { db } from '../firebase';

function getTodayDocPath() {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return `conversations/${today}`;
}

/**
 * Sends a message to today's conversation document in Firestore.
 */
export async function sendMessageToFirebase(user, text) {
    const docPath = getTodayDocPath();
    const docRef = doc(db, docPath);
    const docSnap = await getDoc(docRef);

    const message = {
        user,
        text,
        timestamp: Timestamp.now()
    };

    if (docSnap.exists()) {
        await updateDoc(docRef, {
            messages: arrayUnion(message)
        });
    } else {
        await setDoc(docRef, {
            messages: [message]
        });
    }
}

/**
 * Real‑time listener on the entire `conversations` collection.
 * Whenever any day‑doc is added or updated, we pull ALL docs,
 * flatten their `messages` arrays, sort by timestamp, and invoke callback.
 *
 * Returns an unsubscribe function.
 */
export function listenToAllConversations(callback) {
    const colRef = collection(db, 'conversations');

    const unsubscribe = onSnapshot(
        colRef,
        (colSnap) => {
            // gather every message in every day‑doc
            const allMessages = [];
            colSnap.forEach((dayDoc) => {
                const data = dayDoc.data();
                if (Array.isArray(data.messages)) {
                    // attach the date string for any UI use (optional)
                    data.messages.forEach((msg) => allMessages.push(msg));
                }
            });
            // sort by Firestore Timestamp (seconds + nanoseconds)
            allMessages.sort((a, b) => {
                const ta = a.timestamp?.seconds ?? 0;
                const tb = b.timestamp?.seconds ?? 0;
                return ta - tb;
            });
            callback(allMessages);
        },
        (error) => {
            console.error('listenToAllConversations error:', error);
            callback([]);
        }
    );

    return unsubscribe;
}
