import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'
import { LogIn, UserPlus } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showDialog?: boolean
  onAuthRequired?: () => void
}

export function AuthGuard({ children, showDialog = true, onAuthRequired }: AuthGuardProps) {
  const navigate = useNavigate()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleAuthClick = (action: 'login' | 'register') => {
    if (onAuthRequired) {
      onAuthRequired()
    } else if (showDialog) {
      setShowAuthDialog(false)
      navigate(action === 'login' ? '/login' : '/register')
    }
  }

  // For now, just render children - auth checking should be done at page level
  // This component can be enhanced later with actual auth state checking
  return (
    <>
      {children}
      {showDialog && (
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="bg-white border-slate-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#010A09]">Connexion requise</DialogTitle>
              <DialogDescription className="text-slate-500">
                Vous devez être connecté pour accéder à cette fonctionnalité.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                onClick={() => handleAuthClick('login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
                onClick={() => handleAuthClick('register')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}