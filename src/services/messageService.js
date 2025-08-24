// src/services/messageService.js
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    onSnapshot,
    collection,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// Return today's id like '2025-08-24'
function getTodayId() {
    return new Date().toISOString().slice(0, 10)
}

function toMillis(ts) {
    if (!ts) return 0
    if (typeof ts.toDate === 'function') return ts.toDate().getTime()
    if (ts.seconds !== undefined) return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6)
    const d = new Date(ts)
    return isNaN(d.getTime()) ? 0 : d.getTime()
}

/**
 * Send a message into today's doc (one doc per day, messages array).
 */
export async function sendMessageToFirebase(user, text) {
    try {
        if (!user || !text) throw new Error('user and text required')

        const todayId = getTodayId()
        const docRef = doc(db, 'conversations', todayId)
        const docSnap = await getDoc(docRef)

        const message = {
            user,
            text,
            timestamp: Timestamp.now(),
        }

        if (docSnap.exists()) {
            await updateDoc(docRef, {
                messages: arrayUnion(message),
                lastUpdated: Timestamp.now(),
            })
        } else {
            await setDoc(docRef, {
                messages: [message],
                lastUpdated: Timestamp.now(),
            })
        }
        console.log('Message sent successfully')
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}

/**
 * Real-time listener on the `conversations` collection.
 */
export function listenToAllConversations(callback) {
    try {
        const colRef = collection(db, 'conversations')

        const unsubscribe = onSnapshot(
            colRef,
            (colSnap) => {
                const allMessages = []
                colSnap.forEach((dayDoc) => {
                    const data = dayDoc.data()
                    if (Array.isArray(data.messages)) {
                        data.messages.forEach((msg, idx) => {
                            allMessages.push({
                                _docId: dayDoc.id,
                                _idx: idx,
                                id: msg.id || `${dayDoc.id}_${idx}`,
                                ...msg,
                            })
                        })
                    }
                })
                // sort by timestamp (millis)
                allMessages.sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp))
                callback(allMessages)
            },
            (error) => {
                console.error('listenToAllConversations error:', error)
                callback([])
            }
        )

        return unsubscribe
    } catch (error) {
        console.error('Error setting up listener:', error)
        return () => { }
    }
}
