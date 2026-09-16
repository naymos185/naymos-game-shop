'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Send,
  Image as ImageIcon,
  Headphones,
  Bot,
  LogIn,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { ChatMessage, ChatConversation } from '@/lib/chat/types';

interface FloatingChatWidgetProps {
  currentUser?: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
}

export function FloatingChatWidget({ currentUser }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'admin'>('ai');
  const [unreadCount, setUnreadCount] = useState(0);

  // AI chat state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'สวัสดีค้าบ! น้องหลาม NayMos ยินดีช่วยเหลือ มีอะไรให้หลามช่วยสอบถามได้เลยนะค้าบ 🦈✨',
      time: 'ตอนนี้',
    },
  ]);

  // Admin chat state
  const [adminMessages, setAdminMessages] = useState<ChatMessage[]>([]);
  const [adminInput, setAdminInput] = useState('');
  const [sendingAdmin, setSendingAdmin] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Poll for unread admin messages when logged in
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    const fetchChatState = async () => {
      try {
        const res = await fetch('/api/chat/messages');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.conversation) {
          if (isOpen && activeTab === 'admin') {
            setUnreadCount(0);
          } else {
            setUnreadCount(data.conversation.unread_user_count || 0);
          }
          if (data.messages) {
            setAdminMessages(data.messages);
          }
        }
      } catch {}
    };

    fetchChatState();
    const interval = setInterval(fetchChatState, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, isOpen, activeTab]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [aiMessages, adminMessages, activeTab, isOpen]);

  // Clear unread count when switching to admin tab
  useEffect(() => {
    if (isOpen && activeTab === 'admin') {
      setUnreadCount(0);
    }
  }, [isOpen, activeTab]);

  // Handle AI ask
  const handleAskAi = async (questionText?: string) => {
    const q = (questionText || aiInput).trim();
    if (!q || aiLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      const aiReply = data.answer || 'หลามก็ไม่ทราบเหมือนกันค้าบ🥹 แต่สามารถติดต่อ admin ได้เลยนะค้าบบบบ';
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'หลามก็ไม่ทราบเหมือนกันค้าบ🥹 แต่สามารถติดต่อ admin ได้เลยนะค้าบบบบ',
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle send to admin
  const handleSendAdmin = async (imageUrl?: string) => {
    const text = adminInput.trim();
    if ((!text && !imageUrl) || sendingAdmin) return;

    setSendingAdmin(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text || null, image_url: imageUrl || null }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setAdminMessages((prev) => [...prev, data.message]);
        }
        setAdminInput('');
      }
    } catch {} finally {
      setSendingAdmin(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        await handleSendAdmin(data.url);
      }
    } catch {} finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-2xl bg-white p-0.5 shadow-sm overflow-hidden shrink-0 border border-sky-200">
                <Image
                  src="/images/shark-chat.webp"
                  alt="น้องหลาม"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm leading-tight text-white">
                  <span>น้องหลาม Support</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <p className="text-[11px] text-sky-100 leading-tight">
                  {activeTab === 'ai' ? '🤖 AI ตอบทันที 24 ชม.' : '💬 พี่แอดมินคนจริง'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              title="ปิดหน้าต่างแชท"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Not logged in prompt */}
          {!currentUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-sky-50/50 to-white">
              <div className="w-20 h-20 relative mb-3">
                <Image
                  src="/images/shark-chat.webp"
                  alt="น้องหลาม"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                กรุณาเข้าสู่ระบบก่อนแชทนะค้าบ 🦈
              </h3>
              <p className="text-xs text-slate-500 mb-5 max-w-[240px]">
                เพื่อความปลอดภัยและการดูแลออเดอร์อย่างใกล้ชิด กรุณาล็อกอินเข้าสู่ระบบก่อนเริ่มสนทนาค้าบ
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[220px]">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center py-2 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 font-medium text-xs border border-sky-200 transition"
                  onClick={() => setIsOpen(false)}
                >
                  สมัครสมาชิกใหม่
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-sky-100 bg-sky-50/60 p-1.5 gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'ai'
                      ? 'bg-white text-sky-600 shadow-xs border border-sky-200/60'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-sky-500" />
                  <span>น้องหลาม AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition relative ${
                    activeTab === 'admin'
                      ? 'bg-white text-sky-600 shadow-xs border border-sky-200/60'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-blue-500" />
                  <span>ติดต่อแอดมิน</span>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
              </div>

              {/* Chat Content Body */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f8fbfe]"
              >
                {activeTab === 'ai' ? (
                  <>
                    {/* Suggested Chips */}
                    <div className="bg-white rounded-2xl p-2.5 border border-sky-100 shadow-xs">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 mb-1.5">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        <span>คำถามยอดฮิตที่ถามบ่อย:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['วิธีเติมเงิน', 'ช่องทางชำระเงิน', 'ติดตามออเดอร์', 'เวลาทำการ'].map(
                          (chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleAskAi(chip)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200/60 transition active:scale-95"
                            >
                              {chip}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* AI Messages */}
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 overflow-hidden relative shrink-0 mt-0.5">
                            <Image
                              src="/images/shark-chat.webp"
                              alt="AI"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line shadow-xs ${
                            msg.sender === 'user'
                              ? 'bg-sky-500 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-sky-100 rounded-tl-xs'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              msg.sender === 'user' ? 'text-sky-100' : 'text-slate-400'
                            }`}
                          >
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex gap-2 items-center text-xs text-sky-500">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                        <span>น้องหลามกำลังคิดคำตอบให้ค้าบ...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Admin Chat Notice */}
                    <div className="bg-sky-50/70 rounded-xl p-2.5 border border-sky-100 text-center">
                      <p className="text-[11px] text-sky-700">
                        แอดมินพร้อมตอบกลับและดูแลคุณ สามารถพิมพ์ข้อความหรือส่งรูปสลิป/หน้าจอได้เลยครับ
                      </p>
                    </div>

                    {/* Admin Messages */}
                    {adminMessages.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        ยังไม่มีข้อความ เริ่มต้นทักหาพี่แอดมินได้เลยค้าบ ✨
                      </div>
                    ) : (
                      adminMessages.map((msg) => {
                        const isMe = msg.sender_role === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                                AD
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                                isMe
                                  ? 'bg-sky-500 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-800 border border-sky-100 rounded-tl-xs'
                              }`}
                            >
                              {msg.message && <p className="whitespace-pre-line">{msg.message}</p>}
                              {msg.image_url && (
                                <a
                                  href={msg.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-1.5 rounded-lg overflow-hidden border border-sky-200/60 max-w-[200px]"
                                >
                                  <img
                                    src={msg.image_url}
                                    alt="แนบรูปภาพ"
                                    className="w-full h-auto object-cover max-h-40"
                                  />
                                </a>
                              )}
                              <span
                                className={`block text-[9px] mt-1 text-right ${
                                  isMe ? 'text-sky-100' : 'text-slate-400'
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

              {/* Chat Input Footer */}
              <div className="p-2.5 bg-white border-t border-sky-100">
                {activeTab === 'ai' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskAi();
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="ถามน้องหลามได้เลยค้าบ..."
                      className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-400 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || aiLoading}
                      className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white flex items-center justify-center transition shadow-xs shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAdmin();
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || sendingAdmin}
                      className="w-9 h-9 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center transition shrink-0"
                      title="ส่งรูปภาพ"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      placeholder="พิมพ์ข้อความหาแอดมิน..."
                      className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-400 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!adminInput.trim() || sendingAdmin}
                      className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white flex items-center justify-center transition shadow-xs shrink-0"
                    >
                      {sendingAdmin ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto group relative flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-hidden"
        title="แชทกับน้องหลาม NayMos"
      >
        {/* Cute Shark Image Badge Button */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl filter">
          <Image
            src="/images/shark-chat.webp"
            alt="แชทเลย! น้องหลาม NayMos"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Unread Message Badge Notification */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white shadow-md animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
