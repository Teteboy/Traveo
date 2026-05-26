import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Search, Send, Phone, Mail, HelpCircle, Book, FileText, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCurrentUser } from '@/hooks/useAuth'
import { apiClient } from '@/lib/apiClient'

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  message: string
  timestamp: string
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

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
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat en direct
              </CardTitle>
            </CardHeader>
            <Separator />
            
            {/* Messages */}
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
            
            {/* Input */}
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
          </Card>
        </div>
      </div>
    </div>
  )
}
