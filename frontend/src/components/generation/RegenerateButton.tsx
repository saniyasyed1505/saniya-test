import React, { useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';

interface RegenerateButtonProps {
  onRegenerate: (options: { seedMode: 'same' | 'random' }) => Promise<void>;
  disabled?: boolean;
}

export default function RegenerateButton({ onRegenerate, disabled = false }: RegenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleRegenerate = async (seedMode: 'same' | 'random') => {
    if (disabled || loading) return;
    setLoading(true);
    setShowOptions(false);
    try {
      await onRegenerate({ seedMode });
    } finally {
      // If successful, the parent usually unmounts this component.
      // If failed, we reset the loading state.
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex' }}>
        <button
          onClick={() => handleRegenerate('same')}
          disabled={disabled || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: loading ? '#444' : '#238636',
            color: '#fff',
            border: 'none',
            borderRadius: '6px 0 0 6px',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Regenerating...' : 'Regenerate'}
        </button>
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled || loading}
          style={{
            padding: '8px',
            backgroundColor: loading ? '#444' : '#2ea043',
            color: '#fff',
            border: 'none',
            borderLeft: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0 6px 6px 0',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {showOptions && !disabled && !loading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 10,
          minWidth: '150px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => handleRegenerate('same')}
            style={{
              width: '100%',
              padding: '12px 16px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              color: '#c9d1d9',
              border: 'none',
              borderBottom: '1px solid #30363d',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <strong>Same Seed</strong>
            <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>Produces nearly identical results</div>
          </button>
          <button
            onClick={() => handleRegenerate('random')}
            style={{
              width: '100%',
              padding: '12px 16px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              color: '#c9d1d9',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <strong>Random Seed</strong>
            <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>Keeps prompt, different output</div>
          </button>
        </div>
      )}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
