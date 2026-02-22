import React, { useEffect, useRef } from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
import { Player } from '@lottiefiles/react-lottie-player';

export default function LandingPage() {
  const router = useNavigate();
  const heroRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    // Load GSAP dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const gsap = window.gsap;

      // Nav entrance
      gsap.fromTo(
        navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Staggered hero content
      gsap.fromTo(
        '.hero-badge',
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.4, stagger: 0.1 }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 40, skewY: 3 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: 'power4.out', delay: 0.5 }
      );
      gsap.fromTo(
        '.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.8 }
      );
      gsap.fromTo(
        '.hero-cta',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 1.0 }
      );
      gsap.fromTo(
        '.hero-img',
        { opacity: 0, x: 60, rotateY: 15 },
        { opacity: 1, x: 0, rotateY: 0, duration: 1.1, ease: 'power3.out', delay: 0.5 }
      );

      // Pulse animation on orb decorations
      gsap.to('.hero-orb-1', {
        scale: 1.15,
        opacity: 0.7,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.hero-orb-2', {
        scale: 1.2,
        opacity: 0.5,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  return (
    <div className='landingPageContainer'>
      
      <div className="grainOverlay" />

      
      <div className="hero-orb-1" style={{
        position: 'fixed', top: '-180px', right: '-180px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,152,57,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />
      <div className="hero-orb-2" style={{
        position: 'fixed', bottom: '-120px', left: '-120px',
        width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(217,117,0,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />

      
      <nav ref={navRef} style={{ opacity: 0 }}>
        <div className='navHeader'>
          <h2>Meetio</h2>
        </div>
        <div className='navlist'>
          <p onClick={() => router("/aljk23")}>Join as Guest</p>
          <p onClick={() => router("/auth")}>Register</p>
          <div onClick={() => router("/auth")} role='button'>
            <p>Login</p>
          </div>
        </div>
      </nav>

      
      <div className="landingMainContainer" ref={heroRef}>
        <div>
          
          <div className="featureBadges">
            <span className="featureBadge hero-badge" style={{ opacity: 0 }}>HD Video</span>
            <span className="featureBadge hero-badge" style={{ opacity: 0 }}>End-to-End Encrypted</span>
            <span className="featureBadge hero-badge" style={{ opacity: 0 }}>No Downloads</span>
          </div>

          <h1 className="hero-title" style={{ opacity: 0 }}>
            <span style={{ color: '#FF9839' }}>Connect</span> with<br />
            your loved ones
          </h1>

          <p className="hero-sub" style={{ opacity: 0 }}>
            Crystal-clear video calls, seamless screen sharing,<br />
            and real-time chat — all in one place.
          </p>

          <div role='button' className="hero-cta" style={{ opacity: 0 }}>
            <Link to={"/auth"}>Get Started →</Link>
          </div>
        </div>

        <div>
          <Player
              className="hero-img"
              autoplay
              loop
              src="/animations/video-call.json"
              style={{
                opacity: 0,
                height: 'clamp(300px, 55vh, 500px)',
                width: 'auto',
              }}
            />
        </div>
      </div>
    </div>
  );
}