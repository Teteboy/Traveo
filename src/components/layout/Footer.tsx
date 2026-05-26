import { Plane, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="hidden md:block bg-[#010A09] text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#44DBD4] rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Traveo</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Votre partenaire de voyage complet pour des aventures inoubliables.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/10 rounded-full text-gray-400 hover:bg-[#44DBD4] hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-full text-gray-400 hover:bg-[#44DBD4] hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-full text-gray-400 hover:bg-[#44DBD4] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-full text-gray-400 hover:bg-[#44DBD4] hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-[#44DBD4]">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Réservation de vols
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Hôtels
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  e-Visa
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Événements
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Guides locaux
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-[#44DBD4]">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/provider/login" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Espace Prestataire
                </a>
              </li>
              <li>
                <a href="/admin/login" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Administration
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Politique d'annulation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-[#44DBD4]">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#44DBD4] transition-colors">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 Traveo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
