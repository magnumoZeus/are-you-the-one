import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const HARD_CODED_PASSWORD = 'batool'

export default function LoginForm() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const raw = password.trim()
        if (!raw) return

        setLoading(true)
        setError(null)

        const isMatch = raw.toLowerCase() === HARD_CODED_PASSWORD.toLowerCase()

        try {
            // Log the attempt to Firebase
            await addDoc(collection(db, 'passwordAttempts'), {
                password: raw,
                attemptedAt: serverTimestamp(),
                success: isMatch,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            })

            console.log('Password attempt logged successfully')

            if (isMatch) {
                navigate('/home')
            } else {
                setError('Nope, that\'s not it. Try again!')
            }
        } catch (err) {
            console.error('Error logging password attempt:', err)
            // Still allow login if Firebase fails but password is correct
            if (isMatch) {
                navigate('/home')
            } else {
                setError('Error logging attempt. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Curiosity killed the cat</h2>

            <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="login-input"
                autoFocus
            />

            <button type="submit" disabled={loading} className="login-button">
                {loading ? 'Processing...' : 'Submit'}
            </button>

            {error && <p className="error-msg">{error}</p>}
        </form>
    )
}