# Traveo - Application Web de Réservation de Voyages

Application web complète de planification et réservation de voyages, adaptée de l'application mobile Flutter existante.

## 🎯 Fonctionnalités Principales

### Interface Utilisateur (Voyageurs)
- ✈️ **Recherche et réservation de vols** - Recherche aller simple et aller-retour
- 🏨 **Réservation d'hébergements** - Hôtels et logements
- 🎟️ **Événements premium** - Découverte et réservation d'événements
- 🛂 **Services e-Visa** - Demande de visa en ligne simplifié
- 💳 **Portefeuille multi-devises** - Gestion des paiements
- 🗺️ **Découverte de destinations** - Recommandations personnalisées
- 📊 **Tableau de bord des voyages** - Suivi des réservations

## 🛠️ Stack Technique

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand (à intégrer)
- **API Client**: TanStack Query (à intégrer)
- **Router**: React Router v7 (à intégrer)

## 📦 Installation

```bash
npm install
```

## 🚀 Démarrage

```bash
# Mode développement
npm run dev

# Build pour production
npm run build

# Prévisualisation de la build
npm run preview
```

L'application sera accessible sur `http://localhost:5173/`

## 📁 Structure du Projet

```
src/
├── components/
│   ├── home/           # Composants de la page d'accueil
│   │   ├── HeroSection.tsx
│   │   ├── PopularDestinations.tsx
│   │   ├── FeaturedEvents.tsx
│   │   └── QuickActions.tsx
│   ├── layout/         # Composants de mise en page
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/            # Composants UI réutilisables (shadcn)
├── types/             # Définitions TypeScript
│   ├── schema.ts      # Schémas de données
│   └── enums.ts       # Types énumérés
├── lib/               # Utilitaires
│   ├── utils.ts       # Fonctions utilitaires
│   └── formatters.ts  # Formatage de dates, prix, etc.
├── data/              # Données mockées
│   └── mockData.ts    # Données de test
├── App.tsx            # Composant racine
└── main.tsx          # Point d'entrée
```

## 🎨 Design System

### Couleurs Principales (extraites de l'application mobile)
- **Primary (Brand Teal)**: `#44DBD4` - Couleur principale de la marque (teal/cyan)
- **Primary Dark**: `#35B5AE` - État hover
- **Primary Light**: `#7AE8E3` - Variante claire
- **Warning Orange**: `#FC960E` - Alertes et étoiles
- **Light Gold**: `#FCD8A3` - Couleur secondaire
- **Success Green**: `#10B981` - Confirmations et succès
- **Gray**: `#696969` - Texte secondaire
- **Black**: `#010A09` - Texte principal

### Palette de Couleurs Complète
| Nom | Hex | Usage |
|-----|-----|-------|
| Brand Primary | `#44DBD4` | Boutons, icônes actifs, accents |
| Brand Orange | `#FC960E` | Alertes, étoiles, notifications |
| Brand Gold | `#FCD8A3` | Éléments décoratifs |
| Brand Green | `#10B981` | Succès, confirmations |
| Brand Gray | `#696969` | Texte secondaire, icônes inactifs |
| Brand Black | `#010A09` | Texte principal |

### Typographie
- Police principale: System font stack (Inter-like)
- Titres: 24-32px Bold
- Corps: 14-16px Regular
- Légendes: 12-14px

## 🔄 Prochaines Étapes

### Phase 1 - Pages Essentielles
- [ ] Page de recherche de vols avec filtres
- [ ] Page de résultats de vols
- [ ] Page de détails et réservation de vol
- [ ] Page "Mes Voyages" (tableau de bord utilisateur)
- [ ] Page de demande e-Visa

### Phase 2 - Fonctionnalités Avancées
- [ ] Intégration de l'authentification (JWT)
- [ ] Gestion d'état avec Zustand
- [ ] Appels API avec TanStack Query
- [ ] Routing avec React Router v7
- [ ] Portefeuille et paiements (Stripe)

### Phase 3 - Optimisations
- [ ] Responsive design complet
- [ ] Internationalisation (i18n)
- [ ] Optimisation des performances
- [ ] Tests unitaires et E2E
- [ ] Mode sombre

## 🔗 Backend API

Le backend Spring Boot (microservices) devra exposer les endpoints suivants:

### Services Principaux
1. **Auth Service** - Authentification et gestion des utilisateurs
2. **Flight Service** - Intégration GDS et gestion des vols
3. **Booking Service** - Réservations (hôtels, guides, events, transfers)
4. **Visa Service** - Gestion des demandes e-visa
5. **Payment Service** - Paiements et portefeuille
6. **Notification Service** - Emails et notifications

## 📝 Conventions de Code

- Utiliser TypeScript strict
- Composants fonctionnels avec hooks
- Props typés pour tous les composants
- Formatage automatique avec Prettier (à configurer)
- Linting avec ESLint (à configurer)

## 🌍 Langues

Interface en français par défaut, avec support multilingue prévu.

## 📄 License

Propriétaire - Tous droits réservés

---

**Développé avec ❤️ pour les voyageurs du monde entier**
