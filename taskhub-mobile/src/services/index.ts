import api from './api';
import { AuthResponse, LoginDto, RegisterDto, User, Task, Category, Conversation, Message, NotificationItem } from '../types';
import { STORAGE_KEYS } from '../constants';
import { safeStorage } from '../utils/storage';

/**
 * Helper to unwrap paginated responses.
 * After the API interceptor strips `{ success, data }`, paginated endpoints
 * return `{ data: T[], meta: {...} }`. This extracts the array.
 */
function unwrapList<T>(response: { data: T[]; meta?: any } | T[]): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  return Array.isArray(response.data) ? response.data : [];
}

// ---- Auth API ----
export const authApi = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: LoginDto) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then(r => r.data),

  logout: () =>
    api.post('/auth/logout'),
};

// ---- Tasks API ----
export const tasksApi = {
  getAll: (params?: any) =>
    api.get<Task[]>('/tasks', { params }).then(unwrapList),

  getById: (id: string) =>
    api.get<Task>(`/tasks/${id}`).then(r => r.data),

  create: (data: any) =>
    api.post<Task>('/tasks', data).then(r => r.data),

  update: (id: string, data: any) =>
    api.patch<Task>(`/tasks/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then(r => r.data),

  apply: (taskId: string, message?: string) =>
    api.post<any>(`/tasks/${taskId}/apply`, { message }).then(r => r.data),

  getMyTasks: () =>
    api.get<Task[]>('/tasks/my/owned').then(r => r.data),

  getMyApplications: () =>
    api.get<any[]>('/applications/my').then(r => r.data),

  uploadTaskPhoto: (formData: FormData) =>
    api.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};

// ---- Users API ----
export const usersApi = {
  getProfile: () =>
    api.get<User>('/users/me').then(r => r.data),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/users/me', data).then(r => r.data),

  uploadAvatar: (file: FormData) =>
    api.post<User>('/users/me/avatar', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  getFinancialSummary: () =>
    api.get<any>('/users/me/financial-summary').then(r => r.data),
};

// ---- Categories API ----
export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/categories').then(r => r.data),
};

// ---- Reviews API ----
export const reviewsApi = {
  create: (taskId: string, rating: number, comment?: string) =>
    api.post<any>(`/tasks/${taskId}/reviews`, { rating, comment }).then(r => r.data),

  getByUser: (userId: string) =>
    api.get<any[]>(`/users/${userId}/reviews`).then(r => r.data),
};

// ---- Support API ----
export const supportApi = {
  createDonation: (amount: number, paymentMethod: string, message?: string) =>
    api.post('/support/donations', { amount, paymentMethod, message }).then(r => r.data),

  getDonations: () =>
    api.get('/support/donations').then(r => r.data),
};

// ---- Verifications API ----
export const verificationsApi = {
  submit: (documentUrl: string) =>
    api.post('/verifications', { documentUrl }).then(r => r.data),

  getMyStatus: () =>
    api.get('/verifications/my').then(r => r.data),
};

// ---- Chats API ----
export const chatsApi = {
  getConversations: () =>
    api.get<Conversation[]>('/chats/conversations').then(r => r.data),

  getMessages: (conversationId: string) =>
    api.get<Message[]>(`/chats/conversations/${conversationId}/messages`).then(r => r.data),

  createConversation: (taskId: string, userIds: string[]) =>
    api.post('/chats/conversations', { taskId, userIds }).then(r => r.data),

  sendMessage: (conversationId: string, content: string) =>
    api.post(`/chats/conversations/${conversationId}/messages`, { content }).then(r => r.data),

  markAsRead: (conversationId: string) =>
    api.post(`/chats/conversations/${conversationId}/read`).then(r => r.data),

  uploadTaskPhoto: (file: FormData) =>
    api.post<any>('/upload/image', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};

// ---- Notifications API ----
export const notificationsApi = {
  getAll: () =>
    api.get<NotificationItem[]>('/notifications').then(r => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then(r => r.data),
};

// ---- Storage helpers ----
export const storage = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    await safeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await safeStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearTokens: async () => {
    await safeStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await safeStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};