'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthResult = {
  success: boolean;
  message?: string;
};

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  if (!email || !password) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }
  if (password.length < 6) {
    return { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user) {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || null,
        role: 'customer',
      },
      { onConflict: 'id' }
    );
  }

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: data.session
      ? 'สมัครสำเร็จ'
      : 'สมัครสำเร็จ — โปรดยืนยันอีเมลถ้าโปรเจกต์เปิด Confirm email ไว้',
  };
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
