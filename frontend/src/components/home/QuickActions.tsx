import { useNavigate } from 'react-router-dom'
import { Plane, FileText, Wallet, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const actions = [
  {
    icon: Plane,
    title: 'Réserver un vol',
    description: 'Trouvez les meilleurs tarifs',
    color: 'bg-[#44DBD4]/10 text-[#44DBD4]',
    borderColor: 'hover:border-[#44DBD4]',
    path: '/flights'
  },
  {
    icon: FileText,
    title: 'Demander un e-Visa',
    description: 'Processus simplifié en ligne',
    color: 'bg-green-100 text-green-600',
    borderColor: 'hover:border-green-400',
    path: '/visa'
  },
  {
    icon: Wallet,
    title: 'Gérer mon portefeuille',
    description: 'Multi-devises disponible',
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'hover:border-purple-400',
    path: '/wallet'
  },
  {
    icon: Calendar,
    title: 'Mes voyages',
    description: 'Suivez vos réservations',
    color: 'bg-[#FC960E]/10 text-[#FC960E]',
    borderColor: 'hover:border-[#FC960E]',
    path: '/my-trips'
  }
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-[#010A09]">Services Rapides</h2>
          <p className="text-slate-500">
            Accédez rapidement à nos services principaux
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, index) => (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent ${action.borderColor} bg-white`}
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-4 rounded-2xl ${action.color} mb-4`}>
                  <action.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-[#010A09]">{action.title}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {action.description}
                </p>
                <div className="flex items-center justify-center gap-1 text-sm font-medium text-[#44DBD4]">
                  <span>Accéder</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
