'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface ChangePasswordModalProps {
  email: string;
}

export function ChangePasswordModal({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'initial' | 'otp_form'>('initial');

  // Form states
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Countdown for OTP
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp_form' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  function handleOpen() {
    setIsOpen(true);
    setStep('initial');
    setError(null);
    setSuccess(null);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  }

  function handleClose() {
    setIsOpen(false);
    setError(null);
    setSuccess(null);
  }

  // Send OTP
  async function handleSendOtp() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        setError(resetError.message || 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
        return;
      }

      setStep('otp_form');
      setCountdown(30);
      setCanResend(false);
      setSuccess(`ระบบได้ส่งรหัส OTP ไปยังอีเมล ${email} เรียบร้อยแล้ว`);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่ง OTP');
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (!canResend || resending) return;
    setError(null);
    setSuccess(null);
    setResending(true);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(email);

      if (resendError) {
        setError(resendError.message || 'ส่งรหัส OTP อีกครั้งไม่สำเร็จ');
      } else {
        setSuccess('ส่งรหัส OTP ใหม่ไปยังอีเมลเรียบร้อยแล้ว');
        setCountdown(30);
        setCanResend(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งรหัส OTP ไม่สำเร็จ');
    }
    setResending(false);
  }

  // Submit Verify OTP & Update Password
  async function handleConfirmChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านใหม่ทั้ง 2 ช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Verify recovery OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: cleanOtp,
        type: 'recovery',
      });

      if (verifyError) {
        setError(verifyError.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
        setLoading(false);
        return;
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
        return;
      }

      setSuccess('เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100 hover:border-sky-300"
      >
        <KeyRound className="h-3.5 w-3.5 text-sky-600" />
        เปลี่ยนรหัสผ่าน
      </button>

      {isOpen && mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={handleClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-900/10 z-10 transition-all">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">เปลี่ยนรหัสผ่าน</h3>
                  <p className="text-xs text-slate-500">ยืนยันตัวตนด้วยรหัส OTP ผ่านอีเมล</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {step === 'initial' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-xs text-slate-700 leading-relaxed">
                    ระบบจะส่งรหัสความปลอดภัย (OTP 6 หลัก) ไปยังอีเมล:
                    <div className="mt-1 font-semibold text-sky-800 text-sm flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-sky-600" />
                      {email}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    โปรดตรวจสอบกล่องข้อความหรืออีเมลขยะ เพื่อนำรหัสมากรอกและตั้งรหัสผ่านใหม่
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : (
                        'ขอรหัส OTP ทางอีเมล'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmChangePassword} className="space-y-4">
                  {/* OTP Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัส OTP (6 หลัก)
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || resending}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 disabled:text-slate-400 transition"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {canResend ? (
                          'ส่งรหัสอีกครั้ง'
                        ) : (
                          `ส่งอีกครั้งใน ${countdown} วิ`
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="กรอกรหัส 6 หลักจากอีเมล"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm font-semibold tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ตั้งรหัสผ่านใหม่"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ยืนยันรหัสผ่านใหม่อีกครั้ง
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('initial')}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          กำลังตรวจสอบ...
                        </>
                      ) : (
                        'ยืนยันเปลี่ยนรหัสผ่าน'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
