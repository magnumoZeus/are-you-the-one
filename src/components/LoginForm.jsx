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

        // Determine if the entered password is correct
        const isMatch = raw.toLowerCase() === HARD_CODED_PASSWORD.toLowerCase()

        // Log exactly one attempt record, with a success flag
        const attempt = {
            password: raw,
            attemptedAt: serverTimestamp(),
            success: isMatch,
        }

        try {
            await addDoc(collection(db, 'passwordAttempts'), attempt)
        } catch (err) {
            console.error('Error logging attempt:', err)
        }

        setLoading(false)
        if (isMatch) {
            navigate('/home')
        } else {
            setError('Nope, that’s not it. Try again!')
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
            />

            <button type="submit" disabled={loading} className="login-button">
                {loading ? 'Processing...' : 'Submit'}
            </button>

            {error && <p className="error-msg">{error}</p>}
        </form>
    )
}
