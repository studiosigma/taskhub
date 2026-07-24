import api from './api';
import { AuthResponse, LoginDto, RegisterDto, User, Task, Category, Conversation, Message } from '../types';
import { STORAGE_KEYS } from '../constants';
import { safeStorage } from '../utils/storage';

/**
 * Helper to unwrap paginated responses.
 * After the API interceptor strips `{ success, data }`, paginated endpoints
 * return `{ data: T[], meta: {...} }`. This extracts the array.
 */
function unwrapList<T>(response: any): T[] {
  const data = response.data ?? response;
  return Array.isArray(data) ? data : data?.data ?? [];
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
    api.get<{ data: Task[]; meta: any }>('/tasks', { params }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<{ data: Task }>(`/tasks/${id}`).then(r => r.data.data),

  create: (data: any) =>
    api.post<{ data: Task }>('/tasks', data).then(r => r.data.data),

  update: (id: string, data: any) =>
    api.patch<{ data: Task }>(`/tasks/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then(r => r.data),

  apply: (taskId: string, message?: string) =>
    api.post<{ data: any }>(`/tasks/${taskId}/apply`, { message }).then(r => r.data.data),

  getMyTasks: () =>
    api.get<{ data: Task[] }>('/tasks/my/owned').then(r => r.data.data),

  getMyApplications: () =>
    api.get<{ data: Task[] }>('/applications/my').then(r => r.data.data),
};

// ---- Users API ----
export const usersApi = {
  getProfile: () =>
    api.get<{ data: User }>('/users/me').then(r => r.data.data),

  updateProfile: (data: Partial<User>) =>
    api.patch<{ data: User }>('/users/me', data).then(r => r.data.data),
};

// ---- Categories API ----
export const categoriesApi = {
  getAll: () =>
    api.get<{ data: Category[] }>('/categories').then(r => r.data.data),
};

// ---- Reviews API ----
export const reviewsApi = {
  create: (taskId: string, rating: number, comment?: string) =>
    api.post<{ data: any }>(`/tasks/${taskId}/reviews`, { rating, comment }).then(r => r.data.data),

  getByUser: (userId: string) =>
    api.get<{ data: any[] }>(`/users/${userId}/reviews`).then(r => r.data.data),
};

// ---- Support API ----
export const supportApi = {
  createDonation: (amount: number, paymentMethod: string, message?: string) =>
    api.post('/support/donations', { amount, paymentMethod, message }).then(r => r.data),
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
    api.get<{ data: Conversation[] }>('/chats/conversations').then(r => r.data.data),

  getMessages: (conversationId: string) =>
    api.get<{ data: Message[] }>(`/chats/conversations/${conversationId}/messages`).then(r => r.data.data),

  createConversation: (taskId: string, userIds: string[]) =>
    api.post('/chats/conversations', { taskId, userIds }).then(r => r.data),

  sendMessage: (conversationId: string, content: string) =>
    api.post(`/chats/conversations/${conversationId}/messages`, { content }).then(r => r.data),
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
