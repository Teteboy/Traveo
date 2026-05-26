import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  senderType: string
  text: string
  createdAt: string
}

export function AdminMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/chat/conversations')
        const data = res.data?.data?.conversations || []
        setThreads(data)
        if (data.length > 0) setSelectedThread(data[0].id)
      } catch (e) {
        setThreads([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedThread) return
    const loadMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/conversations/${selectedThread}/messages`)
        setMessages(res.data?.data?.messages || [])
      } catch {
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
      console.error('Send failed')
    }
  }

  const current = threads.find(t => t.id === selectedThread)

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Messages (Admin)</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No conversations.</div>
            ) : (
              threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`w-full p-4 border-b text-left hover:bg-slate-50 ${selectedThread === thread.id ? 'bg-slate-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-[#44DBD4] text-white">
                        {thread.otherParty.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium truncate">{thread.otherParty.name}</p>
                        {thread.unreadCount > 0 && <Badge className="bg-[#44DBD4]">{thread.unreadCount}</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 truncate">{thread.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread && current ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-[#44DBD4] text-white">
                    {current.otherParty.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{current.otherParty.name}</p>
                  <p className="text-xs text-slate-500">Conversation with user/provider</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm px-4 py-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-[#44DBD4] text-white' : 'bg-slate-100'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend} className="bg-[#44DBD4]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a conversation
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
