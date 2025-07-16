import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestedActions?: ChatAction[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

interface ChatAction {
  id: string;
  label: string;
  type: 'quick_reply' | 'external_link' | 'escalate' | 'product_link';
  data?: any;
}

interface ChatSession {
  id: string;
  userId: string;
  startedAt: Date;
  status: 'active' | 'resolved' | 'escalated';
  satisfactionRating?: number;
  category?: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [quickReplies, setQuickReplies] = useState<ChatAction[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'it-IT';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsVoiceActive(false);
      };

      recognition.current.onerror = () => setIsVoiceActive(false);
      recognition.current.onend = () => setIsVoiceActive(false);
    }

    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: generateId(),
      type: 'bot',
      content: `Ciao! 👋 Sono GameBot, il tuo assistente AI per GameAll. Come posso aiutarti oggi?`,
      timestamp: new Date(),
      metadata: {
        confidence: 1.0,
        suggestedActions: [
          { id: '1', label: 'Stato ordine', type: 'quick_reply', data: { query: 'stato ordine' } },
          { id: '2', label: 'Problemi prodotto', type: 'quick_reply', data: { query: 'problema prodotto' } },
          { id: '3', label: 'Reso/rimborso', type: 'quick_reply', data: { query: 'reso rimborso' } },
          { id: '4', label: 'Supporto tecnico', type: 'quick_reply', data: { query: 'supporto tecnico' } }
        ]
      }
    };

    setMessages([welcomeMessage]);
    setQuickReplies(welcomeMessage.metadata?.suggestedActions || []);
    
    // Create session
    const newSession: ChatSession = {
      id: generateId(),
      userId: 'current-user',
      startedAt: new Date(),
      status: 'active'
    };
    setSession(newSession);
  };

  const sendMessage = async (content: string, isQuickReply = false) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setQuickReplies([]);
    setIsTyping(true);

    // Simulate AI processing
    try {
      const botResponse = await processAIResponse(content);
      
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setQuickReplies(botResponse.metadata?.suggestedActions || []);
        setIsTyping(false);

        // Text-to-speech if enabled
        if (isSpeechEnabled && synthesis.current) {
          const utterance = new SpeechSynthesisUtterance(botResponse.content);
          utterance.lang = 'it-IT';
          utterance.rate = 0.9;
          synthesis.current.speak(utterance);
        }
      }, isQuickReply ? 800 : 1500);
    } catch (error) {
      setIsTyping(false);
      console.error('Error processing AI response:', error);
    }
  };

  const processAIResponse = async (userInput: string): Promise<ChatMessage> => {
    // Simulate AI processing with realistic responses
    const lowerInput = userInput.toLowerCase();
    
    let response = '';
    let confidence = 0.85;
    let suggestedActions: ChatAction[] = [];
    let category = 'general';

    if (lowerInput.includes('ordine') || lowerInput.includes('spedizione')) {
      category = 'orders';
      response = `Per controllare lo stato del tuo ordine, puoi:\n\n🔍 Andare nella sezione "I miei ordini" del tuo profilo\n📧 Controllare l'email di conferma con il numero di tracking\n📞 Se hai bisogno di aiuto specifico, dimmi il numero d'ordine\n\nHai il numero d'ordine a disposizione?`;
      suggestedActions = [
        { id: '1', label: 'Vai ai miei ordini', type: 'external_link', data: { url: '/orders' } },
        { id: '2', label: 'Ho il numero ordine', type: 'quick_reply', data: { query: 'numero ordine' } },
        { id: '3', label: 'Non trovo l\'email', type: 'quick_reply', data: { query: 'email ordine' } }
      ];
    } else if (lowerInput.includes('reso') || lowerInput.includes('rimborso')) {
      category = 'returns';
      response = `Nessun problema per i resi! 🔄\n\nPuoi restituire qualsiasi prodotto entro **30 giorni** dall'acquisto:\n\n✅ Prodotto in condizioni originali\n📦 Confezione e accessori inclusi\n🧾 Scontrino o email d'ordine\n\nVuoi iniziare una procedura di reso o hai domande specifiche?`;
      suggestedActions = [
        { id: '1', label: 'Inizia reso', type: 'external_link', data: { url: '/returns' } },
        { id: '2', label: 'Condizioni reso', type: 'quick_reply', data: { query: 'condizioni reso' } },
        { id: '3', label: 'Tempi rimborso', type: 'quick_reply', data: { query: 'tempi rimborso' } }
      ];
    } else if (lowerInput.includes('problema') || lowerInput.includes('difetto') || lowerInput.includes('non funziona')) {
      category = 'technical';
      response = `Mi dispiace che tu abbia riscontrato un problema! 😔\n\nPer aiutarti meglio, dimmi:\n\n🎮 Quale prodotto hai acquistato?\n❓ Che tipo di problema stai riscontrando?\n⏰ Da quando si verifica il problema?\n\nNel frattempo, prova questi step base:\n• Controlla che tutto sia collegato correttamente\n• Riavvia il dispositivo\n• Verifica gli aggiornamenti software`;
      suggestedActions = [
        { id: '1', label: 'Supporto tecnico avanzato', type: 'escalate', data: { department: 'technical' } },
        { id: '2', label: 'Garanzia prodotto', type: 'quick_reply', data: { query: 'garanzia' } },
        { id: '3', label: 'Sostituzione', type: 'quick_reply', data: { query: 'sostituzione' } }
      ];
    } else if (lowerInput.includes('pagamento') || lowerInput.includes('carta') || lowerInput.includes('paypal')) {
      category = 'payment';
      response = `Per quanto riguarda i pagamenti, accettiamo: 💳\n\n• Carte di credito/debito (Visa, Mastercard)\n• PayPal\n• Bonifico bancario\n• Contrassegno (+ €3.99)\n\nSe hai problemi con un pagamento, posso aiutarti a:\n• Verificare lo stato di una transazione\n• Risolvere errori di pagamento\n• Modificare il metodo di pagamento`;
      suggestedActions = [
        { id: '1', label: 'Errore pagamento', type: 'quick_reply', data: { query: 'errore pagamento' } },
        { id: '2', label: 'Modifica pagamento', type: 'quick_reply', data: { query: 'modifica pagamento' } },
        { id: '3', label: 'Fattura', type: 'quick_reply', data: { query: 'fattura' } }
      ];
    } else if (lowerInput.includes('sconto') || lowerInput.includes('coupon') || lowerInput.includes('offerta')) {
      category = 'promotions';
      response = `Ottima domanda sui nostri sconti! 🎉\n\n📧 **Newsletter**: Sconto 10% sul primo acquisto\n🎂 **Compleanno**: Sconto speciale nel tuo mese\n🏆 **Fedeltà**: Punti e sconti crescenti\n⚡ **Flash**: Offerte lampo periodiche\n\nVuoi iscriverti alla newsletter o cercare offerte specifiche?`;
      suggestedActions = [
        { id: '1', label: 'Iscriviti newsletter', type: 'external_link', data: { url: '/newsletter' } },
        { id: '2', label: 'Offerte attuali', type: 'external_link', data: { url: '/offers' } },
        { id: '3', label: 'Programma fedeltà', type: 'quick_reply', data: { query: 'programma fedeltà' } }
      ];
    } else if (lowerInput.includes('ciao') || lowerInput.includes('grazie') || lowerInput.includes('aiuto')) {
      response = `Sono qui per aiutarti! 😊\n\nPosso assisterti con:\n• 📦 Ordini e spedizioni\n• 🔄 Resi e rimborsi\n• 🎮 Supporto prodotti\n• 💳 Pagamenti\n• 🎁 Offerte e sconti\n\nCosa ti serve oggi?`;
      suggestedActions = [
        { id: '1', label: 'I miei ordini', type: 'quick_reply', data: { query: 'stato ordine' } },
        { id: '2', label: 'Problema prodotto', type: 'quick_reply', data: { query: 'problema prodotto' } },
        { id: '3', label: 'Parla con umano', type: 'escalate', data: { department: 'general' } }
      ];
    } else {
      response = `Ho capito che ti serve aiuto con: "${userInput}"\n\n🤔 Non sono sicuro di aver compreso completamente. Puoi essere più specifico?\n\nOppure scegli una delle opzioni qui sotto per un aiuto mirato:`;
      confidence = 0.4;
      suggestedActions = [
        { id: '1', label: 'Supporto ordini', type: 'quick_reply', data: { query: 'aiuto ordine' } },
        { id: '2', label: 'Supporto prodotti', type: 'quick_reply', data: { query: 'aiuto prodotto' } },
        { id: '3', label: 'Parla con operatore', type: 'escalate', data: { department: 'general' } }
      ];
    }

    return {
      id: generateId(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      metadata: {
        confidence,
        suggestedActions,
        sentiment: confidence > 0.7 ? 'positive' : 'neutral'
      }
    };
  };

  const handleQuickReply = (action: ChatAction) => {
    if (action.type === 'quick_reply') {
      sendMessage(action.data.query, true);
    } else if (action.type === 'external_link') {
      window.open(action.data.url, '_blank');
    } else if (action.type === 'escalate') {
      escalateToHuman(action.data.department);
    }
  };

  const escalateToHuman = (department: string) => {
    const escalationMessage: ChatMessage = {
      id: generateId(),
      type: 'system',
      content: `🙋‍♀️ Ti sto collegando con un operatore del supporto ${department}. Attendi un momento...`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, escalationMessage]);
    
    setTimeout(() => {
      const humanMessage: ChatMessage = {
        id: generateId(),
        type: 'bot',
        content: `👤 **Operatore Maria**: Ciao! Ho preso in carico la tua richiesta. Come posso aiutarti meglio?`,
        timestamp: new Date(),
        metadata: {
          confidence: 1.0,
          suggestedActions: []
        }
      };
      
      setMessages(prev => [...prev, humanMessage]);
      setQuickReplies([]);
      
      if (session) {
        setSession({ ...session, status: 'escalated' });
      }
    }, 2000);
  };

  const startVoiceInput = () => {
    if (recognition.current) {
      setIsVoiceActive(true);
      recognition.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsVoiceActive(false);
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatMessage = (content: string) => {
    // Simple markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="w-96 h-[600px] shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-white/20 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">GameBot AI</h3>
                      <p className="text-xs text-white/80">Supporto sempre attivo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <CardContent className="flex-1 p-0 h-[400px] overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {message.type === 'user' ? (
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            ) : message.type === 'system' ? (
                              <AvatarFallback className="bg-yellow-100 text-yellow-600">
                                <Info className="h-4 w-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block p-3 rounded-lg max-w-[280px] ${
                              message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : message.type === 'system'
                                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                  : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div 
                                className="text-sm"
                                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                              />
                              
                              {message.metadata?.confidence && message.metadata.confidence < 0.8 && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{message.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                              {message.type === 'bot' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-auto p-0 text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Quick Replies */}
                  {quickReplies.length > 0 && (
                    <div className="border-t border-gray-200 p-3">
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(action)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Scrivi il tuo messaggio..."
                          className="pr-10"
                        />
                        
                        {recognition.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={isVoiceActive ? stopVoiceInput : startVoiceInput}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${
                              isVoiceActive ? 'text-red-500 animate-pulse' : 'text-gray-400'
                            }`}
                          >
                            {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>Powered by AI</span>
                      </div>
                      {session && (
                        <Badge variant="secondary" className="text-xs">
                          {session.status === 'active' ? 'Online' : session.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}