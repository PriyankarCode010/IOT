"use client";
import { useEffect, useState } from 'react';

export default function NotificationManager() {
  const [permission, setPermission] = useState('default');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(window.Notification.permission);
      
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission().then((result) => {
          setPermission(result);
          if (result !== 'granted') {
            setToast('Enable notifications to get message alerts!');
          }
        });
      }
    }
  }, []);

  return toast ? (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#111827',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontFamily: 'inherit',
      fontSize: 16,
      letterSpacing: 0.2,
      opacity: 0.95,
    }}>
      {toast}
    </div>
  ) : null;
} 