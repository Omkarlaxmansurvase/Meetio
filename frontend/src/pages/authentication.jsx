import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0); // 0 = login, 1 = register
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const formRef = React.useRef(null);

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const gsap = window.gsap;
      gsap.fromTo('.auth-left', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-right', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // Animate form switch
  const switchForm = (state) => {
    if (window.gsap && formRef.current) {
      window.gsap.fromTo(formRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
    setFormState(state);
    setError('');
  };

  let handleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (formState === 0) {
        // handleLogin in AuthContext should store token; navigate to /home on success
        let result = await handleLogin(username, password);
        // Navigate regardless of whether AuthContext does it — safe to call twice
        navigate('/home');
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setName('');
        setUsername('');
        setPassword('');
        setMessage('Account created! Please sign in.');
        setOpen(true);
        setError('');
        switchForm(0);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      setError(msg);
      if (window.gsap && formRef.current) {
        window.gsap.fromTo(formRef.current,
          { x: -8 }, { x: 8, duration: 0.08, yoyo: true, repeat: 5, ease: 'power1.inOut' }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAuth();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      fontFamily: "'DM Sans', sans-serif",
      background: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(10px)',
      '& fieldset': { borderColor: 'rgba(217,117,0,0.2)' },
      '&:hover fieldset': { borderColor: '#D97500' },
      '&.Mui-focused fieldset': { borderColor: '#D97500' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#D97500' },
    marginBottom: '12px',
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      background: '#F3F4E5', fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden', position: 'relative',
    }}>
      
      <div className="grainOverlay" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      
      <div className="auth-left" style={{
        flex: 1, background: 'linear-gradient(145deg, #1A0A00 0%, #2C1810 60%, #3D2010 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '3rem', position: 'relative', overflow: 'hidden',
        opacity: 0,
      }}>
        
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(255,152,57,0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(217,117,0,0.12) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '380px' }}>
          <div style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: '2.8rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #FF9839, #D97500)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: '0.8rem', letterSpacing: '-1px'
          }}>
            Meetio
          </div>

          <p style={{ color: 'rgba(255,200,120,0.7)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '3rem' }}>
            Connect with anyone, anywhere. Crystal-clear video calls made simple.
          </p>

          
          {['HD Video & Audio Quality', 'Real-time Chat Messaging', 'Screen Sharing', 'Secure & Encrypted'].map((feat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px', textAlign: 'left'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(217,117,0,0.2)', border: '1px solid rgba(217,117,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', flexShrink: 0
              }}>✦</div>
              <span style={{ color: 'rgba(255,220,160,0.85)', fontSize: '0.9rem', fontWeight: 400 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      
      <div className="auth-right" style={{
        flex: '0 0 480px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '3rem',
        background: '#F3F4E5', position: 'relative', opacity: 0,
      }}>
       
        <div
          onClick={() => navigate('/')}
          style={{
            position: 'absolute', top: '1.5rem', left: '1.5rem',
            cursor: 'pointer', color: '#8B6B4A', fontSize: '0.85rem',
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#D97500'}
          onMouseLeave={e => e.currentTarget.style.color = '#8B6B4A'}
        >
          ← Back
        </div>

        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: '2rem', fontWeight: 700, color: '#1A0A00',
            marginBottom: '0.4rem', letterSpacing: '-0.5px'
          }}>
            {formState === 0 ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: '#8B6B4A', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {formState === 0 ? "Don't have an account? " : "Already have an account? "}
            <span
              style={{ color: '#D97500', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => switchForm(formState === 0 ? 1 : 0)}
            >
              {formState === 0 ? 'Sign up' : 'Sign in'}
            </span>
          </p>

          
          <div style={{
            display: 'flex', background: 'rgba(217,117,0,0.08)',
            borderRadius: '12px', padding: '4px', marginBottom: '1.8rem',
            border: '1px solid rgba(217,117,0,0.15)'
          }}>
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={i}
                onClick={() => switchForm(i)}
                style={{
                  flex: 1, padding: '0.55rem',
                  borderRadius: '9px', border: 'none',
                  background: formState === i ? 'linear-gradient(135deg, #D97500, #FF9839)' : 'transparent',
                  color: formState === i ? 'white' : '#8B6B4A',
                  fontWeight: formState === i ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem',
                  transition: 'all 0.25s ease',
                  boxShadow: formState === i ? '0 4px 12px rgba(217,117,0,0.3)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          
          <div ref={formRef}>
            {formState === 1 && (
              <TextField
                fullWidth label="Full Name" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={inputStyle}
              />
            )}
            <TextField
              fullWidth label="Username" value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={inputStyle}
            />
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ ...inputStyle, marginBottom: 0 }}
            />

            {error && (
              <div style={{
                marginTop: '10px', padding: '0.6rem 1rem',
                background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)',
                borderRadius: '10px', color: '#c0392b', fontSize: '0.85rem'
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={isLoading}
              style={{
                width: '100%', marginTop: '1.5rem',
                background: isLoading ? 'rgba(217,117,0,0.5)' : 'linear-gradient(135deg, #D97500, #FF9839)',
                color: 'white', border: 'none',
                padding: '0.85rem', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                fontFamily: "'Syne', sans-serif",
                boxShadow: '0 6px 24px rgba(217,117,0,0.3)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={e => {
                if (!isLoading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 32px rgba(217,117,0,0.4)'; }
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(217,117,0,0.3)';
              }}
            >
              {isLoading ? 'Please wait...' : formState === 0 ? 'Login →' : 'Create Account →'}
            </button>
          </div>
        </div>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            background: 'linear-gradient(135deg, #D97500, #FF9839)',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(217,117,0,0.35)',
          }
        }}
      />
    </div>
  );
}