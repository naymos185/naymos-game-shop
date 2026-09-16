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
} from 'lucide-react';
import type { ChatConversation, ChatMessage, ChatAiKnowledge } from '@/lib/chat/types';
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

  // AI Knowledge modal/tab
  const [activeView, setActiveView] = useState<'chat' | 'knowledge'>('chat');
  const [knowledgeList, setKnowledgeList] = useState<ChatAiKnowledge[]>([]);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<ChatAiKnowledge> | null>(null);
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  // New Chat to customer modal
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      const interval = setInterval(() => fetchMessages(selectedConv.id), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  useEffect(() => {
    if (activeView === 'knowledge') {
      fetchKnowledge();
    }
  }, [activeView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message from Admin
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
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
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
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        await handleSendMessage(data.url);
      }
    } catch {
      toast.error('อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start new chat with user
  const handleStartChatWithUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatUserId.trim()) return;

    try {
      const res = await fetch('/api/admin/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newChatUserId.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        toast.success('เปิดห้องแชทสำเร็จ');
        setIsNewChatOpen(false);
        setNewChatUserId('');
        await fetchConversations();
        setSelectedConv(data.conversation);
      } else {
        toast.error(data.error || 'ไม่พบผู้ใช้หรือเกิดข้อผิดพลาด');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  // Save AI knowledge
  const handleSaveKnowledge = async () => {
    if (!editingKnowledge?.keywords || !editingKnowledge?.title || !editingKnowledge?.answer) {
      toast.error('กรุณากรอกคีย์เวิร์ด ชื่อหัวข้อ และคำตอบให้ครบถ้วน');
      return;
    }

    setSavingKnowledge(true);
    try {
      const isEdit = Boolean(editingKnowledge.id);
      const res = await fetch('/api/admin/chat/knowledge', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKnowledge),
      });
      if (res.ok) {
        toast.success(isEdit ? 'อัปเดตคำตอบ AI เรียบร้อย' : 'เพิ่มคำตอบ AI เรียบร้อย');
        setEditingKnowledge(null);
        fetchKnowledge();
      } else {
        const data = await res.json();
        toast.error(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSavingKnowledge(false);
    }
  };

  // Delete AI knowledge
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('ยืนยันลบคีย์เวิร์ดนี้?')) return;

    try {
      const res = await fetch(`/api/admin/chat/knowledge?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('ลบเรียบร้อย');
        fetchKnowledge();
      }
    } catch {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const email = c.user?.email?.toLowerCase() || '';
    const name = c.user?.full_name?.toLowerCase() || '';
    const lastMsg = c.last_message_text?.toLowerCase() || '';
    return email.includes(q) || name.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <span>ระบบ Live Chat ลูกค้า & น้องหลาม AI</span>
          </h1>
          <p className="text-xs text-slate-500">
            พูดคุยกับลูกค้าแบบเรียลไทม์ และตั้งค่าคีย์เวิร์ดคำตอบของน้องหลาม AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'chat'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            แชทลูกค้า
          </button>
          <button
            type="button"
            onClick={() => setActiveView('knowledge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'knowledge'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ตั้งค่า AI น้องหลาม
          </button>
          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition border border-blue-200"
          >
            <Plus className="w-3.5 h-3.5" />
            ทักหาลูกค้า
          </button>
        </div>
      </div>

      {activeView === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px] bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
          {/* Left: Conversation List */}
          <div className="lg:col-span-4 border-r border-sky-100 flex flex-col h-full bg-[#fbfdff]">
            <div className="p-3 border-b border-sky-100 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาลูกค้า, อีเมล, ข้อความ..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-sky-50">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                  กำลังโหลดรายการแชท...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  ยังไม่มีประวัติการแชท
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedConv?.id === c.id;
                  const name = c.user?.full_name || c.user?.email || 'ลูกค้า';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedConv(c)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-sky-50/80 border-l-4 border-sky-500'
                          : 'hover:bg-sky-50/40'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-300 to-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs text-slate-800 truncate">
                            {name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(c.last_message_at).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {c.last_message_text || 'เริ่มการสนทนา'}
                        </p>
                      </div>
                      {c.unread_admin_count > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {c.unread_admin_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Messages Container */}
          <div className="lg:col-span-8 flex flex-col h-full bg-[#f8fbfe]">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 bg-white border-b border-sky-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {(selectedConv.user?.full_name || selectedConv.user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-800 leading-tight">
                        {selectedConv.user?.full_name || 'ลูกค้า'}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {selectedConv.user?.email} • ID: {selectedConv.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchMessages(selectedConv.id)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition"
                    title="รีเฟรชข้อความ"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isAdmin = m.sender_role === 'admin';
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            U
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                            isAdmin
                              ? 'bg-sky-500 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-sky-100 rounded-tl-xs'
                          }`}
                        >
                          {m.message && <p className="whitespace-pre-line">{m.message}</p>}
                          {m.image_url && (
                            <a
                              href={m.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-1.5 rounded-lg overflow-hidden border border-sky-200/60 max-w-[240px]"
                            >
                              <img
                                src={m.image_url}
                                alt="รูปภาพ"
                                className="w-full h-auto object-cover max-h-56"
                              />
                            </a>
                          )}
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isAdmin ? 'text-sky-100' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-3 bg-white border-t border-sky-100">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || sending}
                      className="w-10 h-10 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center transition shrink-0"
                      title="ส่งรูปภาพ"
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
                      className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white flex items-center justify-center transition shadow-xs shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-sky-200 mb-2" />
                <p className="text-sm font-semibold text-slate-600">เลือกห้องแชทเพื่อเริ่มสนทนา</p>
                <p className="text-xs text-slate-400">คลิกที่รายชื่อลูกค้าทางซ้ายมือ</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Knowledge Base View */
        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>คลังความรู้ & คีย์เวิร์ดของน้องหลาม AI</span>
              </h2>
              <p className="text-xs text-slate-500">
                เพิ่มหรือแก้ไขคีย์เวิร์ดเพื่อให้ AI ตอบคำถามลูกค้าได้แม่นยำ (คำถามนอกเหนือจากนี้ AI จะตอบ: &quot;หลามก็ไม่ทราบเหมือนกันค้าบ🥹 แต่สามารถติดต่อ admin ได้เลยนะค้าบบบบ&quot;)
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingKnowledge({
                  keywords: '',
                  title: '',
                  answer: '',
                  priority: 0,
                  is_active: true,
                })
              }
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มคำถาม/คีย์เวิร์ดใหม่
            </button>
          </div>

          {/* List Knowledge Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {knowledgeList.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800">{k.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        k.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {k.is_active ? 'เปิดใช้งาน' : 'ปิด'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {k.keywords.split(',').map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-line bg-white p-2.5 rounded-xl border border-sky-100">
                    {k.answer}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-sky-100 text-xs">
                  <span className="text-[11px] text-slate-400">Priority: {k.priority}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingKnowledge(k)}
                      className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKnowledge(k.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit / Add AI Knowledge */}
      {editingKnowledge && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">
                {editingKnowledge.id ? 'แก้ไขคีย์เวิร์ด AI' : 'เพิ่มคีย์เวิร์ด AI ใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingKnowledge(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อหัวข้อ</label>
                <input
                  type="text"
                  value={editingKnowledge.title || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, title: e.target.value })
                  }
                  placeholder="เช่น วิธีการเติมเกม"
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-400"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คีย์เวิร์ด (คั่นด้วยจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={editingKnowledge.keywords || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, keywords: e.target.value })
                  }
                  placeholder="เช่น เติมเงิน,วิธีเติม,สั่งยังไง"
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-400"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำตอบของน้องหลาม</label>
                <textarea
                  rows={4}
                  value={editingKnowledge.answer || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, answer: e.target.value })
                  }
                  placeholder="ข้อความที่ต้องการให้น้องหลามตอบ..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-400 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ความสำคัญ (Priority)</label>
                  <input
                    type="number"
                    value={editingKnowledge.priority ?? 0}
                    onChange={(e) =>
                      setEditingKnowledge({
                        ...editingKnowledge,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-24 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-sky-400"
                  />
                </div>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={editingKnowledge.is_active ?? true}
                    onChange={(e) =>
                      setEditingKnowledge({ ...editingKnowledge, is_active: e.target.checked })
                    }
                    className="rounded text-sky-500 focus:ring-sky-400"
                  />
                  <span>เปิดใช้งาน</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setEditingKnowledge(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveKnowledge}
                disabled={savingKnowledge}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-xs transition"
              >
                {savingKnowledge ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Start Chat with User */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleStartChatWithUser}
            className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-sky-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800">ทักหาลูกค้าโดยตรง</h3>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                กรอก User ID ของลูกค้า (จากหน้ารายชื่อลูกค้า/Orders)
              </label>
              <input
                type="text"
                required
                value={newChatUserId}
                onChange={(e) => setNewChatUserId(e.target.value)}
                placeholder="เช่น 12345678-abcd-..."
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-xs transition"
              >
                เปิดห้องแชท
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
