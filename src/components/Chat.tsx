'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'noctis';
  content: string;
  timestamp: string;
}

interface ChatProps {
  variant?: 'full' | 'mini';
  onClose?: () => void;
}

export function Chat({ variant = 'full', onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(variant === 'full');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'noctis',
        content: 'Connection interrupted. The network is fickle, but I remain.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch('/api/chat', { method: 'DELETE' });
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Mini variant (floating bubble)
  if (variant === 'mini' && !isExpanded) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#2979ff] shadow-lg shadow-[#00e5ff]/30 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff5722] text-white text-xs flex items-center justify-center font-mono">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </motion.button>
    );
  }

  const containerClass = variant === 'mini' 
    ? 'fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl'
    : 'h-full w-full rounded-2xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: variant === 'mini' ? 20 : 0, scale: variant === 'mini' ? 0.95 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex flex-col overflow-hidden ${containerClass}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 17, 24, 0.98) 0%, rgba(5, 5, 10, 0.99) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: variant === 'mini' 
          ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 229, 255, 0.1)'
          : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Image
              src="/avatars/noctis.jpg"
              alt="Noctis"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white tracking-wider">
              NOCTIS AURELIUS
            </div>
            <div className="flex items-center gap-2">
              <span className="status-beacon status-active" style={{ width: 6, height: 6 }} />
              <span className="text-xs text-[#30d158] font-mono">ONLINE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-white"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {variant === 'mini' && (
            <>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-white"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-white"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border border-[#00e5ff]/20 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
              <Image
                src="/avatars/noctis.jpg"
                alt="Noctis"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <div className="font-display text-lg font-bold text-white mb-2 tracking-wider">
              NOCTIS AWAITS
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              "The obstacle is the way. Speak your mind, and let's carve a path forward together."
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              {message.role === 'noctis' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-[#00e5ff]/20">
                  <Image
                    src="/avatars/noctis.jpg"
                    alt="Noctis"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#ff5722]/20 to-[#ff5722]/10 border border-[#ff5722]/20'
                    : 'bg-gradient-to-br from-[#00e5ff]/10 to-[#bf5af2]/10 border border-[#00e5ff]/15'
                }`}
              >
                <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className={`text-[10px] font-mono mt-2 ${
                  message.role === 'user' ? 'text-right text-[#ff5722]/60' : 'text-[#00e5ff]/60'
                }`}>
                  {message.role === 'user' ? 'You' : 'Noctis'} • {formatTime(message.timestamp)}
                </div>
              </div>

              {/* User avatar placeholder */}
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5722] to-[#ff9100] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">JK</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-[#00e5ff]/20">
                <Image
                  src="/avatars/noctis.jpg"
                  alt="Noctis"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="bg-gradient-to-br from-[#00e5ff]/10 to-[#bf5af2]/10 border border-[#00e5ff]/15 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-[#00e5ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-[#00e5ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-[#00e5ff]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Noctis..."
              rows={1}
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 transition-all"
              style={{ maxHeight: '120px' }}
            />
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-[var(--text-muted)]">
              {input.length > 0 && 'Enter to send • Shift+Enter for newline'}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#2979ff] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00e5ff]/20 hover:shadow-[#00e5ff]/40 transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Mini floating chat bubble component
export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen ? (
        <Chat variant="mini" onClose={() => setIsOpen(false)} />
      ) : (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#2979ff] shadow-lg shadow-[#00e5ff]/30 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
