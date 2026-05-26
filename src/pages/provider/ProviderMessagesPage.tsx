import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Send } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

interface Thread {
  id: string
  otherParty: { name: string; avatar?: string }
  lastMessage: string
  lastMessageTime?: string
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  senderType: 'provider' | 'user'
  text: string
  createdAt: string
  isRead: boolean
}

export function ProviderMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await apiClient.get('/chat/conversations')
        const data = res.data?.data?.conversations || []
        setThreads(data)
        if (data.length > 0 && !selectedThread) {
          setSelectedThread(data[0].id)
        }
      } catch (e) {
        console.error('Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  // Load messages when thread changes
  useEffect(() => {
    if (!selectedThread) return

    const loadMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/conversations/${selectedThread}/messages`)
        setMessages(res.data?.data?.messages || [])
      } catch (e) {
        setMessages([])
      }
    }
    loadMessages()
  }, [selectedThread])

  const handleSend = async () => {
    if (!messageText.trim() || !selectedThread) return

    try {
      await apiClient.post(`/chat/conversations/${selectedThread}/messages`, { text: messageText.trim() })
      const res = await apiClient.get(`/chat/conversations/${selectedThread}/messages`)
      setMessages(res.data?.data?.messages || [])
      setMessageText('')
    } catch (e) {
      console.error('Failed to send message')
    }
  }

  const selectedThreadData = threads.find(t => t.id === selectedThread)

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No conversations yet.</div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`w-full p-4 border-b hover:bg-slate-50 transition-colors text-left ${
                    selectedThread === thread.id ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={thread.otherParty.avatar} />
                      <AvatarFallback className="bg-[#44DBD4] text-white">
                        {thread.otherParty.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{thread.otherParty.name}</p>
                        {thread.unreadCount > 0 && (
                          <Badge className="bg-[#44DBD4] text-white ml-2">{thread.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 truncate">{thread.lastMessage}</p>
                      <p className="text-xs text-slate-400 mt-1">{thread.lastMessageTime ? new Date(thread.lastMessageTime).toLocaleTimeString() : ''}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread && selectedThreadData ? (
            <>
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-[#44DBD4] text-white">
                      {selectedThreadData.otherParty.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedThreadData.otherParty.name}</p>
                    <p className="text-xs text-slate-500">Conversation</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'provider' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm px-4 py-3 rounded-lg ${
                        message.senderType === 'provider'
                          ? 'bg-[#44DBD4] text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.senderType === 'provider' ? 'text-white/70' : 'text-slate-500'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend} className="bg-[#44DBD4] hover:bg-[#3bc9c2]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
