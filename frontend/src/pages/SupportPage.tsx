import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Search, Send, Phone, Mail, HelpCircle, Book, FileText, Video, Bot, User, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCurrentUser } from '@/hooks/useAuth'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  message: string
  timestamp: string
}

interface Thread {
  id: string
  otherParty: { name: string; avatar?: string }
  lastMessage: string
  lastMessageTime?: string
  unreadCount: number
}

interface ConversationMessage {
  id: string
  senderId: string
  senderType: 'user' | 'provider'
  text: string
  createdAt: string
}

const faqCategories = [
  {
    title: 'Réservations',
    icon: Book,
    questions: [
      'Comment modifier ma réservation ?',
      'Puis-je annuler mon vol ?',
      'Comment obtenir mon billet électronique ?',
      'Politique de remboursement'
    ]
  },
  {
    title: 'Paiements',
    icon: FileText,
    questions: [
      'Quels moyens de paiement acceptez-vous ?',
      'Comment fonctionne le portefeuille multi-devises ?',
      'Puis-je payer en plusieurs fois ?',
      'Sécurité des paiements'
    ]
  },
  {
    title: 'e-Visa',
    icon: FileText,
    questions: [
      'Comment faire une demande de visa ?',
      'Quels documents sont nécessaires ?',
      'Délai de traitement d\'un visa',
      'Suivi de ma demande de visa'
    ]
  },
  {
    title: 'Compte',
    icon: HelpCircle,
    questions: [
      'Créer un compte',
      'Réinitialiser mon mot de passe',
      'Modifier mes informations personnelles',
      'Supprimer mon compte'
    ]
  }
]

