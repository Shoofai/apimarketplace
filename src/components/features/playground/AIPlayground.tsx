'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, User, Code, Copy, Check, Loader2 } from 'lucide-react';
import { CodeMirror } from '@/components/ui/code-mirror';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIPlaygroundProps {
  apiId?: string;
  apiSpec?: any;
  language?: string;
}

export function AIPlayground({ apiId, apiSpec, language = 'javascript' }: AIPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          api_id: apiId,
          language,
          conversation_history: messages.slice(-4), // Last 4 messages for context
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        // Add placeholder message
        const placeholderMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, placeholderMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  // Update the last message
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantMessage;
                    return updated;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('AI Playground error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setInput('');
  }

  function copyCode(content: string) {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Code Playground
            </CardTitle>
            <CardDescription>
              Generate code, explain APIs, and debug with Claude AI
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{language}</Badge>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearConversation}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
              <p className="text-sm max-w-md">
                Ask me to generate code, explain how an API works, debug errors, or help with
                integration
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6 max-w-2xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInput('Generate a function to create a user with this API')
                  }
                >
                  Generate code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Explain how authentication works')}
                >
                  Explain API
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInput('Debug this error: 401 Unauthorized when calling /users')
                  }
                >
                  Debug error
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Create a multi-step user onboarding flow')}
                >
                  Multi-step flow
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  onCopy={copyCode}
                  copied={copied}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Generating...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to generate code, explain an API, debug an error..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {isLoading ? (
            <Button type="button" onClick={handleStop} variant="destructive">
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function MessageBubble({
  message,
  onCopy,
  copied,
}: {
  message: Message;
  onCopy: (content: string) => void;
  copied: boolean;
}) {
  const isUser = message.role === 'user';
  const hasCode = message.content.includes('```');

  // Extract code blocks
  const parts = message.content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-secondary' : 'bg-primary'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {parts.map((part, index) => {
            if (part.startsWith('```')) {
              const code = part.slice(3, -3);
              const [lang, ...codeLines] = code.split('\n');
              const codeContent = codeLines.join('\n');

              return (
                <div key={index} className="my-2 bg-background rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-xs text-muted-foreground">{lang || 'code'}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopy(codeContent)}
                      className="h-6"
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 overflow-x-auto">
                    <code className="text-sm">{codeContent}</code>
                  </pre>
                </div>
              );
            }
            return (
              <p key={index} className="whitespace-pre-wrap">
                {part}
              </p>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
