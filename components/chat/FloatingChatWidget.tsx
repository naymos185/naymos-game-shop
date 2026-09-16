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
import { createClient } from '@/lib/supabase/client';

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
  const [conversationId, setConversationId] = useState<string | null>(null);

  // AI chat state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
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
  const supabase = createClient();

  // Fetch initial chat state
  const fetchChatState = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/chat/messages');
      if (!res.ok) return;
      const data = await res.json();
      if (data.conversation) {
        setConversationId(data.conversation.id);
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

  useEffect(() => {
    if (!currentUser) return;
    fetchChatState();
    const interval = setInterval(fetchChatState, 5000);
    return () => clearInterval(interval);
  }, [currentUser, isOpen, activeTab]);

  // Real-time Supabase Subscription
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    const channel = supabase
      .channel(`chat_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setAdminMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_role === 'admin') {
            if (!isOpen || activeTab !== 'admin') {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, conversationId, isOpen, activeTab]);

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

  // Handle Send AI message
  const handleSendAi = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;

    const userMsg = { sender: 'user' as const, text, time: 'ตอนนี้' };
    const history = aiMessages.map((m) => ({ sender: m.sender, text: m.text }));

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, history }),
      });

      if (!res.ok) {
        throw new Error('Network error');
      }

      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer || 'เรื่องนี้ผมยังไม่มีข้อมูลที่ยืนยันได้ครับพี่ เดี๋ยวให้แอดมินช่วยเช็กให้ดีกว่าครับ',
          time: 'ตอนนี้',
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'ขอโทษนะครับพี่ ตอนนี้ระบบผู้ช่วยอัตโนมัติมีปัญหานิดหน่อยครับ พี่สามารถส่งข้อความไว้ได้เลยครับ เดี๋ยวแอดมินเข้ามาช่วยดูให้ครับ',
          time: 'ตอนนี้',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Send Admin message
  const handleSendAdmin = async (imageUrl?: string) => {
    const text = adminInput.trim();
    if ((!text && !imageUrl) || sendingAdmin) return;

    setSendingAdmin(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || null,
          image_url: imageUrl || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setAdminMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
        setAdminInput('');
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    } finally {
      setSendingAdmin(false);
    }
  };

  // Handle Upload Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้นครับ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB ครับ');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.url) {
        await handleSendAdmin(data.url);
      }
    } catch {
      alert('อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && activeTab === 'admin') {
              setUnreadCount(0);
            }
          }}
          className="relative group flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-200"
          aria-label="ติดต่อและสอบถาม"
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white transition-transform duration-300 rotate-90 group-hover:rotate-180" />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/images/shark-chat.png"
                alt="NayMos Chat"
                width={52}
                height={52}
                className="object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                priority
              />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
          )}

          {/* Unread Message Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Popover Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm p-1.5 flex items-center justify-center border border-white/30">
                  <Image
                    src="/images/shark-chat.png"
                    alt="NayMos Assistant"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                    NayMos GameShop
                    <span className="text-[10px] bg-sky-300/30 text-white px-1.5 py-0.5 rounded-full border border-white/20">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-sky-100 font-light">
                    {activeTab === 'ai' ? 'ผู้ช่วยบริการตอบคำถามอัตโนมัติ' : 'สนทนากับเจ้าหน้าที่ร้าน'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-black/15 p-1 rounded-2xl mt-1">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === 'ai'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-sky-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                แชทกับผู้ช่วย AI
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setUnreadCount(0);
                }}
                className={`relative flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === 'admin'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-sky-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                ติดต่อแอดมิน
                {unreadCount > 0 && activeTab !== 'admin' && (
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Auth Guard Notice for Non-logged-in users */}
          {!currentUser ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-sky-50/50">
              <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
                <LogIn className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-1">
                เข้าสู่ระบบเพื่อใช้งานแชท
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                กรุณาเข้าสู่ระบบเพื่อพูดคุยกับผู้ช่วย AI สอบถามข้อมูล หรือติดต่อทีมงานแอดมินหลังบ้านครับ
              </p>
              <Link
                href="/auth/login"
                className="w-full max-w-xs py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition text-center"
              >
                เข้าสู่ระบบทันที
              </Link>
            </div>
          ) : (
            <>
              {/* Chat Messages Body */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20"
              >
                {activeTab === 'ai' ? (
                  // AI Tab Messages
                  <>
                    <div className="text-center my-2">
                      <span className="text-[11px] bg-sky-100/70 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                        ⚡ ผู้ช่วยอัตโนมัติตอบคำถามทั่วไปและบริการร้าน
                      </span>
                    </div>

                    {aiMessages.map((msg, idx) => (
                      <div
                        key={`ai-msg-${idx}`}
                        className={`flex gap-2.5 ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-1">
                            <Image
                              src="/images/shark-chat.png"
                              alt="AI"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-sky-100 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                          <div
                            className={`text-[9px] mt-1 text-right ${
                              msg.sender === 'user' ? 'text-sky-200' : 'text-gray-400'
                            }`}
                          >
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    ))}

                    {aiLoading && (
                      <div className="flex gap-2.5 items-center text-gray-400 text-xs pl-2">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                        <span>กำลังหาคำตอบให้พี่อยู่นะครับ...</span>
                      </div>
                    )}
                  </>
                ) : (
                  // Admin Tab Messages
                  <>
                    <div className="text-center my-2">
                      <span className="text-[11px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                        🛡️ สนทนาสดกับแอดมิน NayMos GameShop
                      </span>
                    </div>

                    {adminMessages.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center">
                        <Headphones className="w-8 h-8 text-sky-400 mb-2 opacity-50" />
                        พิมพ์ข้อความหรือส่งรูปภาพเพื่อเริ่มคุยกับแอดมินได้เลยครับ
                      </div>
                    ) : (
                      adminMessages.map((msg) => {
                        const isMe = msg.sender_role === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 mt-1">
                                AD
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                                isMe
                                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-800 border border-sky-100 rounded-bl-none'
                              }`}
                            >
                              {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                              {msg.image_url && (
                                <a
                                  href={msg.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-1.5 rounded-lg overflow-hidden border border-black/10 hover:opacity-90 transition"
                                >
                                  <img
                                    src={msg.image_url}
                                    alt="ภาพแนบ"
                                    className="max-h-48 w-auto rounded object-cover"
                                  />
                                </a>
                              )}
                              <div
                                className={`text-[9px] mt-1 text-right ${
                                  isMe ? 'text-sky-200' : 'text-gray-400'
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-sky-100">
                {activeTab === 'ai' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAi();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="พิมพ์คำถาม เช่น เติมเกมยังไง, ช่องทางชำระเงิน..."
                      className="flex-1 bg-sky-50/60 border border-sky-200 focus:border-sky-400 focus:bg-white rounded-2xl px-3.5 py-2 text-xs outline-none transition"
                      disabled={aiLoading}
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || aiLoading}
                      className="w-9 h-9 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-md transition"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAdmin();
                    }}
                    className="flex items-center gap-2"
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
                      className="w-9 h-9 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center transition"
                      title="แนบรูปภาพ"
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
                      placeholder="พิมพ์ข้อความถึงแอดมิน..."
                      className="flex-1 bg-sky-50/60 border border-sky-200 focus:border-sky-400 focus:bg-white rounded-2xl px-3.5 py-2 text-xs outline-none transition"
                      disabled={sendingAdmin}
                    />
                    <button
                      type="submit"
                      disabled={!adminInput.trim() || sendingAdmin}
                      className="w-9 h-9 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-md transition"
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
    </>
  );
}
