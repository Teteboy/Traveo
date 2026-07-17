import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Check, Loader2, Wallet, Smartphone, RadioIcon } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentData: any) => void
  amount: number
  currency: string
  bookingDetails: {
    from?: string
    to?: string
    date?: string
    airline?: string
    passengers?: number
    serviceName?: string
    serviceType?: string
  }
  isGuest?: boolean
}

type PaymentMethod = 'wallet' | 'mtn_momo' | 'orange_money' | 'card'

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
  currency,
  bookingDetails,
  isGuest = false
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isGuest ? 'mtn_momo' : 'wallet')
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  // Guests can only pay directly via Campay (no wallet)
  // Authenticated users pay with wallet (which is loaded via Campay separately)
  const paymentMethods = isGuest
    ? [
        { id: 'mtn_momo' as PaymentMethod, name: 'MTN Mobile Money', icon: Smartphone, description: 'Paiement mobile sécurisé' },
        { id: 'orange_money' as PaymentMethod, name: 'Orange Money', icon: Smartphone, description: 'Paiement mobile sécurisé' },
      ]
    : [
        { id: 'wallet' as PaymentMethod, name: 'Portefeuille Traveo', icon: Wallet, description: 'Paiement instantané depuis votre solde' },
      ]

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const paymentData = {
        method: paymentMethod,
        amount,
        currency,
        phoneNumber: (paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money') ? phoneNumber : undefined,
      }

      onPaymentComplete(paymentData)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = () => {
    if (paymentMethod === 'wallet') return true
    if (paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money') {
      return phoneNumber.length >= 9 && /^\d+$/.test(phoneNumber)
    }
    if (paymentMethod === 'card') return true // Card payment would have its own validation
    return false
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paiement de la réservation</DialogTitle>
          <DialogDescription>
            Confirmez votre paiement pour finaliser la réservation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                {bookingDetails.from && bookingDetails.to && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trajet:</span>
                    <span className="font-medium">{bookingDetails.from} → {bookingDetails.to}</span>
                  </div>
                )}
                {bookingDetails.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{bookingDetails.date}</span>
                  </div>
                )}
                {bookingDetails.airline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compagnie:</span>
                    <span>{bookingDetails.airline}</span>
                  </div>
                )}
                {bookingDetails.serviceName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{bookingDetails.serviceName}</span>
                  </div>
                )}
                {bookingDetails.passengers && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passagers:</span>
                    <span>{bookingDetails.passengers}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-[#44DBD4]">{formatPrice(amount, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Méthode de paiement</Label>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      paymentMethod === method.id
                        ? 'border-[#44DBD4] bg-[#44DBD4]/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${paymentMethod === method.id ? 'bg-[#44DBD4] text-white' : 'bg-gray-100'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      {paymentMethod === method.id && (
                        <RadioIcon className="h-5 w-5 text-[#44DBD4]" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile Money Phone Input */}
          {(paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money') && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+237 600 000 000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                Entrez votre numéro {paymentMethod === 'mtn_momo' ? 'MTN' : 'Orange'} Money pour recevoir le prompt de paiement USSD.
              </p>
            </div>
          )}

          {/* Wallet Info */}
          {paymentMethod === 'wallet' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Le paiement sera débité de votre portefeuille Traveo. Rechargez votre portefeuille via MTN MoMo ou Orange Money.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isProcessing}>
            Annuler
          </Button>
          <Button
            className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
            onClick={handlePayment}
            disabled={isProcessing || !isFormValid()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Payer {formatPrice(amount, currency)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}