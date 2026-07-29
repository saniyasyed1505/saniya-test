import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import SharedMedia from './pages/SharedMedia';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
  );

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <main className="app-container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/generate" element={isAuthenticated ? <Generate /> : <Navigate to="/login" />} />
          <Route path="/share/:id" element={<SharedMedia />} />
        </Routes>
      </main>
    </Router>
  );
}


export default App;
