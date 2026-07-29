import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Image as ImageIcon, LogOut, Smile } from 'lucide-react';

export default function Navbar({ isAuthenticated, setIsAuthenticated }: { isAuthenticated: boolean, setIsAuthenticated: (val: boolean) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="nav-header">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers color="var(--primary-color)" />
        <span>Antigravity SaaS</span>
      </Link>
      
      {isAuthenticated && (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/generate" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ImageIcon size={18} /> Generate
          </Link>
          <button className="btn" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
