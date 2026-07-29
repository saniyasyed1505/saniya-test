import React, { useEffect } from 'react';
import { XCircle, Trash2, Edit3 } from 'lucide-react';
import RegenerateButton from './RegenerateButton';
import RetryStatusBadge from './RetryStatusBadge';

interface GenerationFailureCardProps {
  item: any;
  onRegenerate: (id: string, options: { seedMode: 'same' | 'random' }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditPrompt?: (prompt: string) => void;
}

export default function GenerationFailureCard({ 
  item, 
  onRegenerate, 
  onDelete,
  onEditPrompt
}: GenerationFailureCardProps) {
  
  const isNetworkError = item.errorMessage?.includes('NETWORK_ERROR') || item.errorMessage?.includes('TIMEOUT');
  const isMaxRetries = (item.retryCount || 0) >= 5;
  const shouldAutoRetry = isNetworkError && (item.retryCount || 0) === 0;

  useEffect(() => {
    if (shouldAutoRetry) {
      // Auto-retry once after 3 seconds for network errors
      const timer = setTimeout(() => {
        onRegenerate(item.id, { seedMode: 'same' }).catch(console.error);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoRetry, item.id, onRegenerate]);

  return (
    <div style={{
      backgroundColor: '#161b22',
      border: '1px solid #882222',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      height: '100%',
      minHeight: '250px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <RetryStatusBadge retryCount={item.retryCount || 0} maxRetries={5} />
      </div>

      <XCircle size={48} color="#ff7b72" style={{ marginBottom: '8px' }} />
      
      <div>
        <h3 style={{ margin: '0 0 8px 0', color: '#ff7b72', fontSize: '1.2rem' }}>
          Generation Failed
        </h3>
        <p style={{ margin: 0, color: '#8b949e', fontSize: '0.9rem', maxWidth: '80%' }}>
          {item.errorMessage || "We couldn't generate your content."}
        </p>
        
        {isMaxRetries && (
          <p style={{ margin: '8px 0 0 0', color: '#ff7b72', fontSize: '0.85rem', fontWeight: 600 }}>
            You've reached the retry limit for this generation.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <RegenerateButton 
          onRegenerate={(opts) => onRegenerate(item.id, opts)} 
          disabled={isMaxRetries || shouldAutoRetry}
        />
        
        {onEditPrompt && (
          <button
            onClick={() => onEditPrompt(item.prompt)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#c9d1d9',
              border: '1px solid #30363d',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <Edit3 size={16} />
            Edit Prompt
          </button>
        )}

        <button
          onClick={() => onDelete(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#ff7b72',
            border: '1px solid rgba(255,123,114,0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
      
      {shouldAutoRetry && (
        <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '8px' }}>
          Network issue detected. Auto-retrying in 3 seconds...
        </div>
      )}
    </div>
  );
}
