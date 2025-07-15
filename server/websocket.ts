import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { insertChatMessageSchema, type ChatMessage, type User } from '@shared/schema';
import { z } from 'zod';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  user?: User;
  roomId?: string;
}

interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'send_message' | 'typing' | 'stop_typing';
  data: any;
}

const rooms = new Map<string, Set<AuthenticatedWebSocket>>();
const userSockets = new Map<string, AuthenticatedWebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/chat'
  });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection');

    // Extract user info from session (you might need to parse cookies/session)
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const roomId = url.searchParams.get('roomId') || 'general';

    if (userId) {
      ws.userId = userId;
      ws.roomId = roomId;
      userSockets.set(userId, ws);
      
      // Join room
      joinRoom(ws, roomId);
      
      // Load recent messages for the room
      loadRecentMessages(ws, roomId);
    }

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        userSockets.delete(ws.userId);
        leaveRoom(ws, ws.roomId || 'general');
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

function joinRoom(ws: AuthenticatedWebSocket, roomId: string) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  rooms.get(roomId)!.add(ws);
  ws.roomId = roomId;
  
  // Notify room members
  broadcastToRoom(roomId, {
    type: 'user_joined',
    data: {
      userId: ws.userId,
      message: 'Un utente si è unito alla chat'
    }
  }, ws);
}

function leaveRoom(ws: AuthenticatedWebSocket, roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(roomId);
    } else {
      // Notify remaining room members
      broadcastToRoom(roomId, {
        type: 'user_left',
        data: {
          userId: ws.userId,
          message: 'Un utente ha lasciato la chat'
        }
      });
    }
  }
}

function broadcastToRoom(roomId: string, message: any, excludeWs?: AuthenticatedWebSocket) {
  const room = rooms.get(roomId);
  if (room) {
    room.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

async function handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
  if (!ws.userId || !ws.roomId) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
    return;
  }

  switch (message.type) {
    case 'join_room':
      leaveRoom(ws, ws.roomId);
      joinRoom(ws, message.data.roomId);
      break;

    case 'send_message':
      await handleSendMessage(ws, message.data);
      break;

    case 'typing':
      broadcastToRoom(ws.roomId, {
        type: 'user_typing',
        data: {
          userId: ws.userId,
          isTyping: true
        }
      }, ws);
      break;

    case 'stop_typing':
      broadcastToRoom(ws.roomId, {
        type: 'user_typing',
        data: {
          userId: ws.userId,
          isTyping: false
        }
      }, ws);
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

async function handleSendMessage(ws: AuthenticatedWebSocket, data: any) {
  try {
    // Get user info
    const user = await storage.getUserById(ws.userId!);
    if (!user) {
      ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
      return;
    }

    // Validate and create message
    const messageData = {
      userId: ws.userId!,
      senderType: 'user' as const,
      senderName: `${user.firstName} ${user.lastName}`,
      message: data.message,
      roomId: ws.roomId!,
      isRead: false
    };

    const validatedMessage = insertChatMessageSchema.parse(messageData);
    
    // Save to database
    const savedMessage = await storage.createChatMessage(validatedMessage);
    
    // Broadcast to room
    const chatMessage = {
      type: 'new_message',
      data: {
        id: savedMessage.id,
        userId: savedMessage.userId,
        senderType: savedMessage.senderType,
        senderName: savedMessage.senderName,
        message: savedMessage.message,
        roomId: savedMessage.roomId,
        createdAt: savedMessage.createdAt
      }
    };

    broadcastToRoom(ws.roomId!, chatMessage);
    
    // Send admin response for demo (you can remove this or make it smarter)
    if (ws.roomId === 'support') {
      setTimeout(async () => {
        const adminMessage = {
          userId: null,
          senderType: 'admin' as const,
          senderName: 'Assistenza GameAll',
          message: getRandomAdminResponse(),
          roomId: ws.roomId!,
          isRead: false
        };

        const savedAdminMessage = await storage.createChatMessage(adminMessage);
        
        broadcastToRoom(ws.roomId!, {
          type: 'new_message',
          data: {
            id: savedAdminMessage.id,
            userId: savedAdminMessage.userId,
            senderType: savedAdminMessage.senderType,
            senderName: savedAdminMessage.senderName,
            message: savedAdminMessage.message,
            roomId: savedAdminMessage.roomId,
            createdAt: savedAdminMessage.createdAt
          }
        });
      }, 1000 + Math.random() * 3000); // Random delay 1-4 seconds
    }

  } catch (error) {
    console.error('Error handling send message:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
  }
}

async function loadRecentMessages(ws: AuthenticatedWebSocket, roomId: string) {
  try {
    const messages = await storage.getChatMessages(roomId, 50); // Last 50 messages
    
    ws.send(JSON.stringify({
      type: 'message_history',
      data: messages
    }));
  } catch (error) {
    console.error('Error loading recent messages:', error);
  }
}

function getRandomAdminResponse(): string {
  const responses = [
    'Grazie per il tuo messaggio! Ti stiamo aiutando.',
    'Il nostro team sta esaminando la tua richiesta.',
    'Posso aiutarti con informazioni sui nostri prodotti gaming.',
    'Per assistenza urgente, puoi chiamare il numero verde.',
    'Ti risponderà un operatore specializzato a breve.',
    'Hai domande sui tuoi ordini? Sono qui per aiutarti!',
    'Grazie per aver scelto GameAll! Come posso assisterti?'
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}