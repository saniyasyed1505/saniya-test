import React from 'react';

interface RetryStatusBadgeProps {
  retryCount: number;
  maxRetries?: number;
}

export default function RetryStatusBadge({ retryCount, maxRetries = 5 }: RetryStatusBadgeProps) {
  if (retryCount === 0) return null;
  
  const isMaxedOut = retryCount >= maxRetries;
  
  return (
    <span style={{ 
      fontSize: '0.75rem', 
      padding: '2px 8px', 
      borderRadius: '12px', 
      backgroundColor: isMaxedOut ? '#442222' : '#333',
      color: isMaxedOut ? '#ff7b72' : '#8b949e',
      border: `1px solid ${isMaxedOut ? '#882222' : '#444'}`
    }}>
      Retry {retryCount}/{maxRetries}
    </span>
  );
}
