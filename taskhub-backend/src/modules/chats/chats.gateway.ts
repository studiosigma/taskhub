import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service.js';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(private chatsService: ChatsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.onlineUsers.entries()].find(([, s]) => s === client.id)?.[0];
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    this.onlineUsers.set(userId, client.id);
    client.join(`user:${userId}`);
    this.server.emit('userOnline', { userId });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { conversationId: string; content: string; senderId: string }) {
    const message = await this.chatsService.saveMessage(payload.conversationId, payload.senderId, payload.content);
    this.server.to(`conversation:${payload.conversationId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { conversationId: string; userId: string }) {
    client.to(`conversation:${payload.conversationId}`).emit('typing', { userId: payload.userId });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(client: Socket, payload: { conversationId: string; userId: string }) {
    client.to(`conversation:${payload.conversationId}`).emit('stopTyping', { userId: payload.userId });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { conversationId: string; userId: string }) {
    // Mark messages as read - calling service directly
    client.to(`conversation:${payload.conversationId}`).emit('messagesRead', { userId: payload.userId });
  }
}
