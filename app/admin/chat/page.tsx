'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Image as ImageIcon,
  User,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  RefreshCw,
  Sliders,
  Settings,
  Users,
} from 'lucide-react';
import type { ChatConversation, ChatMessage, ChatAiKnowledge, ChatAiSettings } from '@/lib/chat/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Active View tabs
  const [activeView, setActiveView] = useState<'chat' | 'knowledge' | 'settings' | 'customers'>('chat');

  // AI Knowledge state
  const [knowledgeList, setKnowledgeList] = useState<ChatAiKnowledge[]>([]);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<ChatAiKnowledge> | null>(null);
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  // AI Settings state
  const [aiSettings, setAiSettings] = useState<ChatAiSettings>({
    is_enabled: true,
    provider: 'auto',
    model_name: 'gemini-2.5-flash',
    welcome_message: 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ',
    fallback_message: 'ขอโทษนะครับพี่ ตอนนี้ระบบผู้ช่วยอัตโนมัติมีปัญหานิดหน่อยครับ พี่สามารถส่งข้อความไว้ได้เลยครับ เดี๋ยวแอดมินเข้ามาช่วยดูให้ครับ',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Customer search & initiate chat modal
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/chat/conversations');
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/messages?conversationId=${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
      // Refresh conversation unread state
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_admin_count: 0 } : c))
      );
    } catch {}
  };

  // Fetch AI Knowledge
  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/api/admin/chat/knowledge');
      if (!res.ok) return;
      const data = await res.json();
      setKnowledgeList(data.items || []);
    } catch {}
  };

  // Fetch AI Settings
  const fetchAiSettings = async () => {
    try {
      const res = await fetch('/api/admin/chat/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) setAiSettings(data.settings);
    } catch {}
  };

  // Initial load & Polling fallback
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeView === 'knowledge') fetchKnowledge();
    if (activeView === 'settings') fetchAiSettings();
  }, [activeView]);

  // Real-time Supabase Subscription for Admin
  useEffect(() => {
    const channel = supabase
      .channel('admin_chat_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (selectedConv && newMsg.conversation_id === selectedConv.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv]);

  // When selected conversation changes
  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search Customers
  const handleSearchCustomers = async (q: string) => {
    setCustomerSearchQuery(q);
    setSearchingCustomers(true);
    try {
      const res = await fetch(`/api/admin/chat/customers?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerResults(data.customers || []);
      }
    } catch {} finally {
      setSearchingCustomers(false);
    }
  };

  // Start chat with customer
  const handleStartChatWithCustomer = async (userId: string) => {
    setStartingChat(true);
    try {
      const res = await fetch('/api/admin/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to open conversation');
      const data = await res.json();
      if (data.conversation) {
        setSelectedConv(data.conversation);
        setActiveView('chat');
        await fetchConversations();
        toast.success('เปิดการสนทนากับลูกค้าเรียบร้อยแล้ว');
      }
    } catch {
      toast.error('ไม่สามารถเริ่มการสนทนาได้');
    } finally {
      setStartingChat(false);
    }
  };

  // Send Admin message
  const handleSendMessage = async (imageUrl?: string) => {
    if (!selectedConv || (!inputText.trim() && !imageUrl) || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          message: inputText.trim() || null,
          image_url: imageUrl || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
        fetchConversations();
      }
    } catch {
      toast.error('ส่งข้อความไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัปโหลดรูปภาพเท่านั้น');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดภาพต้องไม่เกิน 5MB');
      return;
    }

    setUploading(true);
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
        await handleSendMessage(data.url);
      }
    } catch {
      toast.error('อัปโหลดภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Knowledge item
  const handleSaveKnowledge = async () => {
    if (!editingKnowledge?.keywords || !editingKnowledge?.title || !editingKnowledge?.answer) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน (คีย์เวิร์ด, หัวข้อ, คำตอบ)');
      return;
    }

    setSavingKnowledge(true);
    try {
      const isNew = !editingKnowledge.id;
      const res = await fetch('/api/admin/chat/knowledge', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKnowledge),
      });

      if (!res.ok) throw new Error('Save failed');
      toast.success(isNew ? 'เพิ่มคลังคำตอบสำเร็จ' : 'แก้ไขข้อมูลสำเร็จ');
      setEditingKnowledge(null);
      fetchKnowledge();
    } catch {
      toast.error('บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSavingKnowledge(false);
    }
  };

  // Delete Knowledge item
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('ยืนยันการลบคำตอบนี้?')) return;
    try {
      const res = await fetch(`/api/admin/chat/knowledge?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('ลบข้อมูลเรียบร้อย');
      fetchKnowledge();
    } catch {
      toast.error('ลบข้อมูลไม่สำเร็จ');
    }
  };

  // Save AI Settings
  const handleSaveAiSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });

      if (!res.ok) throw new Error('Save failed');
      toast.success('บันทึกการตั้งค่า AI เรียบร้อยแล้ว');
      fetchAiSettings();
    } catch {
      toast.error('บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = c.user?.full_name?.toLowerCase() || '';
    const email = c.user?.email?.toLowerCase() || '';
    const lastMsg = c.last_message_text?.toLowerCase() || '';
    const id = c.user_id?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || lastMsg.includes(q) || id.includes(q);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 max-w-7xl mx-auto gap-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">ระบบแชทลูกค้า & ผู้ช่วย AI</h1>
            <p className="text-xs text-gray-500">สนทนากับลูกค้าแบบ Real-time และจัดการคำตอบอัจฉริยะ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition flex items-center gap-1.5 ${
              activeView === 'chat'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            ห้องแชทสด
          </button>
          <button
            onClick={() => {
              setActiveView('customers');
              handleSearchCustomers('');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition flex items-center gap-1.5 ${
              activeView === 'customers'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            ค้นหาลูกค้าเพื่อทัก
          </button>
          <button
            onClick={() => setActiveView('knowledge')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition flex items-center gap-1.5 ${
              activeView === 'knowledge'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            คลังคำตอบร้าน ({knowledgeList.length})
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl transition flex items-center gap-1.5 ${
              activeView === 'settings'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            ตั้งค่า AI
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeView === 'chat' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
          {/* Conversation List (Left) */}
          <div className="md:col-span-4 border-r border-sky-100 flex flex-col h-full bg-slate-50/40">
            {/* Search Box */}
            <div className="p-3 border-b border-sky-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาลูกค้า หรือข้อความ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-sky-50/60 border border-sky-100 rounded-2xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-sky-400 transition"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-sky-50">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-500 mb-2" />
                  กำลังโหลดบทสนทนา...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  ไม่พบบทสนทนา หรือยังไม่มีลูกค้าทักเข้ามา
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedConv?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConv(c)}
                      className={`w-full text-left p-3.5 transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-sky-100/60 border-l-4 border-sky-500'
                          : 'hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-sky-200 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {c.user?.full_name?.charAt(0) || c.user?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-semibold text-xs text-gray-800 truncate">
                            {c.user?.full_name || 'ลูกค้า'}
                          </h4>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(c.last_message_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mb-1">
                          {c.last_message_text || 'ยังไม่มีข้อความ'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 truncate">
                            {c.user?.email || c.user_id.slice(0, 8)}
                          </span>
                          {c.unread_admin_count > 0 && (
                            <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                              {c.unread_admin_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Conversation (Right) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-sky-100 flex items-center justify-between bg-sky-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {selectedConv.user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-gray-800">
                        {selectedConv.user?.full_name || 'ลูกค้า'}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        {selectedConv.user?.email} • ID: {selectedConv.user_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchMessages(selectedConv.id)}
                    className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 transition"
                    title="รีเฟรชข้อความ"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-sky-50/20 via-white to-sky-50/10">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender_role === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                            {msg.sender_role === 'ai' ? 'AI' : 'ลูกค้า'}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none'
                              : msg.sender_role === 'ai'
                              ? 'bg-indigo-50 border border-indigo-100 text-gray-800 rounded-bl-none'
                              : 'bg-white border border-sky-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                          {msg.image_url && (
                            <a
                              href={msg.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-1.5 rounded-lg overflow-hidden border border-black/10 hover:opacity-90"
                            >
                              <img
                                src={msg.image_url}
                                alt="ภาพแนบ"
                                className="max-h-56 w-auto rounded object-cover"
                              />
                            </a>
                          )}
                          <div
                            className={`text-[9px] mt-1 text-right ${
                              isAdmin ? 'text-sky-200' : 'text-gray-400'
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
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 border-t border-sky-100 bg-white flex items-center gap-2"
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
                    disabled={uploading || sending}
                    className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-2xl border border-sky-200 transition"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="พิมพ์ข้อความตอบกลับลูกค้า..."
                    className="flex-1 bg-sky-50/50 border border-sky-200 focus:border-sky-400 focus:bg-white rounded-2xl px-3.5 py-2 text-xs outline-none transition"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:shadow-md disabled:opacity-40 transition"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    ส่ง
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 text-xs">
                <MessageSquare className="w-12 h-12 text-sky-300 mb-3 opacity-60" />
                <h4 className="font-bold text-gray-700 text-sm mb-1">เลือกลูกค้าเพื่อเริ่มสนทนา</h4>
                <p className="max-w-xs text-gray-500">
                  คลิกที่รายชื่อลูกค้าด้านซ้าย หรือกดปุ่ม "ค้นหาลูกค้าเพื่อทัก" ด้านบนเพื่อเริ่มคุยกับลูกค้าใหม่
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customers List View (To initiate chat) */}
      {activeView === 'customers' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-sky-100 shadow-xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
            <div>
              <h2 className="font-bold text-sm text-gray-800">ค้นหาและเริ่มแชทกับลูกค้า</h2>
              <p className="text-xs text-gray-500">พิมพ์ชื่อ อีเมล หรือ Customer ID เพื่อเปิดห้องแชทได้ทันที</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, Customer ID..."
                value={customerSearchQuery}
                onChange={(e) => handleSearchCustomers(e.target.value)}
                className="w-72 bg-sky-50 border border-sky-200 rounded-2xl px-3.5 py-2 text-xs outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-sky-50">
            {searchingCustomers ? (
              <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center">
                <Loader2 className="w-5 h-5 animate-spin text-sky-500 mb-2" />
                กำลังค้นหาข้อมูลลูกค้า...
              </div>
            ) : customerResults.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                ไม่พบข้อมูลลูกค้าตามเงื่อนไขที่ระบุ
              </div>
            ) : (
              customerResults.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3.5 flex items-center justify-between hover:bg-sky-50/50 transition rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {cust.full_name?.charAt(0) || cust.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-gray-800">
                        {cust.full_name || 'ลูกค้าไม่มีชื่อ'}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {cust.email} • ID: <span className="font-mono">{cust.id}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChatWithCustomer(cust.id)}
                    disabled={startingChat}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold rounded-2xl hover:shadow-md transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    เริ่มการสนทนา
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Knowledge Management View */}
      {activeView === 'knowledge' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-sky-100 shadow-xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
            <div>
              <h2 className="font-bold text-sm text-gray-800">คลังคำตอบของร้านสำหรับผู้ช่วย AI</h2>
              <p className="text-xs text-gray-500">
                กำหนดคีย์เวิร์ดและคำตอบเฉพาะของร้าน AI จะดึงข้อมูลส่วนนี้ไปตอบลูกค้าก่อนเสมอ
              </p>
            </div>
            <button
              onClick={() =>
                setEditingKnowledge({
                  keywords: '',
                  title: '',
                  answer: '',
                  priority: 10,
                  is_active: true,
                })
              }
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold rounded-2xl hover:shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              เพิ่มคำตอบใหม่
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {knowledgeList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-sky-100 bg-sky-50/30 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-800">{item.title}</span>
                    <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded-full font-medium">
                      Priority: {item.priority}
                    </span>
                    {!item.is_active && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        ปิดใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                  <p className="text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-500">Keywords:</span> {item.keywords}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingKnowledge(item)}
                    className="p-2 text-sky-600 hover:bg-sky-100 rounded-xl transition"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKnowledge(item.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Settings View */}
      {activeView === 'settings' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-sky-100 shadow-xs flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
            <div>
              <h2 className="font-bold text-sm text-gray-800">ตั้งค่าระบบผู้ช่วย AI</h2>
              <p className="text-xs text-gray-500">จัดการผู้ให้บริการภายนอก โมเดล และข้อความพื้นฐานของระบบ</p>
            </div>
            <button
              onClick={handleSaveAiSettings}
              disabled={savingSettings}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold rounded-2xl hover:shadow-md transition flex items-center gap-2"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              บันทึกการตั้งค่า
            </button>
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
              <div>
                <h4 className="font-semibold text-xs text-gray-800">เปิดใช้งานผู้ช่วย AI อัตโนมัติ</h4>
                <p className="text-[11px] text-gray-500">อนุญาตให้ผู้ช่วย AI ตอบคำถามลูกค้าในแท็บแชท AI</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.is_enabled}
                onChange={(e) => setAiSettings({ ...aiSettings, is_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-600 rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                External AI Provider
              </label>
              <select
                value={aiSettings.provider}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, provider: e.target.value as any })
                }
                className="w-full bg-sky-50/60 border border-sky-200 rounded-2xl px-3.5 py-2 text-xs outline-none focus:border-sky-400"
              >
                <option value="auto">Auto (Google Gemini + OpenAI Fallback)</option>
                <option value="gemini">Google Gemini Only</option>
                <option value="openai">OpenAI Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                โมเดลหลัก (Model Name)
              </label>
              <input
                type="text"
                value={aiSettings.model_name}
                onChange={(e) => setAiSettings({ ...aiSettings, model_name: e.target.value })}
                placeholder="gemini-2.5-flash หรือ gpt-4o-mini"
                className="w-full bg-sky-50/60 border border-sky-200 rounded-2xl px-3.5 py-2 text-xs outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ข้อความต้อนรับ (Welcome Message)
              </label>
              <textarea
                value={aiSettings.welcome_message}
                onChange={(e) => setAiSettings({ ...aiSettings, welcome_message: e.target.value })}
                rows={2}
                className="w-full bg-sky-50/60 border border-sky-200 rounded-2xl p-3 text-xs outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ข้อความ Fallback (เมื่อ AI หรือระบบภายนอกขัดข้อง)
              </label>
              <textarea
                value={aiSettings.fallback_message}
                onChange={(e) => setAiSettings({ ...aiSettings, fallback_message: e.target.value })}
                rows={2}
                className="w-full bg-sky-50/60 border border-sky-200 rounded-2xl p-3 text-xs outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Knowledge */}
      {editingKnowledge && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="font-bold text-sm text-gray-800">
                {editingKnowledge.id ? 'แก้ไขคลังคำตอบ' : 'เพิ่มคำตอบใหม่'}
              </h3>
              <button
                onClick={() => setEditingKnowledge(null)}
                className="p-1 rounded-xl hover:bg-sky-50 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">หัวข้อ</label>
                <input
                  type="text"
                  value={editingKnowledge.title || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, title: e.target.value })
                  }
                  placeholder="เช่น วิธีการเติมเงิน"
                  className="w-full bg-sky-50 border border-sky-200 rounded-2xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  คีย์เวิร์ด (คั่นด้วยจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={editingKnowledge.keywords || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, keywords: e.target.value })
                  }
                  placeholder="เติมเงิน, วิธีเติม, ซื้อยังไง"
                  className="w-full bg-sky-50 border border-sky-200 rounded-2xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  คำตอบที่ต้องการให้ AI ตอบ
                </label>
                <textarea
                  value={editingKnowledge.answer || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, answer: e.target.value })
                  }
                  rows={4}
                  placeholder="รายละเอียดคำตอบที่ถูกต้อง..."
                  className="w-full bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority (ลำดับความสำคัญ)
                  </label>
                  <input
                    type="number"
                    value={editingKnowledge.priority ?? 10}
                    onChange={(e) =>
                      setEditingKnowledge({
                        ...editingKnowledge,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-sky-50 border border-sky-200 rounded-2xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={editingKnowledge.is_active ?? true}
                    onChange={(e) =>
                      setEditingKnowledge({
                        ...editingKnowledge,
                        is_active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-sky-600 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700">เปิดใช้งาน</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setEditingKnowledge(null)}
                className="px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-2xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveKnowledge}
                disabled={savingKnowledge}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold rounded-2xl hover:shadow-md transition flex items-center gap-1.5"
              >
                {savingKnowledge && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
