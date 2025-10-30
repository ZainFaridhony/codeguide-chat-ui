'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/store/chatSlice';
import styles from './styles.module.css';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = React.useState<string>('');

  const isUser = message.role === 'user';
  const messageClass = isUser ? styles.userMessage : styles.assistantMessage;
  const bubbleClass = isUser ? styles.userBubble : styles.assistantBubble;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`${styles.messageContainer} ${messageClass}`}>
      <div className={`max-w-4xl mx-auto w-full`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${styles.avatar}`}>
            {isUser ? (
              <div className={`${styles.avatarIcon} ${styles.userAvatar}`}>
                <User className="h-4 w-4" />
              </div>
            ) : (
              <div className={`${styles.avatarIcon} ${styles.assistantAvatar}`}>
                <Bot className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Message Bubble */}
          <div className={`flex-1 min-w-0`}>
            <div className={`${bubbleClass} ${styles.messageBubble}`}>
              {isUser ? (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      const codeContent = String(children).replace(/\n$/, '');

                      return !inline && language ? (
                        <div className={styles.codeBlock}>
                          <div className={styles.codeHeader}>
                            <span className={styles.codeLanguage}>{language}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={styles.copyButton}
                              onClick={() => handleCopyCode(codeContent)}
                            >
                              {copiedCode === codeContent ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={language}
                            PreTag="div"
                            className={styles.syntaxHighlighter}
                            {...props}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={`${styles.inlineCode} ${className}`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    a: ({ children, href, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children, ...props }) => (
                      <ul className={styles.list} {...props}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children, ...props }) => (
                      <ol className={styles.list} {...props}>
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote className={styles.blockquote} {...props}>
                        {children}
                      </blockquote>
                    ),
                    table: ({ children, ...props }) => (
                      <div className={styles.tableContainer}>
                        <table className={styles.table} {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...props }) => (
                      <th className={styles.tableHeader} {...props}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td className={styles.tableCell} {...props}>
                        {children}
                      </td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : ''}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}