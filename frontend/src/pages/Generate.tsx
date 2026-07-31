import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Image as ImageIcon, Video, Sparkles, Smile } from 'lucide-react';

const MEME_MODES = [
  'Image',
  'GIF'
];

const MEME_TEMPLATES = [
  'Drake',
  'Distracted Boyfriend',
  'Woman Yelling at Cat',
  'Two Buttons',
  'Expanding Brain',
  'Gigachad',
  'Trade Offer',
  'NPC',
  'Surprised Pikachu',
  'Gru Presentation',
  'Always Has Been',
  'American Chopper',
  'Mocking SpongeBob',
  'Disaster Girl',
  'This Is Fine'
];

export default function Generate() {
  const [type, setType] = useState<'IMAGE' | 'VIDEO' | 'MEME'>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState(MEME_MODES[0]);
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      if (type === 'IMAGE') {
        await api.post('/generate/image', { prompt, model: 'turbo' });
      } else if (type === 'VIDEO') {
        await api.post('/generate/video', { prompt, model: 'turbo' });
      } else {
        await api.post('/generate/meme', { prompt, mode, template: template || undefined });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setLoading(true);
    try {
      const randomMode = MEME_MODES[Math.floor(Math.random() * MEME_MODES.length)];
      await api.post('/generate/meme', {
        prompt: 'Surprise me with something highly relatable and random',
        mode: randomMode,
        template: ''
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to generate random meme');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', position: 'relative' }}>
      
      {loading && (
        <div className="overlay glass-panel" style={{ zIndex: 100, border: 'none', background: 'rgba(13, 17, 23, 0.8)' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px', marginBottom: '1.5rem' }}></div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sending to AI Workers...</h3>
          <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>Securely queuing your generation request.</p>
        </div>
      )}

      <h2 style={{ marginBottom: '1.5rem' }}>Create New AI Generation</h2>
      
      <div className="glass-panel">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Generation Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setType('IMAGE')}
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: `2px solid ${type === 'IMAGE' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: type === 'IMAGE' ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}>
                <ImageIcon /> Image
              </button>
              <button 
                type="button" 
                onClick={() => setType('VIDEO')}
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: `2px solid ${type === 'VIDEO' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: type === 'VIDEO' ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}>
                <Video /> Video
              </button>
              <button 
                type="button" 
                onClick={() => setType('MEME')}
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: `2px solid ${type === 'MEME' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: type === 'MEME' ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}>
                <Smile /> Meme
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Prompt</label>
            <textarea 
              rows={4} 
              className="input-field"
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={`Describe the ${type.toLowerCase()} you want to generate...`}
              required 
            />
          </div>

          {type === 'MEME' && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mode</label>
                <select className="input-field" value={mode} onChange={e => setMode(e.target.value)} disabled={loading}>
                  {MEME_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {mode === 'Image' && (
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Template (Optional)</label>
                  <select className="input-field" value={template} onChange={e => setTemplate(e.target.value)} disabled={loading}>
                    <option value="">Random / Let AI decide</option>
                    {MEME_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn" disabled={loading || !prompt} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              Generate {type}
            </button>
            
            {type === 'MEME' && (
              <button type="button" className="btn" style={{ background: 'var(--accent-color)', flex: 1 }} onClick={handleSurpriseMe} disabled={loading}>
                Surprise Me 🎲
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
