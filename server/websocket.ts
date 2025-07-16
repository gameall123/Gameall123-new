import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  room: string;
  timestamp: Date;
  type: 'message' | 'system' | 'typing';
}

interface WebSocketClient extends WebSocket {
  userId?: string;
  username?: string;
  room?: string;
}

interface Room {
  id: string;
  clients: Set<WebSocketClient>;
  messages: ChatMessage[];
}

export class ChatWebSocketServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    this.initializeDefaultRooms();
  }

  private initializeDefaultRooms() {
    // Crea stanze predefinite
    this.createRoom('support', 'Supporto Generale');
    this.createRoom('general', 'Chat Generale');
  }

  private createRoom(id: string, name: string): Room {
    const room: Room = {
      id,
      clients: new Set(),
      messages: []
    };
    this.rooms.set(id, room);
    return room;
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, request) => {
      console.log('🔗 Nuova connessione WebSocket');

      // Invia messaggio di benvenuto
      this.sendToClient(ws, {
        type: 'system',
        message: 'Connesso al server chat GameAll!',
        timestamp: new Date()
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Errore parsing messaggio:', error);
          this.sendError(ws, 'Formato messaggio non valido');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ Errore WebSocket:', error);
      });
    });
  }

  private handleMessage(client: WebSocketClient, data: any) {
    const { type, room: roomId, message, userId, username } = data;

    switch (type) {
      case 'join':
        this.handleJoinRoom(client, roomId, userId, username);
        break;

      case 'leave':
        this.handleLeaveRoom(client);
        break;

      case 'message':
        this.handleChatMessage(client, message);
        break;

      case 'typing':
        this.handleTyping(client, data.isTyping);
        break;

      default:
        this.sendError(client, 'Tipo di messaggio non supportato');
    }
  }

  private handleJoinRoom(client: WebSocketClient, roomId: string, userId: string, username: string) {
    // Lascia la stanza corrente se presente
    if (client.room) {
      this.handleLeaveRoom(client);
    }

    // Crea stanza se non esiste
    if (!this.rooms.has(roomId)) {
      this.createRoom(roomId, roomId);
    }

    const room = this.rooms.get(roomId)!;
    
    // Aggiungi client alla stanza
    client.room = roomId;
    client.userId = userId;
    client.username = username;
    room.clients.add(client);

    // Invia cronologia messaggi
    this.sendToClient(client, {
      type: 'history',
      messages: room.messages.slice(-50), // Ultimi 50 messaggi
      room: roomId
    });

    // Notifica altri utenti
    const joinMessage: ChatMessage = {
      id: this.generateId(),
      userId: 'system',
      username: 'Sistema',
      message: `${username} si è unito alla chat`,
      room: roomId,
      timestamp: new Date(),
      type: 'system'
    };

    this.broadcastToRoom(roomId, joinMessage, client);
    
    console.log(`👤 ${username} si è unito alla stanza ${roomId}`);
  }

  private handleLeaveRoom(client: WebSocketClient) {
    if (!client.room) return;

    const room = this.rooms.get(client.room);
    if (room) {
      room.clients.delete(client);

      // Notifica altri utenti
      const leaveMessage: ChatMessage = {
        id: this.generateId(),
        userId: 'system',
        username: 'Sistema',
        message: `${client.username} ha lasciato la chat`,
        room: client.room,
        timestamp: new Date(),
        type: 'system'
      };

      this.broadcastToRoom(client.room, leaveMessage, client);
    }

    console.log(`👋 ${client.username} ha lasciato la stanza ${client.room}`);
    client.room = undefined;
    client.userId = undefined;
    client.username = undefined;
  }

  private handleChatMessage(client: WebSocketClient, messageText: string) {
    if (!client.room || !client.userId || !client.username) {
      this.sendError(client, 'Devi unirti a una stanza prima di inviare messaggi');
      return;
    }

    const message: ChatMessage = {
      id: this.generateId(),
      userId: client.userId,
      username: client.username,
      message: messageText,
      room: client.room,
      timestamp: new Date(),
      type: 'message'
    };

    // Salva messaggio nella stanza
    const room = this.rooms.get(client.room)!;
    room.messages.push(message);

    // Mantieni solo gli ultimi 100 messaggi per room
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    // Broadcast a tutti i client della stanza
    this.broadcastToRoom(client.room, message);

    console.log(`💬 [${client.room}] ${client.username}: ${messageText}`);
  }

  private handleTyping(client: WebSocketClient, isTyping: boolean) {
    if (!client.room || !client.username) return;

    const typingMessage = {
      type: 'typing',
      userId: client.userId,
      username: client.username,
      isTyping,
      room: client.room,
      timestamp: new Date()
    };

    this.broadcastToRoom(client.room, typingMessage, client);
  }

  private handleDisconnect(client: WebSocketClient) {
    if (client.room) {
      this.handleLeaveRoom(client);
    }
    console.log('🔌 Client disconnesso');
  }

  private broadcastToRoom(roomId: string, message: any, exclude?: WebSocketClient) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.clients.forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  private sendToClient(client: WebSocketClient, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  private sendError(client: WebSocketClient, error: string) {
    this.sendToClient(client, {
      type: 'error',
      message: error,
      timestamp: new Date()
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Metodi pubblici per integrazioni esterne
  public getRoomStats() {
    const stats: any = {};
    this.rooms.forEach((room, id) => {
      stats[id] = {
        clients: room.clients.size,
        messages: room.messages.length
      };
    });
    return stats;
  }

  public sendNotificationToRoom(roomId: string, notification: any) {
    this.broadcastToRoom(roomId, {
      type: 'notification',
      ...notification,
      timestamp: new Date()
    });
  }

  public sendAdminMessage(roomId: string, message: string) {
    const adminMessage: ChatMessage = {
      id: this.generateId(),
      userId: 'admin',
      username: 'GameAll Support',
      message,
      room: roomId,
      timestamp: new Date(),
      type: 'message'
    };

    this.broadcastToRoom(roomId, adminMessage);
  }
}

// Export per essere utilizzato nel server principale
export default ChatWebSocketServer;