// src/components/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();

    // Quotes data
    const [quotes] = useState([
        {
            id: 1,
            text: "Unite with each other to have unity of hearts and keep company with one another to share a feeling of compassion.",
            author: "Hazrat Muhammad Mustafa (s.a.w)(Nahj al Fasahah: CH21: Tradition No. 2379.)"
        },
        { id: 2, text: "Coming soon", author: "Unknown" },
        { id: 3, text: "Coming soon", author: "Unknown" }
    ]);

    // Controls the greeting modal visibility
    const [showGreeting, setShowGreeting] = useState(false);

    // Show modal on component mount
    useEffect(() => {
        const hasSeenGreeting = localStorage.getItem('hasSeenGreeting');
        if (!hasSeenGreeting) {
            setShowGreeting(true);
            localStorage.setItem('hasSeenGreeting', 'true');
        }
    }, []);


    return (
        <div className="page-container-wrapper">
            {/* Greeting Modal */}
            {showGreeting && (
                <div className="greeting-modal">
                    <div className="greeting-content">
                        <h2>Welcome, Batool!!</h2>
                        <p>Want to see something cool?</p>
                        <button
                            className="greeting-close-btn"
                            onClick={() => setShowGreeting(false)}
                        >
                            Let’s go!
                        </button>
                    </div>
                </div>
            )}

            {/* Background content only gets blurred */}
            <div className={`page-container ${showGreeting ? 'blur' : ''}`}>
                {/* Welcome Section */}
                <section className="welcome">
                    <h1>Welcome Syeda Batool Fatima Naqvi</h1>
                    <p>
                        I am glad you're here. I have waited so long to hear from you, there's
                        so much we need to talk about. Stay tuned love
                    </p>
                </section>

                <main className="content-grid">
                    {/* Quotes */}
                    <section className="quotes">
                        <h2>Dedicated to You</h2>
                        <div className="quotes-list">
                            {quotes.map((q) => (
                                <div key={q.id} className="quote-card">
                                    <p className="quote-text">"{q.text}"</p>
                                    <p className="quote-author">— {q.author}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <div
                        className="gallery"
                        onClick={() => navigate('/gallery')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h2>Gallery</h2>
                        <div className="gallery-grid">
                            <div className="gallery-item">
                                <img
                                    src="https://via.placeholder.com/140x120/4A90E2/ffffff?text=+"
                                    alt="Coming Soon"
                                />
                            </div>
                        </div>
                        <button className="btn-full">View Gallery</button>
                    </div>

                    {/* Chat */}
                    <div
                        className="chat-tile"
                        onClick={() => navigate('/conversation')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="chat-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                            </svg>
                        </div>
                        <h2>Stressed? Talk to me</h2>
                        <button className="btn-chat">Go</button>
                    </div>
                </main>
            </div>
        </div>
    );

}