export function SupportPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useCurrentUser()

  // Real-message mode state
  const [chatMode, setChatMode] = useState<'bot' | 'messages'>('bot')
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [threadsLoading, setThreadsLoading] = useState(false)
  const [creatingThread, setCreatingThread] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, conversationMessages])

  // Load real conversations when switching to Messages mode
  useEffect(() => {
    if (chatMode !== 'messages') return
    const loadThreads = async () => {
      try {
        setThreadsLoading(true)
        const res = await apiClient.get('/chat/conversations')
        const data = (res as any).data?.data?.conversations || []
        setThreads(data)
        if (data.length > 0 && !selectedThread) setSelectedThread(data[0].id)
      } catch (e) {
        toast.error('Impossible de charger les conversations')
      } finally {
        setThreadsLoading(false)
      }
    }
    loadThreads()
  }, [chatMode])

  // Load messages when selected thread changes
  useEffect(() => {
    if (chatMode !== 'messages' || !selectedThread) return
    const loadMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/conversations/${selectedThread}/messages`)
        setConversationMessages((res as any).data?.data?.messages || [])
      } catch (e) {
        setConversationMessages([])
      }
    }
    loadMessages()
  }, [selectedThread, chatMode])

  const createNewConversation = async () => {
    if (!user) {
      toast.info('Connectez-vous pour contacter un conseiller')
      return
    }
    setCreatingThread(true)
    try {
      const res = await apiClient.post('/chat/conversations', { text: 'Bonjour, j\'ai besoin d\'aide avec le support Traveo.' })
      const newThread = (res as any).data?.data?.conversation
      if (newThread?.id) {
        setThreads(prev => [newThread, ...prev])
        setSelectedThread(newThread.id)
      }
      toast.success('Conversation démarrée avec le support')
    } catch (e: any) {
      toast.error(e.message || 'Impossible de créer la conversation')
    } finally {
      setCreatingThread(false)
    }
  }

  const handleSendConversationMessage = async () => {
    if (!inputMessage.trim() || !selectedThread) return
    try {
      await apiClient.post(`/chat/conversations/${selectedThread}/messages`, { text: inputMessage.trim() })
      const res = await apiClient.get(`/chat/conversations/${selectedThread}/messages`)
      setConversationMessages((res as any).data?.data?.messages || [])
      setInputMessage('')
      // Refresh last message preview in the thread list
      const threadsRes = await apiClient.get('/chat/conversations')
      setThreads((threadsRes as any).data?.data?.conversations || [])
    } catch (e) {
      toast.error('Impossible d\'envoyer le message')
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await apiClient.post<{ data?: { response?: string } }>('/chat/message', {
        message: inputMessage,
        context: {
          userAuthenticated: !!user,
          userName: user ? `${user.firstName} ${user.lastName}` : null,
          currentPage: 'support'
        }
      })

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: response.data?.response ?? 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date().toISOString()
      }

      setChatMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: 'Désolé, je rencontre un problème technique. Veuillez réessayer ou contactez le support directement.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Centre d'Aide & Support</h1>
        <p className="text-muted-foreground">
          Nous sommes là pour vous aider 24/7
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[#44DBD4]/10 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-[#44DBD4]" />
            </div>
            <h3 className="font-semibold mb-1">Chat en direct</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Réponse en quelques minutes
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              En ligne
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[#44DBD4]/10 flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-[#44DBD4]" />
            </div>
            <h3 className="font-semibold mb-1">Téléphone</h3>
            <p className="text-sm text-muted-foreground mb-3">
              +33 1 23 45 67 89
            </p>
            <p className="text-xs text-muted-foreground">
              Lun-Dim 8h-22h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[#44DBD4]/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-[#44DBD4]" />
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-muted-foreground mb-3">
              support@tripplanner.com
            </p>
            <p className="text-xs text-muted-foreground">
              Réponse sous 24h
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans l'aide..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="h-5 w-5 text-[#44DBD4]" />
                    <h3 className="font-semibold">{category.title}</h3>
                  </div>
                  <ul className="space-y-2 pl-7">
                    {category.questions.map((question) => (
                      <li key={question}>
                        <button className="text-sm text-muted-foreground hover:text-[#44DBD4] transition-colors text-left">
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Ressources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Video className="mr-2 h-4 w-4" />
                Tutoriels vidéo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Book className="mr-2 h-4 w-4" />
                Guide d'utilisation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Conditions générales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat en direct
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={chatMode === 'bot' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={chatMode === 'bot' ? 'bg-white shadow-sm' : ''}
                    onClick={() => setChatMode('bot')}
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    Assistant
                  </Button>
                  <Button
                    variant={chatMode === 'messages' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={chatMode === 'messages' ? 'bg-white shadow-sm' : ''}
                    onClick={() => setChatMode('messages')}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Messages
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />

            {chatMode === 'bot' ? (
              <>
                {/* Bot Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <Avatar className="h-8 w-8 bg-[#44DBD4]">
                          <AvatarFallback className="text-white">
                            <MessageCircle className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-[#44DBD4] text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {msg.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200">
                            {user?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 bg-[#44DBD4]">
                        <AvatarFallback className="text-white">
                          <MessageCircle className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                        <div className="flex gap-1">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </CardContent>

                <Separator />

                {/* Bot Input */}
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isTyping}
                    />
                    <Button
                      className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                {/* Real Messages Mode */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                  {/* Thread List */}
                  <div className="border-r md:col-span-1 flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">Conversations</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={createNewConversation} disabled={creatingThread}>
                        {creatingThread ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {threadsLoading ? (
                        <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
                      ) : threads.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">
                          Aucune conversation. Cliquez sur + pour contacter le support.
                        </div>
                      ) : (
                        threads.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => setSelectedThread(thread.id)}
                            className={`w-full p-3 text-left border-b hover:bg-slate-50 transition-colors ${
                              selectedThread === thread.id ? 'bg-slate-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[#44DBD4] text-white text-xs">
                                  {thread.otherParty.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="font-medium text-sm truncate">{thread.otherParty.name}</p>
                                  {thread.unreadCount > 0 && (
                                    <Badge className="bg-[#44DBD4] text-white text-xs px-1.5 py-0 h-5">{thread.unreadCount}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 truncate">{thread.lastMessage}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="md:col-span-2 flex flex-col h-full">
                    {selectedThread && threads.find(t => t.id === selectedThread) ? (
                      <>
                        <div className="p-3 border-b flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#44DBD4] text-white text-xs">
                              {threads.find(t => t.id === selectedThread)?.otherParty.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{threads.find(t => t.id === selectedThread)?.otherParty.name}</p>
                            <p className="text-xs text-slate-500">Support Traveo</p>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {conversationMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-sm px-4 py-3 rounded-lg ${msg.senderType === 'user' ? 'bg-[#44DBD4] text-white' : 'bg-slate-100'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 border-t">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Tapez votre message..."
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendConversationMessage()
                                }
                              }}
                            />
                            <Button
                              className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                              onClick={handleSendConversationMessage}
                              disabled={!inputMessage.trim() || !selectedThread}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
                        <MessageCircle className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-sm text-center">Sélectionnez une conversation ou démarrez-en une nouvelle.</p>
                        <Button className="mt-4 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={createNewConversation} disabled={creatingThread}>
                          {creatingThread ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          Contacter le support
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
