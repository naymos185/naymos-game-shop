export interface ChatConversation {
  id: string;
  user_id: string;
  status: 'open' | 'closed' | 'pending';
  unread_user_count: number;
  unread_admin_count: number;
  last_message_text: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
    avatar_url: string | null;
    phone?: string | null;
  } | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: 'user' | 'admin' | 'ai';
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ChatAiKnowledge {
  id: string;
  keywords: string;
  title: string;
  answer: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ChatAiSettings {
  id?: string;
  is_enabled: boolean;
  provider: 'gemini' | 'openai' | 'auto';
  model_name: string;
  system_prompt?: string;
  welcome_message: string;
  fallback_message: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatHistoryItem {
  sender: 'user' | 'ai';
  text: string;
}
