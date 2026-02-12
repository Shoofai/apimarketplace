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
      // Mock AI response for now - in production, call Claude API
      const mockResponse = generateMockResponse(input, selectedLanguage, mode, apiSpec);

      setTimeout(() => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
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
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
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

function generateMockResponse(
  prompt: string,
  language: string,
  mode: string,
  apiSpec?: any
): string {
  if (mode === 'generate') {
    return `Here's a ${language} implementation for your request:\n\n\`\`\`${language}\n// ${language} code example\nconst apiKey = process.env.API_KEY;\n\nasync function makeRequest() {\n  const response = await fetch('https://api.example.com/endpoint', {\n    method: 'GET',\n    headers: {\n      'Authorization': \`Bearer \${apiKey}\`,\n      'Content-Type': 'application/json'\n    }\n  });\n  \n  const data = await response.json();\n  return data;\n}\n\nmakeRequest()\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));\n\`\`\`\n\nThis code will:\n1. Set up authentication with your API key\n2. Make a GET request to the endpoint\n3. Parse the JSON response\n4. Handle errors appropriately\n\nWould you like me to explain any part of this code or modify it?`;
  } else if (mode === 'explain') {
    return `I'll explain this code for you:\n\nThis code implements an asynchronous API request with the following features:\n\n1. **Authentication**: Uses Bearer token authentication via the Authorization header\n2. **Error Handling**: Includes try-catch for proper error management\n3. **Async/Await**: Modern JavaScript promise handling\n4. **Response Parsing**: Automatically converts JSON response to JavaScript objects\n\nThe code follows best practices by:\n- Using environment variables for sensitive data\n- Implementing proper error handling\n- Using modern async/await syntax\n- Setting appropriate headers\n\nWould you like me to explain any specific part in more detail?`;
  } else {
    return `I found the issue in your code! Here's the fix:\n\nThe problem is in line 5 where you're trying to access \`data.items\` before checking if \`data\` exists.\n\nHere's the corrected version:\n\n\`\`\`${language}\nif (data && data.items) {\n  data.items.forEach(item => {\n    console.log(item.name);\n  });\n} else {\n  console.error('No items found in response');\n}\n\`\`\`\n\nThis prevents the \"Cannot read property 'forEach' of undefined\" error by:\n1. Checking if \`data\` exists\n2. Checking if \`data.items\` exists\n3. Providing fallback error handling\n\nWould you like me to explain more about defensive programming?`;
  }
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
