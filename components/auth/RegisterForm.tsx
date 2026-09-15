'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP field & countdown
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    // 1. Validate full_name strictly: only lowercase English letters, numbers, underscore
    if (!cleanName) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    if (/[A-Z]/.test(cleanName)) {
      setError('ชื่อผู้ใช้ต้องเป็นตัวพิมพ์เล็กเท่านั้น ห้ามใช้อักษรพิมพ์ใหญ่ (A-Z)');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanName)) {
      setError('ชื่อผู้ใช้ต้องเป็นตัวพิมพ์เล็กภาษาอังกฤษ (a-z) หรือตัวเลขเท่านั้น ห้ามใช้ภาษาไทยหรือภาษาอื่น');
      return;
    }

    // 2. Validate passwords
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้ง 2 ช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If user is created, save initial profile
      if (data.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: data.user.email,
              full_name: cleanName,
              role: 'customer',
            },
            { onConflict: 'id' }
          );
        } catch {
          // non-blocking
        }
      }

      // Move to OTP step
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setSuccess(`ระบบได้ส่งรหัส OTP ไปยังอีเมล ${cleanEmail} แล้ว`);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('กรุณากรอกรหัส OTP');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: 'signup',
      });

      if (verifyError) {
        setError(verifyError.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName.trim(),
            role: 'customer',
          },
          { onConflict: 'id' }
        );
      }

      setSuccess('ยืนยันรหัส OTP สำเร็จ! กำลังเข้าสู่ระบบ...');
      setTimeout(() => {
        router.push('/account');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ยืนยันรหัส OTP ไม่สำเร็จ');
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!canResend || resending) return;
    setError(null);
    setSuccess(null);
    setResending(true);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (resendError) {
        setError(resendError.message || 'ส่งรหัส OTP ไม่สำเร็จ');
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

  if (step === 'otp') {
    return (
      <form
        onSubmit={handleVerifyOtp}
        className="rounded-3xl border-2 border-sky-100 bg-white p-6 sm:p-8 shadow-xl shadow-sky-100/60 space-y-5 animate-fade-in"
      >
        <div className="text-center space-y-1.5 pb-2 border-b border-sky-50">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-sky-950">กรอกรหัสยืนยัน OTP</h2>
          <p className="text-xs text-slate-500">
            ระบบได้ส่งรหัส OTP ไปที่อีเมล <span className="font-bold text-sky-600">{email}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-sky-950 mb-1.5 text-center">
            รหัส OTP (จากอีเมลของคุณ)
          </label>
          <input
            type="text"
            required
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="กรอกรหัส OTP ที่ได้รับ"
            className="w-full text-center tracking-widest text-xl font-black rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !otp.trim()}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 disabled:opacity-60 disabled:cursor-not-allowed py-3.5 font-bold text-white shadow-md shadow-sky-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังตรวจสอบรหัส...</span>
            </>
          ) : (
            <span>ยืนยันรหัส OTP</span>
          )}
        </button>

        {/* Resend button with 30s countdown */}
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={() => {
              setStep('register');
              setError(null);
            }}
            className="text-slate-500 hover:text-sky-600 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับไปแก้ไขข้อมูล
          </button>

          <button
            type="button"
            disabled={!canResend || resending}
            onClick={handleResendOtp}
            className={`flex items-center gap-1 font-bold ${
              canResend
                ? 'text-sky-600 hover:text-sky-700 hover:underline cursor-pointer'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {canResend ? 'ส่งรหัสอีกครั้ง' : `ส่งรหัสอีกครั้งใน (${countdown} วิ)`}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
      className="rounded-3xl border-2 border-sky-100 bg-white p-6 sm:p-8 shadow-xl shadow-sky-100/60 space-y-4"
    >
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Username / Name: strictly lowercase english */}
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sky-500" />
          ชื่อผู้ใช้ (ตัวพิมพ์เล็กภาษาอังกฤษเท่านั้น)
        </label>
        <input
          name="full_name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="เช่น naymos_shop (ห้ามใช้ตัวพิมพ์ใหญ่หรือภาษาไทย)"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all font-mono"
        />
        <p className="text-[11px] text-slate-500 mt-1 pl-1">
          * เป็นตัวเข้ารหัสระบบ ใช้เฉพาะตัวพิมพ์เล็ก a-z, 0-9 และ _ เท่านั้น
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-sky-500" />
          อีเมลจริง (ต้องรับรหัส OTP)
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
        />
      </div>

      {/* Password 1 */}
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-sky-500" />
          รหัสผ่าน
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition"
            aria-label="ดูรหัสผ่าน"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password 2 (Confirm Password) */}
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-sky-500" />
          ยืนยันรหัสผ่านอีกครั้ง
        </label>
        <div className="relative">
          <input
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านให้ตรงกัน"
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition"
            aria-label="ดูรหัสผ่านยืนยัน"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 disabled:opacity-60 disabled:cursor-not-allowed py-3.5 font-bold text-white shadow-md shadow-sky-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>กำลังส่งข้อมูลและขอรหัส OTP...</span>
          </>
        ) : (
          <span>สมัครสมาชิก (รับรหัส OTP)</span>
        )}
      </button>
    </form>
  );
}
