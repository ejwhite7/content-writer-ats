'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Interface for message structure based on application messaging
interface ThreadMessage {
  id: string
  content: string
  sender_id: string
  created_at: string
  read_at?: string
  users: {
    first_name: string
    last_name: string
    email: string
  }
}

interface MessageThreadProps {
  applicationId: string
  initialMessages?: ThreadMessage[]
}

// API response interface
interface ApiResponse {
  success?: boolean
  messages?: ThreadMessage[]
  message?: ThreadMessage
  error?: string
}

export function MessageThread({ applicationId, initialMessages = [] }: MessageThreadProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch messages on mount
  useEffect(() => {
    if (initialMessages.length === 0) {
      fetchMessages()
    }
  }, [applicationId, initialMessages.length])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages?application_id=${applicationId}`)
      const data: ApiResponse = await response.json()
      
      if (response.ok && data.messages) {
        setMessages(data.messages)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch messages',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          content: newMessage.trim()
        })
      })

      const data: ApiResponse = await response.json()
      
      if (response.ok && data.message) {
        setMessages(prev => [...prev, data.message!])
        setNewMessage('')
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet.</p>
                <p className="text-sm">Start a conversation below.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(message.users.first_name, message.users.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col gap-1 max-w-[70%] ${
                      isOwn ? 'items-end' : 'items-start'
                    }`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {message.users.first_name} {message.users.last_name}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message... (Ctrl+Enter to send)"
              className="flex-1 min-h-[80px] resize-none"
              disabled={sending}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="self-end"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter to send
          </p>
        </div>
      </CardContent>
    </Card>
  )
}