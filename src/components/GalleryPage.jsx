// src/pages/GalleryPage.jsx
import { useState } from 'react';
import './HomePage.css';

export default function GalleryPage() {
    const [galleryImages] = useState([
        { id: 1, src: "https://via.placeholder.com/300x200/4A90E2/ffffff?text=Memory+1", alt: "Memory 1" },
        { id: 2, src: "https://via.placeholder.com/300x200/7ED321/ffffff?text=Memory+2", alt: "Memory 2" },
        { id: 3, src: "https://via.placeholder.com/300x200/F5A623/ffffff?text=Memory+3", alt: "Memory 3" },
        { id: 4, src: "https://via.placeholder.com/300x200/D0021B/ffffff?text=Memory+4", alt: "Memory 4" }
    ]);

    return (
        <div className="page-container">
            <section className="gallery">
                <h2>Gallery</h2>
                <div className="gallery-grid">
                    {galleryImages.map(img => (
                        <div key={img.id} className="gallery-item">
                            <img src={img.src} alt={img.alt} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
