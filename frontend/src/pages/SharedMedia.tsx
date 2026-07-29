import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { api } from '../services/api';

export default function SharedMedia() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Use the default fetch since it's a public endpoint not requiring auth
        // If api interceptor redirects to login on 401, we might need a raw fetch, 
        // but since this route doesn't have @UseGuards, it won't 401.
        const res = await api.get(`/share/${id}`);
        setMedia(res.data);
      } catch (err) {
        console.error(err);
        setError('Shared media not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMedia();
  }, [id]);

  const handleDownload = async () => {
    if (!media?.mediaUrl) return;
    try {
      const response = await fetch(media.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${media.type.toLowerCase()}-${media.id.substring(0, 8)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Track download
      await api.post(`/share/${id}/track`, { event: 'download' });
    } catch (err) {
      alert('Failed to download media');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="spinner"></div>
      <div>Loading shared media...</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Oops!</h2>
      <p>{error}</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Go to Home</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Generated {media.type.toLowerCase()}</h1>
        <p style={{ color: 'var(--text-color)', opacity: 0.8, marginBottom: '2rem' }}>Created by {media.author}</p>
        
        {media.type === 'VIDEO' ? (
          <video 
            src={media.mediaUrl} 
            controls 
            autoPlay 
            loop 
            style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', background: '#000' }}
          />
        ) : media.type === 'MEME' ? (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem', width: '100%' }}>
            {(media.mediaUrl.endsWith('.mp4') || media.mediaUrl.endsWith('.webm')) ? (
              <video 
                src={media.mediaUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', borderRadius: '12px', display: 'block' }} 
              />
            ) : (
              <img 
                src={media.mediaUrl} 
                alt={media.prompt} 
                style={{ width: '100%', borderRadius: '12px', display: 'block' }} 
              />
            )}
            {(media.memeData?.mode === 'Caption Meme' || media.memeData?.mode === 'Image') && (
              <div style={{
                position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
                background: 'rgba(0,0,0,0.7)', color: 'white', padding: '1rem',
                borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold'
              }}>
                {media.prompt}
              </div>
            )}
          </div>
        ) : (
          <img 
            src={media.mediaUrl} 
            alt={media.prompt} 
            style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem' }} 
          />
        )}
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', padding: '1.5rem', 
          borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' 
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem', opacity: 0.8 }}>Prompt</h3>
          <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.5 }}>"{media.prompt}"</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={handleDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <Download size={20} /> Download Free
          </button>
          <Link to="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            Create Your Own
          </Link>
        </div>
      </div>
    </div>
  );
}
