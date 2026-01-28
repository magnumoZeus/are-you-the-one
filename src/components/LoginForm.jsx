import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const HARD_CODED_PASSWORD = 'batool'

export default function LoginForm() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successPulse, setSuccessPulse] = useState(false)
    const navigate = useNavigate()
    const containerRef = useRef(null)
    const btnRef = useRef(null)

    useEffect(() => {
        // Inject CSS (exact styles ported from the HTML you provided)
        const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body, #root { height: 100%; }
    .page-wrap {
      min-height: 100vh;
      min-width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0; }
    .particle { position: absolute; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 6s infinite ease-in-out; }
    .particle:nth-child(1) { width:80px; height:80px; left:10%; animation-delay:-2s; }
    .particle:nth-child(2) { width:40px; height:40px; left:20%; animation-delay:-4s; }
    .particle:nth-child(3) { width:60px; height:60px; left:35%; animation-delay:-1s; }
    .particle:nth-child(4) { width:100px; height:100px; left:70%; animation-delay:-3s; }
    .particle:nth-child(5) { width:30px; height:30px; left:85%; animation-delay:-5s; }

    @keyframes float { 0%,100% { transform: translateY(100vh) rotate(0deg); opacity:0; } 10%,90% { opacity:0.3; } 50% { opacity:0.1; } }

    .login-container {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 24px;
      padding: 3rem;
      width: 100%;
      max-width: 720px; width: min(90%, 720px);
      max-height: 80vh;
      overflow-y: auto;
    scrollbar-width: thin;          /* Firefox */
    scrollbar-color: rgba(0,0,0,0.2) transparent;
      box-shadow: 0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05);
      position: relative;
      z-index: 1;
      animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1);
      transition: transform 0.2s ease-out;
    }
