'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowConfirm(false);
      router.push('/');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={() => !loading && setShowConfirm(false)} />

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
          <LogOut className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">ยืนยันการออกจากระบบ</h3>
          <p className="text-xs text-slate-500 mt-1">คุณต้องการออกจากระบบ ใช่หรือไม่?</p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowConfirm(false)}
            className="flex-1 rounded-full border border-sky-200 bg-sky-50/50 hover:bg-sky-100 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleLogout}
            className="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-sky-500/20"
          >
            {loading ? 'กำลังออก...' : 'ออกจากระบบ'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={
          className ??
          'flex items-center gap-1.5 rounded-full border border-sky-200 bg-white hover:bg-rose-50 hover:border-rose-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-rose-600 transition shadow-xs'
        }
      >
        <LogOut className="h-3.5 w-3.5 text-slate-500" />
        <span>ออกจากระบบ</span>
      </button>

      {showConfirm && mounted && createPortal(modal, document.body)}
    </>
  );
}
