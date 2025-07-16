import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface ChatMessage {
  id: number;
  userId: string | null;
  senderType: 'user' | 'admin' | 'system';
  senderName: string;
  message: string;
  roomId: string;
  createdAt: string;
}

interface WebSocketMessage {
  type: 'new_message' | 'message_history' | 'user_joined' | 'user_left' | 'user_typing' | 'error';
  data: any;
}

export function LiveChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomId = 'support'; // Default to support room

  useEffect(() => {
    if (isOpen && user && !ws.current) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?userId=${user.id}&roomId=${roomId}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (isOpen && user) {
          connectWebSocket();
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'message_history':
        setMessages(data.data.reverse()); // Reverse because we get newest first from DB
        break;

      case 'new_message':
        setMessages(prev => [...prev, data.data]);
        break;

      case 'user_joined':
        if (data.data.userId !== user?.id) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            userId: null,
            senderType: 'system',
            senderName: 'Sistema',
            message: data.data.message,
            roomId: roomId,
            createdAt: new Date().toISOString()
          }]);
        }
        break;

      case 'user_left':
        if (data.data.userId !== user?.id) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            userId: null,
            senderType: 'system',
            senderName: 'Sistema',
            message: data.data.message,
            roomId: roomId,
            createdAt: new Date().toISOString()
          }]);
        }
        break;

      case 'user_typing':
        if (data.data.userId !== user?.id) {
          setTypingUsers(prev => {
            if (data.data.isTyping) {
              return prev.includes(data.data.userId) ? prev : [...prev, data.data.userId];
            } else {
              return prev.filter(id => id !== data.data.userId);
            }
          });
        }
        break;

      case 'error':
        console.error('WebSocket error:', data);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !ws.current || !isConnected) return;

    ws.current.send(JSON.stringify({
      type: 'send_message',
      data: { message }
    }));

    setMessage("");
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else {
      startTyping();
    }
  };

  const startTyping = () => {
    if (!isTyping && ws.current && isConnected) {
      setIsTyping(true);
      ws.current.send(JSON.stringify({
        type: 'typing',
        data: {}
      }));
    }

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping && ws.current && isConnected) {
      setIsTyping(false);
      ws.current.send(JSON.stringify({
        type: 'stop_typing',
        data: {}
      }));
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarInitials = (senderType: string, senderName: string) => {
    if (senderType === 'system') return 'S';
    if (senderType === 'admin') return 'GA';
    return senderName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Don't show chat if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-600 hover:via-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative"
              size="icon"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
              {!isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        GA
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Assistenza GameAll</CardTitle>
                      <p className="text-xs text-white/80 flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        {isConnected ? 'Online' : 'Reconnecting...'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-64 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-xs ${msg.userId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarFallback className={`text-xs ${
                              msg.userId === user?.id 
                                ? 'bg-primary text-primary-foreground' 
                                : msg.senderType === 'admin'
                                ? 'bg-indigo-500 text-white'
                                : msg.senderType === 'system'
                                ? 'bg-gray-400 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {getAvatarInitials(msg.senderType, msg.senderName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg px-3 py-2 ${
                            msg.userId === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : msg.senderType === 'admin'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : msg.senderType === 'system'
                              ? 'bg-gray-50 text-gray-600 border border-gray-200'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {typingUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isConnected ? "Scrivi un messaggio..." : "Connessione in corso..."}
                      disabled={!isConnected}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || !isConnected}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
