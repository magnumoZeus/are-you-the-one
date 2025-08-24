import React, { useState, useRef, useEffect } from 'react'
import './ConversationPage.css'
import { sendMessageToFirebase, listenToAllConversations } from '../services/messageService'

function formatTimestamp(ts) {
    if (!ts) return 'just now'
    let date
    try {
        date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts)
        if (isNaN(date.getTime())) throw new Error('Invalid Date')
    } catch {
        return 'invalid timestamp'
    }

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    if (date.toDateString() === now.toDateString()) return `Today at ${timeStr}`
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${timeStr}`
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `${dateStr} at ${timeStr}`
}

export default function ConversationPage() {
    const [messages, setMessages] = useState([])
    const [selectedUser, setSelectedUser] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)
    const bottomRef = useRef(null)

    // Handshake animation
    const handshakeSteps = [
        'Resolving DNS for api.example.com...',
        'Connecting to 93.184.216.34:443...',
        'Performing TLSv1.3 handshake...',
        'Verifying server certificate...',
        'Exchanging session keys...',
        'Cipher suite: TLS_AES_128_GCM_SHA256',
        'Secure channel established.',
    ]
    const [completedSteps, setCompletedSteps] = useState([])
    const [handshakeDone, setHandshakeDone] = useState(false)

    useEffect(() => {
        let idx = 0
        const interval = setInterval(() => {
            if (idx < handshakeSteps.length) {
                setCompletedSteps((prev) => [...prev, handshakeSteps[idx]])
                idx += 1
            } else {
                clearInterval(interval)
                setHandshakeDone(true)
            }
        }, 800)

        return () => clearInterval(interval)
    }, [])

    // Attach listener after handshake completes
    useEffect(() => {
        if (!handshakeDone) return

        console.log('ConversationPage: attaching listener')
        let unsubscribe

        try {
            unsubscribe = listenToAllConversations((msgs) => {
                console.log('ConversationPage listener -> messages count:', msgs.length)
                setMessages(msgs)
                setIsLoading(false)
            })
        } catch (error) {
            console.error('Error setting up listener:', error)
            setError('Failed to connect to message service')
            setIsLoading(false)
        }

        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                try {
                    unsubscribe()
                    console.log('ConversationPage: unsubscribed')
                } catch (error) {
                    console.error('Error unsubscribing:', error)
                }
            }
        }
    }, [handshakeDone])

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }, [messages])

    // Send on Enter
    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const message = inputRef.current?.innerText.trim()
            if (!selectedUser || !message) return

            inputRef.current.innerText = ''
            setIsLoading(true)

            try {
                await sendMessageToFirebase(selectedUser, message)
            } catch (err) {
                console.error('sendMessageToFirebase error:', err)
                setError('Failed to send message')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value)
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleInputClick = () => inputRef.current?.focus()

    return (
        <div className="conversation-container">
            <div className="terminal">
                <div className="dropdown-container">
                    <label htmlFor="user-select">User:&nbsp;</label>
                    <select id="user-select" value={selectedUser} onChange={handleUserChange}>
                        <option value="">-- Select --</option>
                        <option value="sbfn">sbfn</option>
                        <option value="qa">qa</option>
                    </select>
                </div>

                {error && (
                    <div className="error-message">
                        Error: {error}
                    </div>
                )}

                <div className="hacker-status">
                    <code>
                        {completedSteps.map((line, i) => (
                            <div key={i}>
                                {i === 0 ? '└─▶ ' : '└─ '}
                                {line}
                            </div>
                        ))}
                    </code>
                </div>

                {/* Conversation history */}
                {handshakeDone && (
                    <div>
                        {isLoading && (
                            <div className="terminal-line" style={{ color: '#888' }}>
                                Loading messages...
                            </div>
                        )}

                        {messages.length === 0 && !isLoading && (
                            <div className="terminal-line" style={{ color: '#888' }}>
                                No messages found. Start a conversation!
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className="terminal-line">
                                <span className="username">&lt;127.0.0.1@{msg.user}&gt;</span>{' '}
                                [{formatTimestamp(msg.timestamp)}] {msg.text}
                            </div>
                        ))}
                    </div>
                )}

                <div className="separator-line" />

                <div className="terminal-input" onClick={handleInputClick}>
                    <span className="prompt">&gt;</span>
                    <div
                        ref={inputRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="terminal-editable"
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        style={{ opacity: selectedUser && handshakeDone ? 1 : 0.4 }}
                        data-placeholder={!selectedUser ? 'Select a user first' : !handshakeDone ? 'Connecting...' : ''}
                    />
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    )
}