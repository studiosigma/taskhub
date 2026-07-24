// Navigation Types

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
  MainTabs: undefined;
  Home: undefined;
  Explore: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: string };
  ChatDetail: {
    conversationId: string;
    otherUser?: {
      id?: string;
      fullName?: string;
      avatar?: string;
    };
  };
  MyTasks: undefined;
  Profile: undefined;
  IdentityVerification: undefined;
  Support: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  CreateTask: undefined;
  Inbox: undefined;
  Profile: undefined;
};

// API Response Types

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  rating: number;
  completedTask: number;
  isVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

export type TaskStatus = 'DRAFT' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  ownerId: string;
  categoryId: string;
  title: string;
  description: string;
  budget: number;
  duration: string;
  helperNeeded: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  category?: Category;
  photos?: TaskPhoto[];
  _count?: { applications: number };
}

export interface TaskPhoto {
  id: string;
  taskId: string;
  imageUrl: string;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  taskId: string;
  userId: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
  user?: User;
  task?: Task;
}

export interface Assignment {
  id: string;
  taskId: string;
  userId: string;
  assignedAt: string;
  user?: User;
  task?: Task;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
  task?: Task;
  participants: ConversationParticipant[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

export interface SupportDonation {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  message?: string;
  createdAt: string;
  user?: User;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  budget: number;
  duration: string;
  categoryId: string;
  helperNeeded?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
