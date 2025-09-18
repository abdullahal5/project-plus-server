import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(userId);
    console.log(`User ${userId} joined notifications room`);
  }

  sendNotification(userId: string, message: string) {
    this.server.to(userId).emit('notification', message);
  }
}
