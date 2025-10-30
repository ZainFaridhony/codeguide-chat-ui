'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { RootState } from '@/store/store';
import { clearError, fetchOlderMessages } from '@/store/chatSlice';

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { messages, isLoading, isTyping, error, hasMoreMessages } = useSelector(
    (state: RootState) => state.chat
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Infinite scroll setup for loading older messages
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '100px 0px',
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load older messages when top of list comes into view
  useEffect(() => {
    if (inView && hasMoreMessages && !isLoading && messages.length > 0) {
      const oldestMessageId = messages[0]?.id || null;
      dispatch(fetchOlderMessages({ oldestMessageId, limit: 20 }));
    }
  }, [inView, hasMoreMessages, isLoading, dispatch, messages]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: 'Dismiss',
          onClick: () => dispatch(clearError()),
        },
      });
    }
  }, [error, dispatch]);

  const handleNewChat = () => {
    // This would typically clear the current conversation
    // For now, we can just show a toast
    toast.info('New chat feature coming soon!');
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <div className="flex items-start gap-3 px-4 py-6">
        <div className="w-8 h-8 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
            <Menu className="h-4 w-4" />
          </div>
        </div>
        <div className="flex-1 mr-12">
          <div className="bg-background border rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-muted-foreground">AI is typing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingSpinner = () => {
    if (!isLoading || messages.length > 0) return null;

    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading conversation...</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col bg-background border-0 shadow-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <Menu className="h-5 w-5" />
            <span className="ml-2">New Chat</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Future menu items can go here */}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1"
          type="auto"
        >
          <div className="flex flex-col">
            {/* Loading older messages indicator */}
            {isLoading && messages.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading older messages...</span>
              </div>
            )}

            {/* Load more trigger */}
            {hasMoreMessages && (
              <div ref={loadMoreRef} className="h-1" />
            )}

            {/* Messages */}
            {messages.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">Type a message below to begin chatting with AI</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={message.id || index} message={message} />
              ))
            )}

            {/* Typing indicator */}
            {renderTypingIndicator()}

            {/* Initial loading spinner */}
            {renderLoadingSpinner()}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <ChatInput />
    </Card>
  );
}