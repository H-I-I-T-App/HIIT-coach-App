import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', minHeight: '100vh', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginBottom: '32px', alignSelf: 'flex-start' }}>
        &larr; Back to Home
      </Link>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px', color: 'var(--text-main)' }}>Support</h1>
      
      <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '32px' }}>
          Need help with the HIIT Coach App? We're here for you.
        </p>
        
        <div style={{ background: 'rgba(17, 24, 39, 0.82)', border: '1px solid var(--border)', padding: '32px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Email Us</h3>
          <p style={{ marginBottom: '24px' }}>
            For technical support, account issues, or general inquiries, please reach out to our team at:
          </p>
          <a href="mailto:support@hiitcoach.app" style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none' }}>
            support@hiitcoach.app
          </a>
        </div>
      </div>
    </div>
  );
}
