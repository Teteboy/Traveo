import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface HelpTooltipProps {
  content: string
  title?: string
  detailedHelp?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function HelpTooltip({ content, title, detailedHelp }: HelpTooltipProps) {
  const [showDetailedHelp, setShowDetailedHelp] = useState(false)

  return (
    <>
      <div className="group relative inline-flex items-center">
        <button
          type="button"
          className="text-slate-400 hover:text-primary transition-colors"
          onClick={() => detailedHelp && setShowDetailedHelp(true)}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
            {content}
            {detailedHelp && (
              <div className="mt-1 pt-1 border-t border-slate-700 text-slate-300">
                Cliquez pour plus de détails
              </div>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      </div>

      {/* Detailed Help Dialog */}
      {detailedHelp && (
        <Dialog open={showDetailedHelp} onOpenChange={setShowDetailedHelp}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                {title || 'Aide'}
              </DialogTitle>
              <DialogDescription className="text-left pt-2">
                {detailedHelp}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowDetailedHelp(false)}>
                Compris
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// Info Banner Component for section headers
interface InfoBannerProps {
  title: string
  description: string
  icon?: React.ReactNode
  onDismiss?: () => void
}

export function InfoBanner({ title, description, icon, onDismiss }: InfoBannerProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        {icon && <div className="text-blue-600 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-medium text-blue-900">{title}</h4>
          <p className="text-sm text-blue-700 mt-1">{description}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-blue-400 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Guided Action Component
interface GuidedActionProps {
  label: string
  description: string
  consequence: string
  children: React.ReactNode
}

export function GuidedAction({ label, description, consequence, children }: GuidedActionProps) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="relative">
      <div onClick={() => setShowGuide(true)}>
        {children}
      </div>
      
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>{description}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Ce qui va se passer :</strong>
                  <br />
                  {consequence}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowGuide(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowGuide(false)}>
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Status Badge with Explanation
interface StatusExplanationProps {
  status: 'success' | 'warning' | 'error' | 'info'
  label: string
  explanation: string
}

export function StatusExplanation({ status, label, explanation }: StatusExplanationProps) {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm ${colors[status]}`}>
      {label}
      <HelpTooltip content={explanation} />
    </div>
  )
}
