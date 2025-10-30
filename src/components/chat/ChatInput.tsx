'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/store/chatSlice';
import { Send, Loader2 } from 'lucide-react';
import { RootState } from '@/store/store';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useDispatch();
  const { isLoading, isTyping } = useSelector((state: RootState) => state.chat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

    const messageText = input.trim();
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Dispatch the send message action
    dispatch(sendMessage(messageText));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const isDisabled = !input.trim() || isLoading || isTyping;

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] max-h-[200px] resize-none pr-12 border-2 focus:border-primary transition-colors"
            disabled={isLoading || isTyping}
            rows={1}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isDisabled}
          className="h-[60px] px-4"
        >
          {isLoading || isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}