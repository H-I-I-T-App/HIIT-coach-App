import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <img src={logo} alt="HIIT Coach Logo" style={{ width: '120px', height: '120px', marginBottom: '32px' }} />
      
      <div style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Train Hard, Track Progress
      </div>
      
      <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', lineHeight: 1, margin: '0 0 24px 0', color: 'var(--text-main)' }}>
        HIIT Coach
      </h1>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 0 48px 0' }}>
        Your personal High Intensity Interval Training coach. Follow structured progression levels, join community groups, and track your fitness journey automatically in the cloud.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link 
          to="/app" 
          style={{ 
            background: 'linear-gradient(180deg, #f4d14a, #b88f00)', 
            color: '#05070c', 
            padding: '16px 32px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1.1rem',
            border: '1px solid rgba(255, 230, 112, 0.6)'
          }}
        >
          Open Web App
        </Link>
        <Link 
          to="/privacy" 
          style={{ 
            background: 'rgba(17, 24, 39, 0.82)', 
            color: 'var(--text-main)', 
            padding: '16px 32px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1.1rem',
            border: '1px solid var(--border)'
          }}
        >
          Privacy Policy
        </Link>
        <Link 
          to="/support" 
          style={{ 
            background: 'rgba(17, 24, 39, 0.82)', 
            color: 'var(--text-main)', 
            padding: '16px 32px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1.1rem',
            border: '1px solid var(--border)'
          }}
        >
          Support
        </Link>
      </div>

      <footer style={{ marginTop: 'auto', paddingTop: '48px', color: '#8fa1bb', fontSize: '0.9rem' }}>
        &copy; 2026 HIIT Coach App. All rights reserved.
      </footer>
    </div>
  );
}
