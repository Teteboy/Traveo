import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useAuth'
import { apiClient } from '@/lib/apiClient'

type ChatResponse = {
  data?: {
    response?: string
  }
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface QuickAction {
  label: string
  action: string
}

const quickActions: QuickAction[] = [
  { label: 'Statut de ma réservation', action: 'booking_status' },
  { label: 'Mon solde portefeuille', action: 'wallet_balance' },
  { label: 'Annuler une réservation', action: 'cancel_booking' },
  { label: 'Demander un remboursement', action: 'refund' },
  { label: 'Contacter un agent', action: 'contact_agent' },
]

const botResponses: Record<string, string> = {
  booking_status: "Je vérifie le statut de vos réservations...",
  wallet_balance: "Je consulte votre solde portefeuille...",
  cancel_booking: "Pour annuler une réservation, allez dans 'Mes Voyages', sélectionnez la réservation concernée et cliquez sur 'Annuler'. Les conditions d'annulation varient selon le type de réservation.",
  refund: "Les demandes de remboursement sont traitées sous 5-7 jours ouvrables. Pour initier une demande, rendez-vous dans votre portefeuille > Historique > Sélectionner la transaction.",
  contact_agent: "Un agent sera disponible sous peu. Nos horaires de service sont de 9h à 18h (GMT+1) du lundi au vendredi. Voulez-vous que je vous rappelle?",
  default: "Je suis là pour vous aider ! Posez-moi vos questions sur les réservations, vols, hôtels, visas ou tout autre service. Je ferai de mon mieux pour vous assister.",
  greeting: "Bonjour ! Je suis l'assistant virtuel Traveo. Comment puis-je vous aider aujourd'hui ?",
  thanks: "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous ?",
  flight: "Pour les vols, je peux vous aider avec: réservation, modification, annulation, enregistrement en ligne, et informations sur les bagages. Que souhaitez-vous savoir?",
  hotel: "Pour les hôtels, je peux vous aider avec: réservation, modification de dates, demandes spéciales, et annulation. Que souhaitez-vous faire?",
  visa: "Pour les visas, je peux vous aider à vérifier l'éligibilité, suivre votre demande, et comprendre les documents requis. Pour quel pays souhaitez-vous des informations?",
  payment: "Pour les paiements, j'accepte les cartes bancaires, PayPal, et le solde de votre portefeuille Traveo. Les transactions sont sécurisées et cryptées.",
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: botResponses.greeting,
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useCurrentUser()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = async (userMessage: string): Promise<string> => {
    // Use AI-powered chat API for all responses
    try {
      const response = await apiClient.post<ChatResponse>('/chat/message', {
        message: userMessage,
        context: {
          userAuthenticated: !!user,
          userName: user ? `${user.firstName} ${user.lastName}` : null,
          currentPage: 'chatbot',
          source: 'floating_chat'
        }
      })
      return response.data?.response ?? botResponses.default
    } catch (error) {
      console.error('Chat API error:', error)
      // Fallback to basic responses if AI fails
      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
        return botResponses.greeting
      }
      if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
        return botResponses.thanks
      }

      return "Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter le support."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Get bot response (may involve API calls)
      const botResponseText = await getBotResponse(userMessage.text)

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error getting bot response:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    const actionLabel = quickActions.find(q => q.action === action)?.label || ''

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: actionLabel,
        sender: 'user',
        timestamp: new Date()
      }
    ])
    setIsTyping(true)

    try {
      let response: string

      // Handle actions that need API calls
      if (action === 'booking_status') {
        response = await getBotResponse('statut réservation')
      } else {
        response = botResponses[action] || botResponses.default
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    } catch (error) {
      console.error('Error handling quick action:', error)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#44DBD4] text-white shadow-lg hover:bg-[#3bc9c2] transition-all hover:scale-105 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FC960E] rounded-full text-[10px] flex items-center justify-center text-white">
          1
        </span>
      </button>
    )
  }

  return (
    <Card className={cn(
      "fixed z-50 shadow-2xl transition-all duration-300",
      isMinimized 
        ? "bottom-6 right-6 w-72 h-14" 
        : "bottom-6 right-6 w-96 h-[500px]"
    )}>
      {isMinimized ? (
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-[#44DBD4] text-white rounded-lg"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-medium">Assistant Traveo</span>
          </div>
          <Maximize2 className="h-4 w-4" />
        </div>
      ) : (
        <>
          <CardHeader className="bg-[#44DBD4] text-white py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base">Assistant Traveo</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-[#3bc9c2]"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-[#3bc9c2]"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[400px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#44DBD4] text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.sender === 'user'
                        ? "bg-[#44DBD4] text-white"
                        : "bg-gray-100"
                    )}
                  >
                    {message.text}
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#44DBD4] text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Actions rapides:</p>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Tapez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
