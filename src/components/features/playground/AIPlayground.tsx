'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Code2,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIPlaygroundProps {
  apiId?: string;
  apiSpec?: any;
  language?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIPlayground({ apiId, apiSpec, language = 'javascript' }: AIPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [mode, setMode] = useState<'generate' | 'explain' | 'debug'>('generate');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint =
        mode === 'generate'
          ? '/api/ai/playground'
          : mode === 'explain'
            ? '/api/ai/explain'
            : '/api/ai/debug';

      const body =
        mode === 'generate'
          ? { apiId: apiId || undefined, userPrompt: input, language: selectedLanguage, sessionId: `session-${Date.now()}` }
          : mode === 'explain'
            ? { code: input, language: selectedLanguage }
            : { code: input, error: 'User reported issue', language: selectedLanguage };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || res.statusText || 'Request failed';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errMsg}`, timestamp: new Date() },
        ]);
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        setMessages((prev) => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
              next[lastIdx] = { ...next[lastIdx], content: accumulated };
            }
            return next;
          });
        }
      }

      if (!accumulated) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'No response received.', timestamp: new Date() },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  const downloadCode = () => {
    const lastAssistantMessage = messages
      .filter((m) => m.role === 'assistant')
      .pop();
    if (lastAssistantMessage) {
      const blob = new Blob([lastAssistantMessage.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${getFileExtension(selectedLanguage)}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger className="w-[11rem] min-w-[11rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generate">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Generate Code
                  </div>
                </SelectItem>
                <SelectItem value="explain">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Explain Code
                  </div>
                </SelectItem>
                <SelectItem value="debug">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Debug Code
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[11rem] min-w-[11rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Claude 3.5 Sonnet
            </Badge>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
                <RotateCcw className="h-4 w-4" />
              </Button>
              {messages.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const lastMsg = messages.filter((m) => m.role === 'assistant').pop();
                      if (lastMsg) copyToClipboard(lastMsg.content);
                    }}
                    title="Copy last response"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadCode}
                    title="Download code"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-6 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI Code Playground
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {mode === 'generate' &&
                  `Generate ${selectedLanguage} code for API integration. Just describe what you need!`}
                {mode === 'explain' &&
                  'Paste your code and I\'ll explain how it works in detail.'}
                {mode === 'debug' &&
                  'Share your code and error, and I\'ll help you fix it.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {getExamplePrompts(mode, selectedLanguage).map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {message.content}
                    </pre>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      U
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'generate'
                  ? 'Describe the code you want to generate...'
                  : mode === 'explain'
                  ? 'Paste your code here to get an explanation...'
                  : 'Paste your code and describe the issue...'
              }
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </Card>
    </div>
  );
}

function getExamplePrompts(mode: string, language: string): string[] {
  if (mode === 'generate') {
    return [
      `Create a ${language} function to fetch user data`,
      'Add authentication to API request',
      'Implement rate limiting',
    ];
  } else if (mode === 'explain') {
    return [
      'Explain async/await',
      'What does this function do?',
      'Break down this code',
    ];
  } else {
    return [
      'Why am I getting undefined?',
      'Fix authentication error',
      'Debug timeout issue',
    ];
  }
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    go: 'go',
    ruby: 'rb',
    php: 'php',
    java: 'java',
    csharp: 'cs',
  };
  return extensions[language] || 'txt';
}
