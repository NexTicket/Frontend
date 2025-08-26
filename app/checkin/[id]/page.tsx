'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    __nexticket_detached?: boolean;
  }
}

export default function CheckinPage() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [detached, setDetached] = useState(false);
  const bcRef = useRef<BroadcastChannel | null>(null);

  // mark detached if ?detached=1 or =true present
  useEffect(() => {
    const val = searchParams?.get('detached');
    const isDetached = val === '1' || val === 'true';
    if (isDetached) {
      try { sessionStorage.setItem('nexticket_detached', '1'); } catch (e) { /* ignore */ }
      // global mark to let other scripts check quickly
      try { (window as Window & { __nexticket_detached?: boolean }).__nexticket_detached = true; } catch (e) { /* ignore */ }
      setDetached(true);
    } else {
      setDetached(false);
    }
  }, [searchParams]);

  // Prevent cross-tab navigation messages when detached:
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // Ignore any navigation signals if this tab is detached
      try {
        if (sessionStorage.getItem('nexticket_detached')) return;
      } catch (err) { /* ignore */ }
      // If your app uses storage keys to navigate, handle them here when NOT detached
    };
    const onMessage = (ev: MessageEvent) => {
      // web message based redirects — ignore when detached
      try {
        if ((window as Window & { __nexticket_detached?: boolean }).__nexticket_detached || sessionStorage.getItem('nexticket_detached')) return;
      } catch { return; }
      if (ev.data && ev.data.type === 'nex:navigate' && ev.data.url) {
        router.push(ev.data.url);
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);

    // BroadcastChannel listener (if app uses it)
    try {
      const bc = new BroadcastChannel('nex-ticket');
      bc.onmessage = (msg) => {
        try {
          if (sessionStorage.getItem('nexticket_detached')) return;
        } catch (err) { /* ignore */ }
        // handle when not detached: e.g., if msg.data.type === 'navigate' -> router.push(...)
      };
      bcRef.current = bc;
    } catch (e) { /* BroadcastChannel not available */ }

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
      try { bcRef.current?.close(); } catch (e) {}
    };
  }, [router]);

  // Only redirect to signin if unauthenticated. Do NOT redirect to dashboard or other pages.
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
      try { delete window.__nexticket_detached; } catch (e) {}
    }
  }, [isLoading, firebaseUser, router]);

  // Optional: allow user to clear detached flag
  const clearDetached = () => {
    try { sessionStorage.removeItem('nexticket_detached'); } catch (e) { /* ignore */ }
    try { delete (window as Window & { __nexticket_detached?: boolean }).__nexticket_detached; } catch (e) {}
    setDetached(false);
  };

  // Scanner placeholder — integrate your actual scanner component here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 text-center">
        <div className="mx-auto mb-4 w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
          <QrCode className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Check-in Scanner</h1>
        <p className="text-sm text-gray-600 mb-4">
          {detached ? 'Opened in detached tab — cross-tab redirects are ignored.' : 'Scanner page'}
        </p>

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-4">
          <p className="text-sm text-gray-500">Scanner placeholder — integrate camera/QR scanner here.</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button onClick={() => { clearDetached(); window.location.reload(); }}>
            Clear detached & reload
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <div>Path: {pathname}</div>
          {userProfile?.displayName && <div>Signed in as {userProfile.displayName}</div>}
        </div>
      </div>
    </div>
  );
}