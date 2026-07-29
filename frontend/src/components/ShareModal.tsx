import React from 'react';
import { X, Copy, Download, MessageCircle, Share2 } from 'lucide-react';
import { api } from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: any;
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, media, shareUrl }: ShareModalProps) {
  if (!isOpen) return null;

  const title = `Generated ${media.type.toLowerCase()}: ${media.prompt}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const trackShare = async (event: 'share' | 'copy' | 'download') => {
    try {
      await api.post(`/share/${media.id}/track`, { event });
    } catch (e) {
      console.error('Failed to track share event', e);
    }
  };

  const shareLinks = [
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, color: '#25D366' },
    { name: 'X', icon: <Share2 size={20} />, url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, color: '#000000' },
    { name: 'Facebook', icon: <Share2 size={20} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: '#1877F2' },
    { name: 'Telegram', icon: <Share2 size={20} />, url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, color: '#0088cc' },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackShare('copy');
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleDownload = async () => {
    if (!media.mediaUrl) return;
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
      trackShare('download');
    } catch (err) {
      alert('Failed to download media');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '400px', padding: '1.5rem',
        borderRadius: '16px', position: 'relative',
        background: 'var(--surface-color)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'transparent', border: 'none', color: 'var(--text-color)',
          cursor: 'pointer'
        }}>
          <X size={24} />
        </button>
        
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Share Media</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {shareLinks.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare('share')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.5rem', textDecoration: 'none', color: 'var(--text-color)',
                fontSize: '0.75rem', textAlign: 'center'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: link.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s'
              }}>
                {link.icon}
              </div>
              {link.name}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopyLink} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Copy size={18} /> Copy Link
          </button>
          <button onClick={handleDownload} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
