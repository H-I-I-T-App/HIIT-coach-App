import { Flame } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function LoginScreen() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirection URL after login (GitHub Pages or Localhost)
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    
    if (error) {
      console.error("Error logging in:", error.message);
      alert("Failed to log in: " + error.message);
    }
  };

  const handleAlexLogin = () => {
    localStorage.setItem('dev_alex_login', 'true');
    window.location.reload();
  };

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glowing-icon" style={{ marginBottom: '32px' }}>
        <Flame size={100} color="var(--primary-color)" strokeWidth={1.5} />
      </div>
      <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '8px', textAlign: 'center' }}>HIIT Coach</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', textAlign: 'center' }}>Sign in to track your progression and compete on the leaderboard.</p>
      
      <button 
        onClick={handleGoogleLogin} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          background: '#fff', 
          color: '#000', 
          border: 'none', 
          padding: '16px 32px', 
          borderRadius: '100px', 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" style={{ width: '24px', height: '24px' }} />
        Sign in with Google
      </button>

      <button 
        onClick={handleAlexLogin} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.1)', 
          color: '#fff', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          padding: '16px 32px', 
          borderRadius: '100px', 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px',
          marginTop: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <Flame size={24} color="var(--primary-color)" />
        I don't want to create a profile
      </button>
    </div>
  );
}
