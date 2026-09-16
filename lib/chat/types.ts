export type ChatSenderRole = 'user' | 'admin' | 'ai';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: ChatSenderRole;
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

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
  };
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
