import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import ShareModal from '../components/ShareModal';
import { Share, Download, Copy, Heart, Trash2 } from 'lucide-react';
import GenerationFailureCard from '../components/generation/GenerationFailureCard';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const historyRes = await api.get('/history');
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileRes = await api.get('/users/profile');
        setProfile(profileRes.data);
        await fetchHistory();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const hasActiveJobs = history.some(item => item.status === 'QUEUED' || item.status === 'PROCESSING');
    if (!hasActiveJobs) return;

    const intervalId = setInterval(() => {
      fetchHistory();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [history]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generation?')) return;
    try {
      await api.delete(`/generation/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete generation');
    }
  };

  const handleRegenerate = async (id: string, options: { seedMode: 'same' | 'random' }) => {
    // Optimistically update the UI to avoid creating a new card
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'QUEUED', errorMessage: null } : item
    ));
    
    try {
      await api.post(`/generation/${id}/regenerate`, options);
      // Polling will handle subsequent updates automatically
    } catch (err: any) {
      console.error('Failed to regenerate:', err);
      alert(err.response?.data?.message || 'Failed to regenerate');
      // Revert if it fails immediately by re-fetching
      await fetchHistory();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.patch(`/generation/${id}/favorite`);
      setHistory(history.map(item => item.id === id ? { ...item, isFavorite: res.data.isFavorite } : item));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDownload = async (item: any) => {
    if (!item.mediaUrl) return;
    try {
      const response = await fetch(item.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${item.type.toLowerCase()}-${item.id.substring(0, 8)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Track analytics
      await api.post(`/share/${item.id}/track`, { event: 'download' });
    } catch (err) {
      alert('Failed to download media');
    }
  };

  const handleCopyLink = async (item: any) => {
    const shareUrl = `${window.location.origin}/share/${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      await api.post(`/share/${item.id}/track`, { event: 'copy' });
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleShare = async (item: any) => {
    if (!item.mediaUrl) return;
    
    const shareUrl = `${window.location.origin}/share/${item.id}`;
    const shareData = {
      title: `Generated ${item.type.toLowerCase()}: ${item.prompt}`,
      text: `Check out this AI generated ${item.type.toLowerCase()}: "${item.prompt}"`,
      url: shareUrl
    };

    // If Web Share API is available with file support
    if (navigator.canShare) {
      try {
        const response = await fetch(item.mediaUrl);
        const blob = await response.blob();
        
        // Enforce strict extensions and MIME types based on item type to guarantee AirDrop compatibility
        const extension = item.type === 'VIDEO' ? 'mp4' : (item.type === 'MEME' ? 'png' : 'jpg');
        const mimeType = item.type === 'VIDEO' ? 'video/mp4' : (item.type === 'MEME' ? 'image/png' : 'image/jpeg');

        const file = new File([blob], `generated.${extension}`, { type: mimeType });

        if (navigator.canShare({ files: [file] })) {
          // IMPORTANT: Do NOT include title, text, or url when sharing files. 
          // AirDrop and many native share sheets will fail if you mix files and text/urls.
          await navigator.share({
            files: [file]
          });
          await api.post(`/share/${item.id}/track`, { event: 'share' });
          return;
        } else if (navigator.canShare(shareData)) {
          // Can share URL but not files
          await navigator.share(shareData);
          await api.post(`/share/${item.id}/track`, { event: 'share' });
          return;
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error with native sharing, falling back to modal:', err);
        } else {
          // User aborted sharing, do nothing
          return;
        }
      }
    }

    // Fallback: Open Share Modal
    setSelectedMedia(item);
    setIsShareModalOpen(true);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="spinner"></div>
      <div>Loading your dashboard...</div>
    </div>
  );

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {profile?.name}</h2>
        <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>Email: {profile?.email}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Your Generation History</h3>
        {history.some(i => i.status === 'QUEUED' || i.status === 'PROCESSING') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--primary-color)' }} className="pulse">
            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
            Updating live...
          </div>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>You haven't generated anything yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {history.map((item) => item.status === 'FAILED' ? (
            <GenerationFailureCard 
              key={item.id}
              item={item}
              onRegenerate={handleRegenerate}
              onDelete={handleDelete}
            />
          ) : (
            <div key={item.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              
              <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {item.status === 'COMPLETED' ? (
                  item.type === 'MEME' && !item.mediaUrl ? (
                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', borderRadius: '8px', width: '100%' }}>
                      {item.memeData?.title && <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{item.memeData.title}</h4>}
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.5 }}>{item.memeData?.text}</p>
                    </div>
                  ) : item.mediaUrl ? (
                    item.type === 'VIDEO' ? (
                      item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.webm') ? (
                        <video src={item.mediaUrl} controls autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={item.mediaUrl} alt={item.prompt} className="ken-burns" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )
                    ) : item.type === 'MEME' ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {(item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.webm')) ? (
                          <video src={item.mediaUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={item.mediaUrl} alt={item.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        {item.memeData?.text && item.memeData?.mode !== 'GIF' && (
                          <div style={{
                            position: 'absolute', bottom: '1rem', left: '0', right: '0',
                            color: 'white', padding: '0.5rem',
                            textAlign: 'center', fontSize: '1.2rem', fontWeight: '900',
                            fontFamily: 'Impact, sans-serif', textTransform: 'uppercase',
                            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000',
                            letterSpacing: '1px'
                          }}>
                            {item.memeData.text}
                          </div>
                        )}
                      </div>
                    ) : (
                      <img src={item.mediaUrl} alt={item.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : 'No media available'
                ) : (
                  <div className="pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner"></div>
                    <span style={{ fontSize: '0.9rem', color: '#ffb000' }}>{item.status}...</span>
                  </div>
                )}
              </div>

              {item.status === 'COMPLETED' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                  <button onClick={() => handleToggleFavorite(item.id)} title="Favorite" style={{ background: 'none', border: 'none', color: item.isFavorite ? '#ff4b4b' : 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={18} fill={item.isFavorite ? '#ff4b4b' : 'none'} />
                  </button>
                  <button onClick={() => handleDownload(item)} title="Download" style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
                    <Download size={18} />
                  </button>
                  <button onClick={() => handleCopyLink(item)} title="Copy Link" style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
                    <Copy size={18} />
                  </button>
                  <button onClick={() => handleShare(item)} title="Share" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Share size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} title="Delete" style={{ background: 'none', border: 'none', color: '#ff7b72', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>{item.prompt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                <span>{item.type}</span>
                <span>{item.model}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          media={selectedMedia}
          shareUrl={`${window.location.origin}/share/${selectedMedia.id}`}
        />
      )}
    </div>
  );
}
