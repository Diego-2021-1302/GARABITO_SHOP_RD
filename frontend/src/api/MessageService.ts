import api from './axios';

export interface Message {
    id: number;
    user_id: number;
    admin_id: number | null;
    content: string;
    sender_type: 'user' | 'admin';
    is_read: boolean;
    created_at: string;
    admin?: {
        name: string;
    };
}

export interface Conversation {
    user_id: number;
    user_name: string;
    user_email: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

const MessageService = {
    // Client methods
    getUserMessages: () => api.get<Message[]>('/messages'),
    sendMessageAsUser: (content: string) => api.post<Message>('/messages', { content }),

    // Admin methods
    getAdminConversations: () => api.get<Conversation[]>('/admin/messages/conversations'),
    getAdminMessagesWithUser: (userId: number) => api.get<Message[]>(`/admin/messages/user/${userId}`),
    sendMessageAsAdmin: (userId: number, content: string) => api.post<Message>(`/admin/messages/user/${userId}`, { content }),
};

export default MessageService;
