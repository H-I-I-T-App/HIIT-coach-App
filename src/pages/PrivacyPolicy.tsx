import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', minHeight: '100vh' }}>
      <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginBottom: '32px' }}>
        &larr; Back to Home
      </Link>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px', color: 'var(--text-main)' }}>Privacy Policy</h1>
      
      <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <p>Last updated: June 16, 2026</p>
        
        <h2 style={{ color: 'var(--text-main)', marginTop: '32px' }}>1. Information We Collect</h2>
        <p>When you use the HIIT Coach App, we collect basic profile information through Google Sign-In, including your email address and Google User ID. We also securely store your workout history, progress levels, and group affiliations in our cloud database.</p>
        
        <h2 style={{ color: 'var(--text-main)', marginTop: '32px' }}>2. How We Use Your Information</h2>
        <p>Your data is used exclusively to provide you with the core functionality of the app: tracking your workout history, managing your level progression, and displaying your ranking on group leaderboards.</p>
        
        <h2 style={{ color: 'var(--text-main)', marginTop: '32px' }}>3. Data Security</h2>
        <p>Your workout and profile data is stored securely using Supabase. All database tables are protected by Row Level Security (RLS) policies, ensuring that your data is handled safely.</p>
        
        <h2 style={{ color: 'var(--text-main)', marginTop: '32px' }}>4. Contact</h2>
        <p>If you have any questions about this privacy policy, please contact us via the Support page.</p>
      </div>
    </div>
  );
}
