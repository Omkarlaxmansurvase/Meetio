import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const gsap = window.gsap;
      gsap.fromTo('.history-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.history-card', { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.3 }
      );
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [meetings]);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  let formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F3F4E5',
      fontFamily: "'DM Sans', sans-serif", position: 'relative'
    }}>
      
      <div style={{
        position: 'fixed', top: '-120px', right: '-120px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,152,57,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      
      <div className="history-header" style={{
        opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 2.5rem',
        borderBottom: '1px solid rgba(217,117,0,0.15)',
        background: 'rgba(243,244,229,0.85)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => routeTo('/home')}
            style={{
              background: 'rgba(217,117,0,0.1)', border: '1px solid rgba(217,117,0,0.2)',
              borderRadius: '10px', padding: '0.45rem 0.7rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              color: '#D97500', fontSize: '0.85rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D97500'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,117,0,0.1)'; e.currentTarget.style.color = '#D97500'; }}
          >
            <HomeIcon sx={{ fontSize: '1rem' }} />
            Home
          </button>
          <div style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: '1.6rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #D97500, #FF9839)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', letterSpacing: '-0.5px'
          }}>
            Meetio
          </div>
        </div>

        <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.2rem', fontWeight: 600, color: '#1A0A00' }}>
          Meeting History
        </h1>
      </div>

      
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#8B6B4A' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>◌</div>
            <p>Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: '5rem',
            background: 'rgba(255,255,255,0.5)', borderRadius: '20px',
            border: '1px dashed rgba(217,117,0,0.2)', padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <h3 style={{ fontFamily: "'Clash Display', sans-serif", color: '#1A0A00', marginBottom: '0.5rem' }}>No meetings yet</h3>
            <p style={{ color: '#8B6B4A', marginBottom: '1.5rem' }}>Your meeting history will appear here</p>
            <button
              onClick={() => routeTo('/home')}
              style={{
                background: 'linear-gradient(135deg, #D97500, #FF9839)',
                color: 'white', border: 'none', padding: '0.7rem 1.8rem',
                borderRadius: '12px', cursor: 'pointer', fontWeight: 600,
                fontFamily: "'Syne', sans-serif", fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(217,117,0,0.3)'
              }}
            >
              Start a meeting →
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#8B6B4A', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} found
            </p>
            {meetings.map((e, i) => (
              <div
                key={i}
                className="history-card"
                onClick={() => routeTo(`/${e.meetingCode}`)}
                style={{
                  opacity: 0, background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(217,117,0,0.12)',
                  borderRadius: '16px', padding: '1.2rem 1.5rem',
                  marginBottom: '12px', display: 'flex',
                  alignItems: 'center', gap: '1rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(217,117,0,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(217,117,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(217,117,0,0.12)';
                }}
              >
                
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(217,117,0,0.15), rgba(255,152,57,0.1))',
                  border: '1px solid rgba(217,117,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <VideocamIcon sx={{ color: '#D97500', fontSize: '1.3rem' }} />
                </div>

                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 600,
                    fontSize: '0.95rem', color: '#1A0A00', marginBottom: '2px'
                  }}>
                    {e.meetingCode}
                  </div>
                  <div style={{ color: '#8B6B4A', fontSize: '0.82rem' }}>
                    {formatDate(e.date)}{e.date ? ` · ${formatTime(e.date)}` : ''}
                  </div>
                </div>

                
                <div style={{
                  background: 'rgba(217,117,0,0.08)', border: '1px solid rgba(217,117,0,0.18)',
                  padding: '0.3rem 0.8rem', borderRadius: '50px',
                  fontSize: '0.78rem', fontWeight: 500, color: '#D97500'
                }}>
                  Rejoin →
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>
    </div>
  );
}