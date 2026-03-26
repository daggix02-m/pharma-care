import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Phone,
  Mail,
  AlertTriangle,
  Send,
  Bot,
  User,
  X,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiService, AIContext, UserRole, EscalationOption } from '@/services/ai.service';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import gsap from 'gsap';

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
  escalations?: EscalationOption[];
}

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'dialog' | 'sheet';
}

export function AIChatInterface({ isOpen, onClose, variant = 'sheet' }: AIChatInterfaceProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const userRole = (user?.role as UserRole) || 'cashier';
  const currentPage = location.pathname;

  // Load conversation history from Convex
  const conversationHistory = useQuery(
    api.ai.queries.getConversation,
    user?._id ? { userId: user._id } : undefined
  );

  // Mutation to send message
  const sendMessageMutation = useMutation(api.ai.mutations.sendMessage);
  const escalateMutation = useMutation(api.ai.mutations.escalateConversation);

  // Initialize with welcome message
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(userRole);
      const suggestions = aiService.getSuggestions(userRole, currentPage);

      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage,
          timestamp: Date.now(),
          suggestions: suggestions,
        },
      ]);
    }
  }, [isOpen, userRole, currentPage]);

  // Load history from Convex
  React.useEffect(() => {
    if (conversationHistory?.messages && messages.length <= 1) {
      const historyMessages: Message[] = conversationHistory.messages.map(
        (msg: { role: 'user' | 'assistant'; content: string; timestamp: number }) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })
      );
      setMessages((prev) => [...prev, ...historyMessages]);
    }
  }, [conversationHistory]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // GSAP entrance animation
  React.useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      gsap.fromTo(
        chatContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  const getWelcomeMessage = (role: UserRole): string => {
    const messages: Record<UserRole, string> = {
      admin:
        "Hello! I'm your PharmaCare AI Assistant. I can help you with pharmacy approvals, account management, diagnostic views, and platform governance. How can I assist you today?",
      owner:
        "Hello! I'm your PharmaCare AI Assistant. I can help you manage branches, staff, subscriptions, and send internal messages. What would you like to do?",
      manager:
        "Hello! I'm your PharmaCare AI Assistant. I can help you with staff management, inventory, reports, and branch operations. How can I help?",
      pharmacist:
        "Hello! I'm your PharmaCare AI Assistant. I can guide you through prescription dispensing, clinical alerts, and medicine information. What do you need help with?",
      cashier:
        "Hello! I'm your PharmaCare AI Assistant. I can help with payments, returns, discounts, and POS operations. How can I assist?",
    };
    return messages[role];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context: AIContext = {
        role: userRole,
        currentPage,
        userId: user._id,
        pharmacyId: user.pharmacyId,
        branchId: user.branchId,
      };

      // Get AI response
      const response = await aiService.getResponse(userMessage.content, context);

      // Save to Convex
      await sendMessageMutation({
        userId: user._id,
        role: userMessage.content,
        assistantResponse: response.message,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        suggestions: response.suggestions,
        escalations: response.escalations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleEscalation = async (escalation: EscalationOption) => {
    if (!user) return;

    try {
      await escalateMutation({
        userId: user._id,
        pharmacyId: user.pharmacyId,
        role: userRole,
        type: escalation.type,
        reason: 'User requested escalation',
        category: 'platform',
      });

      const escalationMessage: Message = {
        role: 'assistant',
        content: `I've initiated an escalation to ${escalation.label}. ${
          escalation.type === 'phone'
            ? `You can call us at ${escalation.contact}`
            : escalation.type === 'email'
              ? `We've sent details to ${escalation.contact}`
              : 'Your complaint has been logged with reference number #' +
                Math.random().toString(36).substr(2, 9).toUpperCase()
        }. Is there anything else I can help you with?`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, escalationMessage]);
      setShowEscalation(false);
      toast.success('Escalation submitted successfully');
    } catch (error) {
      console.error('Escalation Error:', error);
      toast.error('Failed to submit escalation. Please try again.');
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const isLastMessage = index === messages.length - 1;

    return (
      <div
        key={index}
        className={cn('flex gap-3 mb-4', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
      >
        <Avatar
          className={cn(
            'h-8 w-8 border-2',
            message.role === 'user'
              ? 'bg-primary border-primary'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500'
          )}
        >
          <AvatarFallback className='text-white'>
            {message.role === 'user' ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'flex flex-col max-w-[80%]',
            message.role === 'user' ? 'items-end' : 'items-start'
          )}
        >
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            )}
          >
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          <span className='text-xs text-muted-foreground mt-1 px-1'>
            {formatTime(message.timestamp)}
          </span>

          {/* Suggestions */}
          {isLastMessage &&
            message.role === 'assistant' &&
            message.suggestions &&
            message.suggestions.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className='text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors text-left'
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

          {/* Escalation Options */}
          {isLastMessage &&
            message.role === 'assistant' &&
            message.escalations &&
            message.escalations.length > 0 && (
              <div className='mt-3 space-y-2 w-full'>
                <p className='text-xs text-muted-foreground font-medium'>Escalation Options:</p>
                <div className='grid grid-cols-1 gap-2'>
                  {message.escalations.map((escalation, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEscalation(escalation)}
                      className='flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors text-left'
                    >
                      {escalation.type === 'phone' && (
                        <Phone className='h-4 w-4 text-emerald-600' />
                      )}
                      {escalation.type === 'email' && <Mail className='h-4 w-4 text-blue-600' />}
                      {escalation.type === 'complaint' && (
                        <AlertTriangle className='h-4 w-4 text-amber-600' />
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-foreground'>{escalation.label}</p>
                        <p className='text-xs text-muted-foreground'>{escalation.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  const ChatContent = (
    <div ref={chatContainerRef} className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center'>
              <Bot className='h-5 w-5 text-white' />
            </div>
            <div className='absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background' />
          </div>
          <div>
            <h3 className='font-semibold text-foreground'>AI Assistant</h3>
            <p className='text-xs text-muted-foreground'>Role-scoped for {userRole}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowEscalation(!showEscalation)}
            className={cn('text-xs', showEscalation && 'bg-muted')}
          >
            <AlertTriangle className='h-3.5 w-3.5 mr-1' />
            Escalate
          </Button>
          <Button variant='ghost' size='icon' onClick={onClose} className='h-8 w-8'>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Escalation Panel */}
      {showEscalation && (
        <div className='px-4 py-3 bg-amber-50/50 border-b border-amber-200'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='text-sm font-medium text-amber-900 flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' />
              Escalation Options
            </h4>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowEscalation(false)}
              className='h-6 w-6'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
          <div className='grid grid-cols-1 gap-2'>
            {[
              {
                type: 'phone' as const,
                label: 'Phone Support',
                description: 'Speak with a representative immediately',
              },
              {
                type: 'email' as const,
                label: 'Email Support',
                description: 'Send a detailed inquiry via email',
              },
              {
                type: 'complaint' as const,
                label: 'File a Complaint',
                description: 'Submit a formal complaint with tracking',
              },
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => handleEscalation(option as EscalationOption)}
                className='flex items-center gap-3 p-2.5 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left'
              >
                {option.type === 'phone' && <Phone className='h-4 w-4 text-amber-600' />}
                {option.type === 'email' && <Mail className='h-4 w-4 text-amber-600' />}
                {option.type === 'complaint' && (
                  <AlertTriangle className='h-4 w-4 text-amber-600' />
                )}
                <div>
                  <p className='text-sm font-medium text-amber-900'>{option.label}</p>
                  <p className='text-xs text-amber-700'>{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className='flex-1 px-4 py-4'>
        <div className='space-y-2'>
          {messages.map((message, index) => renderMessage(message, index))}
          {isTyping && (
            <div className='flex gap-3 mb-4'>
              <Avatar className='h-8 w-8 border-2 border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600'>
                <AvatarFallback className='text-white'>
                  <Bot className='h-4 w-4' />
                </AvatarFallback>
              </Avatar>
              <div className='bg-muted rounded-2xl rounded-bl-sm px-4 py-3'>
                <div className='flex items-center gap-1'>
                  <div
                    className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className='px-4 py-3 border-t border-border bg-background'>
        <div className='flex gap-2'>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type your message...'
            className='flex-1'
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size='icon'
            className='shrink-0'
          >
            {isTyping ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
          </Button>
        </div>
        <p className='text-xs text-muted-foreground mt-2 text-center'>
          Press Enter to send • AI responses are role-scoped
        </p>
      </div>
    </div>
  );

  if (variant === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden h-[600px]'>
          {ChatContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side='right' className='w-full sm:max-w-[480px] p-0 overflow-hidden'>
        <SheetHeader className='sr-only'>
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>
        {ChatContent}
      </SheetContent>
    </Sheet>
  );
}

// Floating chat button component
interface AIFloatingButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export function AIFloatingButton({ onClick, unreadCount = 0 }: AIFloatingButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className='fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-all hover:scale-110 flex items-center justify-center group'
    >
      <div className='relative'>
        <MessageSquare className='h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300' />
        {unreadCount > 0 && (
          <div className='absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
