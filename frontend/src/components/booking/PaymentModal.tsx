import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Using simple HTML radio inputs
import { Separator } from '@/components/ui/separator'
import { Check, Loader2, Wallet } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentData: any) => void
  amount: number
  currency: string
  bookingDetails: {
    from: string
    to: string
    date: string
    airline: string
    passengers: number
  }
}

type PaymentMethod = 'wallet'

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
  currency,
  bookingDetails
}: PaymentModalProps) {
  const [paymentMethod] = useState<PaymentMethod>('wallet')
  const [isProcessing, setIsProcessing] = useState(false)

  // No additional fields needed for balance payments

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const paymentData = {
        method: paymentMethod,
        amount,
        currency,
      }

      onPaymentComplete(paymentData)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = () => {
    // Balance payments are always valid (assume sufficient balance)
    return true
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vol:</span>
                  <span className="font-medium">{bookingDetails.from} → {bookingDetails.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compagnie:</span>
                  <span>{bookingDetails.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passagers:</span>
                  <span>{bookingDetails.passengers}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-[#44DBD4]">{formatPrice(amount, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Méthode de paiement</Label>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-[#44DBD4]" />
                <div>
                  <div className="font-medium">Portefeuille Duffel</div>
                  <div className="text-sm text-muted-foreground">Paiement sécurisé et instantané</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Le paiement sera traité via votre solde et le flux Duffel côté serveur.
            </p>
          </div>
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