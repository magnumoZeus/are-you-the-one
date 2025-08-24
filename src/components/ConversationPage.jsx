import React, { useState, useRef, useEffect } from 'react';
import './ConversationPage.css';
import {
    sendMessageToFirebase,
    listenToAllConversations
} from '../services/messageService';

/**
 * Formats Firestore Timestamp or Date string/object into human-readable text.
 */
function formatTimestamp(ts) {
    let date;
    try {
        date = ts?.toDate?.() ?? new Date(ts);
        if (isNaN(date.getTime())) throw new Error('Invalid Date');
    } catch {
        return 'invalid timestamp';
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    if (date.toDateString() === now.toDateString()) {
        return `Today at ${timeStr}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${timeStr}`;
    }
    const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
    return `${dateStr} at ${timeStr}`;
}

export default function ConversationPage() {
    const [lines, setLines] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    // Realistic handshake logs
    const handshakeSteps = [
        'Resolving DNS for api.example.com...',
        'Connecting to 93.184.216.34:443...',
        'Performing TLSv1.3 handshake...',
        'Verifying server certificate...',
        'Exchanging session keys...',
        'Cipher suite: TLS_AES_128_GCM_SHA256',
        'Secure channel established.'
    ];
    const [completedSteps, setCompletedSteps] = useState([]);
    const [handshakeDone, setHandshakeDone] = useState(false);

    // Animate handshake and flag when done
    useEffect(() => {
        let idx = 0;
        const interval = setInterval(() => {
            setCompletedSteps(prev => [...prev, handshakeSteps[idx]]);
            idx += 1;
            if (idx >= handshakeSteps.length) {
                clearInterval(interval);
                setHandshakeDone(true);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    // Subscribe to messages only after handshake completes
    useEffect(() => {
        if (!handshakeDone) return;
        const unsubscribe = listenToAllConversations(messages => {
            const formatted = messages.map(msg => {
                const timeStr = formatTimestamp(msg.timestamp);
                return `<span class=\"username\">&lt;127.0.0.1@${msg.user}&gt;</span> [${timeStr}] ${msg.text}`;
            });
            setLines(formatted);
        });
        return () => typeof unsubscribe === 'function' && unsubscribe();
    }, [handshakeDone]);

    // Auto-scroll on new lines
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // Handle sending
    const handleKeyDown = async e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const message = inputRef.current?.innerText.trim();
            if (!selectedUser || !message) return;
            inputRef.current.innerText = '';
            try {
                await sendMessageToFirebase(selectedUser, message);
            } catch (err) {
                console.error('sendMessageToFirebase error:', err);
            }
        }
    };

    const handleUserChange = e => {
        setSelectedUser(e.target.value);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputClick = () => inputRef.current?.focus();

    return (
        <div className="conversation-container">
            <div className="terminal">

                {/* User selector */}
                <div className="dropdown-container">
                    <label htmlFor="user-select">User:&nbsp;</label>
                    <select id="user-select" value={selectedUser} onChange={handleUserChange}>
                        <option value="">-- Select --</option>
                        <option value="sbfn">sbfn</option>
                        <option value="qa">qa</option>
                    </select>
                </div>

                {/* Dynamic hacker-status block */}
                <div className="hacker-status">
                    <code>
                        {completedSteps.map((line, i) => (
                            <div key={i}>
                                {i === 0 ? '└─▶ ' : '└─ '}{line}
                            </div>
                        ))}
                    </code>
                </div>

                {/* Conversation history (appears after handshake) */}
                {handshakeDone && lines.map((line, i) => (
                    <div key={i} className="terminal-line" dangerouslySetInnerHTML={{ __html: line }} />
                ))}

                <div className="separator-line" />

                {/* Input area */}
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
                        data-placeholder={
                            !selectedUser
                                ? 'Select a user first'
                                : !handshakeDone
                                    ? 'Connecting...'
                                    : ''
                        }
                    />
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
