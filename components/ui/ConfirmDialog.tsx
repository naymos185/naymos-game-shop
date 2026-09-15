'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'default';
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmBtn = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      setPending((current) => {
        current?.resolve(ok);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!pending) return;
    confirmBtn.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="ปิด"
            onClick={() => close(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 id="confirm-title" className="text-base font-bold text-slate-900">
                {pending.title}
              </h2>
              {pending.description && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {pending.description}
                </p>
              )}
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="flex-1 rounded-full border border-sky-200 bg-sky-50/60 hover:bg-sky-100 py-2.5 text-xs font-bold text-slate-700 transition"
              >
                {pending.cancelText ?? 'ยกเลิก'}
              </button>
              <button
                ref={confirmBtn}
                type="button"
                onClick={() => close(true)}
                className="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-sky-500/20"
              >
                {pending.confirmText ?? 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return (options: ConfirmOptions) => {
      const text = [options.title, typeof options.description === 'string' ? options.description : ''].filter(Boolean).join('
');
      return Promise.resolve(typeof window !== 'undefined' ? window.confirm(text) : true);
    };
  }
  return ctx;
}

export { Loader2 as ConfirmSpinner };
