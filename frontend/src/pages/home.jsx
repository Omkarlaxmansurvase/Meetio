import React, { useContext, useEffect, useRef, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import { Player } from '@lottiefiles/react-lottie-player';


function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const gsap = window.gsap;
      gsap.fromTo('.home-nav', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.home-title', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.home-input-group', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)', delay: 0.5 });
      gsap.fromTo('.home-image', { opacity: 0, scale: 0.9, x: 50 }, { opacity: 1, scale: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.4 });
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  let handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;

    // Pulse animation on join
    if (window.gsap && inputRef.current) {
      window.gsap.fromTo(
        inputRef.current,
        { scale: 1 },
        { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut', onComplete: async () => {
          await addToUserHistory(meetingCode);
          navigate(`/${meetingCode}`);
        }}
      );
    } else {
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoinVideoCall();
  };

  return (
    <>
      
      <div className="grainOverlay" />
      
      
      <div style={{
        position: 'fixed', top: '-100px', right: '-100px', width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(255,152,57,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 8s ease-in-out infinite'
      }} />

      
      <div className="navBar home-nav" style={{ opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
          <h2 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: '1.7rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #D97500, #FF9839)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px'
          }}>Meetio</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: '4px' }}>
          <IconButton
            onClick={() => navigate("/history")}
            sx={{
              color: '#8B6B4A',
              '&:hover': { color: '#D97500', backgroundColor: 'rgba(217,117,0,0.08)' },
              borderRadius: '12px', padding: '8px 12px',
              transition: 'all 0.25s ease'
            }}
          >
            <RestoreIcon />
          </IconButton>
          <span style={{
            fontSize: '0.9rem', fontWeight: 500, color: '#8B6B4A',
            cursor: 'pointer', marginRight: '8px'
          }} onClick={() => navigate("/history")}>History</span>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(217,117,0,0.3)',
              padding: '0.45rem 1.2rem',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#D97500',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.target.style.background = '#D97500';
              e.target.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#D97500';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      
      <div className="meetContainer">
        <div className="leftPanel">
          <div style={{ position: 'relative', zIndex: 5 }}>
            
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,152,57,0.1)', border: '1px solid rgba(217,117,0,0.2)',
              padding: '0.35rem 0.9rem', borderRadius: '50px',
              fontSize: '0.8rem', fontWeight: 500, color: '#D97500',
              marginBottom: '1.2rem', letterSpacing: '0.3px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97500', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
              Ready to connect
            </div>

            <h2 className="home-title" style={{ opacity: 0 }}>
              Quality video calls,<br />
              <span style={{ color: '#D97500' }}>every time.</span>
            </h2>

            <p style={{
              color: '#8B6B4A', fontSize: '1rem', marginBottom: '2rem',
              lineHeight: 1.7, maxWidth: '400px', fontWeight: 400
            }}>
              Enter a meeting code to instantly join your call. No downloads, no hassle.
            </p>

            
            <div
              ref={inputRef}
              className="home-input-group"
              style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0 }}
            >
              <TextField
                value={meetingCode}
                onChange={e => setMeetingCode(e.target.value)}
                onKeyDown={handleKeyDown}
                label="Meeting Code"
                variant="outlined"
                placeholder="e.g. meet-2024"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': { borderColor: 'rgba(217,117,0,0.25)' },
                    '&:hover fieldset': { borderColor: '#D97500' },
                    '&.Mui-focused fieldset': { borderColor: '#D97500' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#D97500' },
                }}
              />

              <button
                onClick={handleJoinVideoCall}
                style={{
                  background: 'linear-gradient(135deg, #D97500, #FF9839)',
                  color: 'white',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: '0 6px 24px rgba(217,117,0,0.35)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 35px rgba(217,117,0,0.45)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 24px rgba(217,117,0,0.35)';
                }}
              >
                Join →
              </button>
            </div>

            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
              <div style={{ height: '1px', flex: 1, background: 'rgba(217,117,0,0.15)' }} />
              <span style={{ color: '#8B6B4A', fontSize: '0.82rem', fontWeight: 500 }}>or</span>
              <div style={{ height: '1px', flex: 1, background: 'rgba(217,117,0,0.15)' }} />
            </div>

            <button
              onClick={() => {
                const code = Math.random().toString(36).substring(2, 8);
                setMeetingCode(code);
                setTimeout(() => navigate(`/${code}`), 300);
              }}
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(217,117,0,0.25)',
                padding: '0.7rem 1.6rem',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#D97500',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.25s ease',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(217,117,0,0.08)';
                e.currentTarget.style.borderColor = '#D97500';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.borderColor = 'rgba(217,117,0,0.25)';
              }}
            >
              + Create new meeting
            </button>
          </div>
        </div>

        <div className='rightPanel'>
          <Player
                        className="home-image"
                        autoplay
                        loop
                        src="/animations/working-guy.json"
                        style={{
                          height: 'clamp(300px, 55vh, 500px)',
                          width: 'auto',
                        }}
                      />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-30px) scale(1.05); }
        }
      `}</style>
    </>
  );
}

export default withAuth(HomeComponent);