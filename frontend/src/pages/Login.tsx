import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (val: boolean) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await api.post('/auth/register', { email, password, name });
      }
      const res = await api.post('/auth/login', { email, password });
      
      if (rememberMe) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('savedEmail', email);
      } else {
        sessionStorage.setItem('token', res.data.accessToken);
        localStorage.removeItem('savedEmail');
      }
      
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isRegistering && (
          <div>
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {!isRegistering && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="rememberMe" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
            />
            <label htmlFor="rememberMe" style={{ margin: 0, fontSize: '0.9rem' }}>Remember Me</label>
          </div>
        )}
        
        {error && <div className="error-text">{error}</div>}
        
        <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
          {isRegistering ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
        <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          {isRegistering ? 'Log In' : 'Sign Up'}
        </a>
      </div>
    </div>
  );
}