.login-container::-webkit-scrollbar {
  width: 6px;
}
    @keyframes slideUp { from { opacity:0; transform: translateY(60px) scale(0.95);} to { opacity:1; transform: translateY(0) scale(1);} }

    .header { text-align:center; margin-bottom:2rem; }
    .welcome-text {
      font-size:1.75rem; font-weight:700;
      background: linear-gradient(135deg,#667eea,#764ba2);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:0.5rem;
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.7; } }

    .subtitle { color:#64748b; font-size:0.95rem; font-weight:400; }

    .form-group { position: relative; margin-bottom:1.5rem; }
    .form-input {
      width:100%; padding:1rem 1.25rem; border:2px solid transparent; background: rgba(248,250,252,0.8);
      border-radius:16px; font-size:1rem; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); outline:none; backdrop-filter: blur(10px);
    }
    .form-input:focus { border-color:#667eea; background: rgba(255,255,255,0.95); box-shadow: 0 0 0 4px rgba(102,126,234,0.1); transform: translateY(-2px); }

    .form-label { position:absolute; left:1.25rem; top:1rem; color:#64748b; font-size:1rem; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); pointer-events:none; background:transparent; padding:0 0.5rem; }
    .form-input:focus + .form-label, .form-input:not(:placeholder-shown) + .form-label { top:-0.5rem; left:1rem; font-size:0.8rem; color:#667eea; background: rgba(255,255,255,0.9); border-radius:8px; }

    .login-btn {
      width:100%; padding:1rem; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      color:white; border:none; border-radius:16px; font-size:1.1rem; font-weight:600; cursor:pointer; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; display:inline-block; text-align:center;
    }
    .login-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(102,126,234,0.3); }
    .login-btn:active { transform: translateY(-1px); }
    .login-btn::before { content: ''; position:absolute; top:0; left:-100%; width:100%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; }
    .login-btn:hover::before { left:100%; }

    .heart {
      position:absolute; top:-10px; right:-10px; width:20px; height:20px; background: linear-gradient(135deg,#ff6b6b,#ee5a6f);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; animation: heartbeat 2s infinite;
    }
    @keyframes heartbeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }

    .decorative-line { height:2px; background: linear-gradient(135deg,#667eea,#764ba2); border-radius:1px; margin:2rem 0 1rem 0; animation: expand 1s ease-out 0.5s both; }
    @keyframes expand { from { width:0; } to { width:100%; } }

    .error-msg { color:#ef4444; margin-top:0.75rem; text-align:center; }

    @media (max-width:480px) { .login-container { margin:1rem; padding:2rem; } .welcome-text { font-size:1.5rem; } }

/* Desktop adjustments */
@media (min-width:1024px) {
  .login-container { max-width: 720px; padding: 4rem; }
  .welcome-text { font-size: 2.25rem; }
  .particle:nth-child(1) { width: 120px; height: 120px; }
  .particle:nth-child(4) { width: 140px; height: 140px; }
}
 .welcome-text { font-size:1.5rem; } }

    /* floating hearts animation (for the one-time success effect) */
    @keyframes floatUp { to { transform: translateY(-100vh) rotate(720deg); opacity:0; } }
    `

        const styleTag = document.createElement('style')
        styleTag.setAttribute('data-generated', 'login-ui')
        styleTag.innerHTML = css
        document.head.appendChild(styleTag)

        // cleanup on unmount
        return () => {
            if (styleTag && styleTag.parentNode) styleTag.parentNode.removeChild(styleTag)
        }
    }, [])

    useEffect(() => {
        // Mouse movement tilt effect for the container
        const container = containerRef.current
        if (!container) return

        const onMove = (e) => {
            const rect = container.getBoundingClientRect()
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            container.style.transform = `perspective(1000px) rotateX(${y * 0.05}deg) rotateY(${x * 0.05}deg)`
        }

        const onLeave = () => {
            container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseleave', onLeave)

        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseleave', onLeave)
        }
    }, [])

    const createFloatingHearts = () => {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const heart = document.createElement('div')
                heart.innerHTML = '♥'
                heart.style.cssText = `position: fixed; color: #ff6b6b; font-size: ${Math.random() * 20 + 15}px; left: ${Math.random() * 100}vw; top: 100vh; pointer-events: none; z-index: 1000; animation: floatUp 3s ease-out forwards;`
                document.body.appendChild(heart)
                setTimeout(() => heart.remove(), 3000)
            }, i * 200)
        }
    }

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

            if (isMatch) {
                // success visual feedback
                setSuccessPulse(true)
                // change the button visually (we use the loading/success states)
                btnRef.current && (btnRef.current.textContent = '✓ Welcome Back!')
                btnRef.current && (btnRef.current.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)')

                createFloatingHearts()

                setTimeout(() => {
                    navigate('/home')
                }, 700) // short delay to let the animation show
            } else {
                setError("Nope, that's not it. Try again!")
            }
        } catch (err) {
            console.error('Error logging password attempt:', err)
            if (isMatch) {
                navigate('/home')
            } else {
                setError('Error logging attempt. Please try again.')
            }
        } finally {
            setLoading(false)
            // restore button style if not success
            setTimeout(() => {
                if (btnRef.current) {
                    btnRef.current.textContent = 'Sign In'
                    btnRef.current.style.background = 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                }
            }, 2000)
        }
    }

    return (
        <div className="page-wrap">
            <div className="particles" aria-hidden>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="login-container" ref={containerRef}>
                <div className="heart" aria-hidden></div>

                <div className="header">
                    <h1 className="welcome-text">Welcome Back, 🐝</h1>
                    <p className="subtitle">
                        Assalamualaikum, <br />
                        Meri Jaan, Mere Shareek e Hayat, Mere Lakht e Jigar, My Love,
                        if you are reading this then know that you might not get more updates from my side for some time.
                        I am still angry with you for more than one reason, but under no circumstances you should think that my love for you is fading away.
                        <br />
                        <br />
                    </p>
                    <p className="subtitle">
                        Every time I see your smile my heart melts away.
                        And every time I see you faking a smile while you are actually sad it breaks my heart and I become sad too.
                        Don’t be sad. It’s a good thing we did not meet this year, or I would have hugged you infront of everyone.
                        If you think that I am an idot for writing all of this then you are right and this is just how I am.
                        You must have realised by now that I am very bad at expressing feelings so, please cope.
                        <br />
                        <br />
                    </p>
                    <p className="subtitle">
                        What I meant by “this version” was the version of you who thinks that I am a random stalker who’s hitting on you.
                        I needed confirmation that you are the one and I am sorry for getting that confirmation the way I did.
                        I had 3 worst case scenarios in my mind that day, none of them ended with me wanting you more than ever and not being able to talk to you.
                        But don’t you worry we will be together shortly inshallah.
                        I need your prayers with me.
                        I know we think alike and that is why I am worried for you, please stop overthinking and relax.
                        <br />
                        <br />
                    </p>
                    <p className="subtitle">
                        Meri Jaan aapka naam maine salat ul witr k 40 momenins me likha hua hai.
                    </p>

                </div>

                <div className="decorative-line"></div>

                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-input"
                            placeholder=" "
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        <label className="form-label"> Enter Password</label>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                        ref={btnRef}
                        aria-live="polite"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {error && <p className="error-msg">{error}</p>}
                </form>
            </div>
        </div>
    )
}
