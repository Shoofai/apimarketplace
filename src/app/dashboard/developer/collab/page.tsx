'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Copy, Check, Share2, MessageSquare, Code2 } from 'lucide-react';
import { RequestBuilder, ResponseViewer } from '@/components/features/sandbox/RequestBuilder';

interface Participant {
  user_id: string;
  user_name: string;
  user_email: string;
  cursor_position?: { x: number; y: number };
  joined_at: string;
}

interface CollabSession {
  id: string;
  code: string;
  created_by: string;
  participants: Participant[];
}

export default function CollaborativeTestingPage() {
  const supabase = useSupabase();
  const [session, setSession] = useState<CollabSession | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copied, setCopied] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentRequest, setCurrentRequest] = useState<any>({});
  const [response, setResponse] = useState<any>(null);
  const [sending, setSending] = useState(false);

  // Create new session
  async function createSession() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const code = generateSessionCode();
    const { data, error } = await supabase
      .from('collab_sessions')
      .insert({
        code,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (data && !error) {
      setSession(data);
      setSessionCode(code);
      subscribeToSession(data.id);
    }
  }

  // Join existing session
  async function joinSession(code: string) {
    const { data, error } = await supabase
      .from('collab_sessions')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .single();

    if (data && !error) {
      setSession(data);
      setSessionCode(code);
      subscribeToSession(data.id);
    } else {
      alert('Session not found or expired');
    }
  }

  // Subscribe to session updates
  function subscribeToSession(sessionId: string) {
    const channel = supabase
      .channel(`collab_session:${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as unknown as Participant[];
        setParticipants(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collab_events',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          handleCollabEvent(payload.new);
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await channel.track({
              user_id: userData.user.id,
              user_email: userData.user.email,
              joined_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Handle collab events
  function handleCollabEvent(event: any) {
    switch (event.event_type) {
      case 'request_changed':
        if (followMode) {
          setCurrentRequest(event.payload);
        }
        break;
      case 'chat_message':
        setChatMessages((prev) => [...prev, event.payload]);
        break;
      case 'response_shared':
        setResponse(event.payload);
        break;
    }
  }

  // Broadcast request change
  async function broadcastRequest(request: any) {
    if (!session) return;

    await supabase.from('collab_events').insert({
      session_id: session.id,
      event_type: 'request_changed',
      payload: request,
    });
  }

  // Execute request via proxy and broadcast response to all participants
  async function executeAndBroadcastResponse(request: any) {
    if (!session) return;
    setSending(true);
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: request.method || 'GET',
          url: request.url,
          headers: request.headers || {},
          body: request.body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const payload =
        res.ok
          ? {
              status: data.status,
              headers: data.headers || {},
              data: data.body,
              latency: data.latency,
            }
          : { status: res.status, headers: {}, data: data.error || res.statusText, latency: 0 };
      await supabase.from('collab_events').insert({
        session_id: session.id,
        event_type: 'response_shared',
        payload,
      });
      setResponse(payload);
    } finally {
      setSending(false);
    }
  }

  // Send chat message
  async function sendChatMessage() {
    if (!session || !chatInput.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const message = {
      user_email: userData.user.email,
      message: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    await supabase.from('collab_events').insert({
      session_id: session.id,
      event_type: 'chat_message',
      payload: message,
    });

    setChatInput('');
  }

  function generateSessionCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function copySessionCode() {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!session) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          Collaborative API Testing
        </h1>
          <p className="text-muted-foreground">Test APIs together in real-time</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start New Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create a session and invite your team to collaborate
              </p>
              <Button onClick={createSession} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a 6-character session code to join
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="ABC123"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <Button onClick={() => joinSession(sessionCode)}>Join</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborative Session
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                  {sessionCode}
                </code>
                <Button size="sm" variant="outline" onClick={copySessionCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex -space-x-2">
                {participants.slice(0, 5).map((p, i) => (
                  <Avatar key={i} className="border-2 border-background">
                    <AvatarFallback>
                      {p.user_email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {/* Request Builder */}
          <RequestBuilder
            onSend={async (req) => {
              broadcastRequest(req);
              await executeAndBroadcastResponse(req);
            }}
            isLoading={sending}
            initialRequest={followMode ? currentRequest : undefined}
          />

          {/* Response Viewer */}
          {response && <ResponseViewer response={response} />}
        </div>

        {/* Chat Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[400px] overflow-y-auto space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{msg.user_email}: </span>
                  <span>{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button size="sm" onClick={sendChatMessage}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
