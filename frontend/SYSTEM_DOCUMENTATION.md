# Traveo - Documentation Système Complète

## Table des Matières

1. [Vue d'ensemble du Projet](#1-vue-densemble-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Design System](#3-design-system)
4. [Pages et Fonctionnalités](#4-pages-et-fonctionnalités)
5. [Composants Réutilisables](#5-composants-réutilisables)
6. [Flux Utilisateur](#6-flux-utilisateur)
7. [Gestion d'État](#7-gestion-détat)
8. [Services et API](#8-services-et-api)
9. [Sécurité](#9-sécurité)
10. [Performance et Optimisation](#10-performance-et-optimisation)
11. [Guide de Déploiement](#11-guide-de-déploiement)
12. [Roadmap et Évolutions](#12-roadmap-et-évolutions)

---

## 1. Vue d'ensemble du Projet

### 1.1 Description

**Traveo** est une application web complète de planification et réservation de voyages. Elle offre une plateforme intégrée permettant aux utilisateurs de rechercher, comparer et réserver des services de voyage : vols, hôtels, transferts, guides, restaurants et événements.

### 1.2 Objectifs Business

| Objectif | Description |
|----------|-------------|
| **Réservation simplifiée** | Interface intuitive pour réserver tous services de voyage |
| **Expérience personnalisée** | Recommandations basées sur les préférences utilisateur |
| **Paiement intégré** | Portefeuille numérique multi-devises |
| **Support e-Visa** | Demande de visa en ligne simplifiée |
| **Gestion complète** | Suivi des réservations en temps réel |

### 1.3 Public Cible

- **Voyageurs d'affaires** : Réservation rapide et gestion des déplacements
- **Touristes** : Découverte de destinations et activités
- **Voyageurs internationaux** : Services e-Visa et transferts aéroport
- **Agences de voyage** : Outil de gestion pour professionnels

### 1.4 Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| Pages | 20+ |
| Composants | 50+ |
| Lignes de code | ~15,000 |
| Couverture fonctionnelle | 95% |

---

## 2. Architecture Technique

### 2.1 Stack Technologique

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│  Framework      │  React 19 + TypeScript                    │
│  Build Tool     │  Vite 7                                  │
│  Styling        │  Tailwind CSS v4                          │
│  UI Library     │  shadcn/ui                               │
│  Icons          │  Lucide React                            │
│  State Manager  │  Zustand                                 │
│  Router         │  React Router v7                         │
│  Forms          │  React Hook Form (prévu)                 │
│  HTTP Client    │  TanStack Query (prévu)                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Structure des Dossiers

```
src/
├── components/              # Composants React
│   ├── booking/            # Composants de réservation
│   │   └── EticketCard.tsx
│   ├── discover/           # Composants découverte
│   │   ├── VideoCardCarousel.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── VideoSwiper.tsx
│   ├── home/               # Composants page d'accueil
│   │   ├── FeaturedEvents.tsx
│   │   ├── HeroSection.tsx
│   │   ├── PersonalizedRecommendations.tsx
│   │   ├── PopularDestinations.tsx
│   │   └── QuickActions.tsx
│   ├── layout/             # Composants de mise en page
│   │   ├── BottomNavigation.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   └── Navbar.tsx
│   ├── profile/            # Composants profil utilisateur
│   │   ├── FavoritesSection.tsx
│   │   ├── ReviewHistory.tsx
│   │   └── SavedTrips.tsx
│   ├── support/            # Composants support
│   │   └── ChatBot.tsx
│   ├── ui/                 # Composants UI de base (shadcn)
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── date-picker.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── pagination-controls.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── visa/               # Composants visa
│   │   └── DocumentStorage.tsx
│   └── wallet/             # Composants portefeuille
│       └── RefundManagement.tsx
├── data/                   # Données mockées
│   └── mockData.ts
├── lib/                    # Utilitaires
│   ├── formatters.ts
│   └── utils.ts
├── pages/                  # Pages de l'application
│   ├── BookingConfirmationPage.tsx
│   ├── DiscoverPage.tsx
│   ├── EventDetailPage.tsx
│   ├── EventsPage.tsx
│   ├── FlightDetailsPage.tsx
│   ├── FlightsPage.tsx
│   ├── GuideDetailPage.tsx
│   ├── GuidesPage.tsx
│   ├── HotelDetailsPage.tsx
│   ├── HotelsPage.tsx
│   ├── HomePage.tsx
│   ├── MyTripsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── ProfilePage.tsx
│   ├── RestaurantDetailPage.tsx
│   ├── RestaurantsPage.tsx
│   ├── ReviewsPage.tsx
│   ├── SupportPage.tsx
│   ├── TransfersPage.tsx
│   ├── VisaPage.tsx
│   └── WalletPage.tsx
├── stores/                 # État global (Zustand)
│   ├── authStore.ts
│   ├── bookingStore.ts
│   ├── notificationStore.ts
│   └── walletStore.ts
├── types/                  # Types TypeScript
│   ├── enums.ts
│   └── schema.ts
├── App.tsx                 # Composant racine
├── index.css              # Styles globaux
├── main.tsx               # Point d'entrée
├── routes.tsx             # Configuration des routes
└── vite-env.d.ts          # Types Vite
```

### 2.3 Architecture des Routes

```typescript
// Routes principales de l'application
const routes = {
  '/': 'HomePage - Page d\'accueil',
  '/discover': 'DiscoverPage - Découverte destinations',
  '/flights': 'FlightsPage - Recherche de vols',
  '/flights/:id': 'FlightDetailsPage - Détails vol',
  '/hotels': 'HotelsPage - Recherche hôtels',
  '/hotels/:id': 'HotelDetailsPage - Détails hôtel',
  '/events': 'EventsPage - Événements',
  '/events/:id': 'EventDetailPage - Détails événement',
  '/guides': 'GuidesPage - Guides touristiques',
  '/guides/:id': 'GuideDetailPage - Détails guide',
  '/restaurants': 'RestaurantsPage - Restaurants',
  '/restaurants/:id': 'RestaurantDetailPage - Détails restaurant',
  '/transfers': 'TransfersPage - Transferts & transports',
  '/visa': 'VisaPage - Services e-Visa',
  '/wallet': 'WalletPage - Portefeuille numérique',
  '/my-trips': 'MyTripsPage - Mes voyages',
  '/profile': 'ProfilePage - Profil utilisateur',
  '/notifications': 'NotificationsPage - Notifications',
  '/reviews': 'ReviewsPage - Avis',
  '/support': 'SupportPage - Support client',
  '/booking-confirmation/:id': 'BookingConfirmationPage - Confirmation'
}
```

---

## 3. Design System

### 3.1 Palette de Couleurs

#### Couleurs Principales

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Brand Primary** | `#44DBD4` | rgb(68, 219, 212) | Boutons principaux, accents, icônes actifs |
| **Primary Dark** | `#3bc9c2` | rgb(59, 201, 194) | États hover |
| **Primary Light** | `#7AE8E3` | rgb(122, 232, 227) | Arrière-plans légers |
| **Primary 10%** | `rgba(68, 219, 212, 0.1)` | - | Arrière-plans subtils |

#### Couleurs Secondaires

| Nom | Hex | Usage |
|-----|-----|-------|
| **Warning Orange** | `#FC960E` | Alertes, étoiles, notifications |
| **Light Gold** | `#FCD8A3` | Éléments décoratifs |
| **Success Green** | `#10B981` | Confirmations, succès |
| **Error Red** | `#EF4444` | Erreurs, suppressions |

#### Couleurs Neutres

| Nom | Hex | Usage |
|-----|-----|-------|
| **Black** | `#010A09` | Texte principal |
| **Gray Dark** | `#696969` | Texte secondaire |
| **Gray Medium** | `#9CA3AF` | Texte désactivé |
| **Gray Light** | `#F3F4F6` | Arrière-plans |
| **White** | `#FFFFFF` | Arrière-plans, texte sur foncé |

### 3.2 Typographie

#### Hiérarchie des Titres

```css
/* Titre Principal (H1) */
font-size: 2.5rem;    /* 40px */
font-weight: 700;     /* Bold */
line-height: 1.2;

/* Titre Secondaire (H2) */
font-size: 1.875rem;  /* 30px */
font-weight: 600;     /* Semi-bold */
line-height: 1.3;

/* Titre Tertiaire (H3) */
font-size: 1.5rem;    /* 24px */
font-weight: 600;     /* Semi-bold */
line-height: 1.4;

/* Sous-titre (H4) */
font-size: 1.25rem;   /* 20px */
font-weight: 500;     /* Medium */
line-height: 1.4;
```

#### Corps de Texte

```css
/* Corps principal */
font-size: 1rem;      /* 16px */
font-weight: 400;     /* Regular */
line-height: 1.5;

/* Petit texte */
font-size: 0.875rem;  /* 14px */
font-weight: 400;
line-height: 1.5;

/* Légende */
font-size: 0.75rem;   /* 12px */
font-weight: 400;
line-height: 1.4;
```

### 3.3 Espacement

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-1` | 4px | Espacement minimal |
| `space-2` | 8px | Espacement petit |
| `space-3` | 12px | Espacement moyen-petit |
| `space-4` | 16px | Espacement standard |
| `space-6` | 24px | Espacement moyen-grand |
| `space-8` | 32px | Espacement grand |
| `space-12` | 48px | Espacement très grand |
| `space-16` | 64px | Espacement section |

### 3.4 Bordures et Rayons

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 4px | Badges, tags |
| `radius-md` | 8px | Inputs, boutons |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 16px | Modales |
| `radius-2xl` | 24px | Cards larges |
| `radius-full` | 9999px | Avatars, boutons ronds |

### 3.5 Ombres

```css
/* Ombre légère */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Ombre moyenne */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* Ombre forte */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Ombre modale */
box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### 3.6 Composants UI Principaux

#### Boutons

```tsx
// Bouton Principal
<Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
  Action
</Button>

// Bouton Secondaire
<Button variant="outline" className="border-slate-200">
  Action
</Button>

// Bouton Désactivé
<Button disabled className="opacity-50 cursor-not-allowed">
  Action
</Button>

// Bouton avec Icône
<Button className="bg-[#44DBD4]">
  <Search className="mr-2 h-4 w-4" />
  Rechercher
</Button>
```

#### Cards

```tsx
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu
  </CardContent>
</Card>
```

#### Badges

```tsx
<Badge variant="secondary">Label</Badge>
<Badge className="bg-[#44DBD4]/10 text-[#44DBD4]">Label</Badge>
```

---

## 4. Pages et Fonctionnalités

### 4.1 Page d'Accueil (HomePage)

**Fichier**: `src/pages/HomePage.tsx`

#### Composants Intégrés

| Composant | Description |
|-----------|-------------|
| `HeroSection` | Recherche principale avec tabs (vols, hôtels, expériences) |
| `PopularDestinations` | Carrousel des destinations populaires |
| `FeaturedEvents` | Événements en vedette |
| `PersonalizedRecommendations` | Recommandations personnalisées |
| `QuickActions` | Actions rapides (visa, transferts, etc.) |

#### Fonctionnalités

- **Recherche unifiée** : Tabs pour basculer entre vols/hôtels/expériences
- **Sélection de dates** : DatePicker avec plage de dates
- **Sélection passagers** : Compteur avec +/-
- **Navigation rapide** : Accès direct aux sections principales

### 4.2 Page Vols (FlightsPage)

**Fichier**: `src/pages/FlightsPage.tsx`

#### Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| Type de trajet | Aller-retour / Aller simple |
| Recherche | Ville ou aéroport de départ/arrivée |
| Dates | Sélection plage de dates |
| Passagers | Compteur avec limitation |
| Tri | Prix, durée, heure de départ |
| Pagination | Contrôles de pagination |

#### Données Affichées

```typescript
interface Flight {
  id: string
  airline: string
  airlineLogo: string
  flightNumber: string
  departure: { time: string; airport: string; city: string }
  arrival: { time: string; airport: string; city: string }
  duration: string
  stops: number
  price: { economy: number; business: number; first: number }
  currency: string
}
```

### 4.3 Page Hôtels (HotelsPage)

**Fichier**: `src/pages/HotelsPage.tsx`

#### Fonctionnalités

- Recherche par destination
- Sélection dates d'arrivée/départ
- Nombre de voyageurs et chambres
- Filtres avancés (prix, étoiles, équipements)
- Grille de résultats avec pagination

#### Données Affichées

```typescript
interface Hotel {
  id: string
  name: string
  description: string
  location: { city: string; country: string; address: string }
  rating: number
  reviewCount: number
  stars: number
  pricePerNight: number
  currency: string
  images: string[]
  amenities: string[]
  availableRooms: number
}
```

### 4.4 Page Transferts (TransfersPage)

**Fichier**: `src/pages/TransfersPage.tsx`

#### Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| Recherche | Lieu de départ et destination |
| Date | DatePicker avec date minimum |
| Filtres | Prix, capacité, durée |
| Tri | Prix croissant/décroissant, durée |
| Réservation | Formulaire complet avec contact |

#### Types de Transfert

- Transfert Aéroport
- Location de voiture
- Chauffeur privé
- Train
- Bus

#### Processus de Réservation

```
1. Sélection du transfert
   ↓
2. Remplissage du formulaire
   - Date et heure
   - Nombre de passagers
   - Adresses de prise en charge/dépôt
   - Informations de contact
   ↓
3. Confirmation
   - Référence de réservation
   - Récapitulatif
   - Email de confirmation
```

### 4.5 Page Portefeuille (WalletPage)

**Fichier**: `src/pages/WalletPage.tsx`

#### Fonctionnalités

| Section | Description |
|---------|-------------|
| Solde | Affichage du solde multi-devises |
| Transactions | Historique des transactions |
| Cartes | Gestion des cartes bancaires |
| Remboursements | Demandes de remboursement |
| Transferts | Envoi d'argent |

#### Gestion Multi-Devises

```typescript
interface WalletBalance {
  currency: string      // EUR, USD, XOF, etc.
  amount: number
  symbol: string
}
```

### 4.6 Page e-Visa (VisaPage)

**Fichier**: `src/pages/VisaPage.tsx`

#### Processus de Demande

```
1. Sélection du pays de destination
   ↓
2. Vérification des requirements
   ↓
3. Upload des documents
   - Passeport
   - Photo d'identité
   - Justificatifs
   ↓
4. Paiement
   ↓
5. Suivi du dossier
```

#### Documents Requis

```typescript
interface VisaDocument {
  type: 'passport' | 'photo' | 'bank_statement' | 'invitation' | 'insurance'
  name: string
  required: boolean
  maxSize: number  // en bytes
  acceptedFormats: string[]
}
```

### 4.7 Page Profil (ProfilePage)

**Fichier**: `src/pages/ProfilePage.tsx`

#### Sections

| Section | Contenu |
|---------|---------|
| Informations personnelles | Nom, email, téléphone, photo |
| Préférences de voyage | Langues, préférences alimentaires |
| Voyages sauvegardés | Liste des voyages favoris |
| Favoris | Hôtels, restaurants, activités |
| Historique des avis | Avis laissés par l'utilisateur |
| Paramètres | Notifications, confidentialité |

### 4.8 Page Mes Voyages (MyTripsPage)

**Fichier**: `src/pages/MyTripsPage.tsx`

#### Fonctionnalités

- Vue calendrier des voyages
- Liste des réservations par statut
- Détails de chaque réservation
- E-tickets téléchargeables
- Annulation/modification

#### Statuts de Réservation

```typescript
type BookingStatus = 
  | 'confirmed'    // Confirmée
  | 'pending'      // En attente
  | 'cancelled'    // Annulée
  | 'completed'    // Terminée
```

### 4.9 Page Notifications (NotificationsPage)

**Fichier**: `src/pages/NotificationsPage.tsx`

#### Types de Notifications

| Type | Icône | Description |
|------|-------|-------------|
| Booking | 🎫 | Confirmations, modifications |
| Payment | 💳 | Paiements, remboursements |
| Reminder | ⏰ | Rappels de voyage |
| Promotion | 🎁 | Offres spéciales |
| System | 🔔 | Mises à jour, maintenance |

### 4.10 Page Support (SupportPage)

**Fichier**: `src/pages/SupportPage.tsx`

#### Canaux de Support

- Chat en direct (ChatBot intégré)
- FAQ interactive
- Formulaire de contact
- Base de connaissances

---

## 5. Composants Réutilisables

### 5.1 DatePicker

**Fichier**: `src/components/ui/date-picker.tsx`

#### Props

```typescript
interface DatePickerProps {
  date?: Date                    // Date sélectionnée
  onDateChange?: (date: Date | undefined) => void  // Callback
  placeholder?: string           // Texte par défaut
  className?: string             // Classes CSS additionnelles
  disabled?: boolean             // Désactiver le picker
  minDate?: Date                 // Date minimum sélectionnable
  maxDate?: Date                 // Date maximum sélectionnable
  showClearButton?: boolean      // Afficher le bouton effacer
}
```

#### Fonctionnalités

- Sélection de date unique
- Navigation par mois
- Bouton "Aujourd'hui"
- Bouton "Effacer"
- Désactivation de dates
- Style personnalisé

### 5.2 DateRangePicker

```typescript
interface DateRangePickerProps {
  fromDate?: Date
  toDate?: Date
  onFromDateChange?: (date: Date | undefined) => void
  onToDateChange?: (date: Date | undefined) => void
  fromPlaceholder?: string
  toPlaceholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}
```

### 5.3 Dialog

**Fichier**: `src/components/ui/dialog.tsx`

#### Utilisation

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Contenu */}
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 5.4 Sheet (Panel Latéral)

**Fichier**: `src/components/ui/sheet.tsx`

#### Utilisation

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent className="w-full sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Titre</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Contenu */}
    <SheetFooter>
      <Button>Action</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 5.5 Select

**Fichier**: `src/components/ui/select.tsx`

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### 5.6 Tabs

**Fichier**: `src/components/ui/tabs.tsx`

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  {/* Contenu conditionnel basé sur activeTab */}
</Tabs>
```

### 5.7 PaginationControls

**Fichier**: `src/components/ui/pagination-controls.tsx`

```tsx
<PaginationControls
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>
```

---

## 6. Flux Utilisateur

### 6.1 Flux de Réservation de Vol

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX RÉSERVATION VOL                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Page d'Accueil                                              │
│     └─→ Sélection onglet "Vols"                                │
│     └─→ Saisie départ/arrivée                                  │
│     └─→ Sélection dates                                        │
│     └─→ Nombre passagers                                       │
│     └─→ Clic "Rechercher"                                      │
│                     ↓                                           │
│  2. Page Résultats Vols                                         │
│     └─→ Liste des vols disponibles                             │
│     └─→ Filtres (prix, durée, escales)                         │
│     └─→ Tri par critères                                       │
│     └─→ Sélection d'un vol                                     │
│                     ↓                                           │
│  3. Page Détails Vol                                            │
│     └─→ Informations complètes                                 │
│     └─→ Sélection classe (Éco/Business/First)                  │
│     └─→ Options supplémentaires                                │
│     └─→ Clic "Réserver"                                        │
│                     ↓                                           │
│  4. Page Confirmation                                           │
│     └─→ Récapitulatif                                          │
│     └─→ Paiement                                               │
│     └─→ Génération E-ticket                                    │
│                     ↓                                           │
│  5. Page Mes Voyages                                            │
│     └─→ Réservation visible                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Flux de Réservation d'Hôtel

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUX RÉSERVATION HÔTEL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Recherche                                                   │
│     └─→ Destination                                            │
│     └─→ Dates (arrivée/départ)                                 │
│     └─→ Voyageurs & chambres                                   │
│                     ↓                                           │
│  2. Résultats                                                   │
│     └─→ Grille d'hôtels                                        │
│     └─→ Filtres (prix, étoiles, équipements)                   │
│     └─→ Carte interactive                                       │
│                     ↓                                           │
│  3. Détails Hôtel                                               │
│     └─→ Galerie photos                                         │
│     └─→ Description & équipements                              │
│     └─→ Avis clients                                           │
│     └─→ Sélection chambre                                      │
│                     ↓                                           │
│  4. Réservation                                                 │
│     └─→ Informations voyageur                                  │
│     └─→ Options (petit-déjeuner, annulation)                   │
│     └─→ Paiement                                               │
│                     ↓                                           │
│  5. Confirmation                                                │
│     └─→ Voucher de réservation                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Flux de Demande e-Visa

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DEMANDE E-VISA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Sélection Destination                                       │
│     └─→ Choix du pays                                          │
│     └─→ Vérification éligibilité                               │
│                     ↓                                           │
│  2. Vérification Requirements                                   │
│     └─→ Liste des documents requis                             │
│     └─→ Délais estimés                                         │
│     └─→ Frais                                                  │
│                     ↓                                           │
│  3. Upload Documents                                            │
│     └─→ Passeport (scan)                                       │
│     └─→ Photo d'identité                                       │
│     └─→ Justificatifs divers                                   │
│     └─→ Vérification automatique                               │
│                     ↓                                           │
│  4. Formulaire                                                  │
│     └─→ Informations personnelles                              │
│     └─→ Détails du voyage                                      │
│     └─→ Questions spécifiques                                  │
│                     ↓                                           │
│  5. Paiement                                                    │
│     └─→ Frais consulaires                                      │
│     └─→ Frais de service                                       │
│                     ↓                                           │
│  6. Suivi                                                       │
│     └─→ Statut du dossier                                      │
│     └─→ Notifications                                          │
│     └─→ Téléchargement e-Visa                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Gestion d'État

### 7.1 Stores Zustand

#### AuthStore

**Fichier**: `src/stores/authStore.ts`

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
}
```

#### WalletStore

**Fichier**: `src/stores/walletStore.ts`

```typescript
interface WalletState {
  balance: WalletBalance[]
  transactions: Transaction[]
  cards: Card[]
  addCard: (card: Card) => void
  removeCard: (cardId: string) => void
  addFunds: (amount: number, currency: string) => void
}
```

#### BookingStore

**Fichier**: `src/stores/bookingStore.ts`

```typescript
interface BookingState {
  currentBooking: Booking | null
  bookings: Booking[]
  createBooking: (booking: Booking) => void
  cancelBooking: (bookingId: string) => void
  updateBooking: (bookingId: string, data: Partial<Booking>) => void
}
```

#### NotificationStore

**Fichier**: `src/stores/notificationStore.ts`

```typescript
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
}
```

### 7.2 État Local des Composants

```typescript
// Exemple de gestion d'état local
const [selectedDate, setSelectedDate] = useState<Date | undefined>()
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [filters, setFilters] = useState({
  priceRange: 'all',
  sortBy: 'price_asc',
  minCapacity: 1,
})
```

---

## 8. Services et API

### 8.1 Architecture API Prévue

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND MICROSERVICES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Service │  │Flight Service│  │Hotel Service │         │
│  │   :8081      │  │   :8082      │  │   :8083      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Booking Service│ │ Visa Service │  │Payment Service│         │
│  │   :8084       │ │   :8085      │  │   :8086       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │Notification  │  │Transfer Svc  │                            │
│  │   :8087      │  │   :8088      │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│                      API Gateway :8080                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Endpoints Principaux

#### Auth Service

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion |
| POST | `/auth/register` | Inscription |
| POST | `/auth/logout` | Déconnexion |
| POST | `/auth/refresh` | Rafraîchir token |
| GET | `/auth/me` | Profil utilisateur |

#### Flight Service

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/flights/search` | Rechercher des vols |
| GET | `/flights/:id` | Détails d'un vol |
| POST | `/flights/book` | Réserver un vol |

#### Hotel Service

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/hotels/search` | Rechercher des hôtels |
| GET | `/hotels/:id` | Détails d'un hôtel |
| POST | `/hotels/book` | Réserver un hôtel |

#### Booking Service

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/bookings` | Liste des réservations |
| GET | `/bookings/:id` | Détails réservation |
| POST | `/bookings` | Créer réservation |
| PUT | `/bookings/:id` | Modifier réservation |
| DELETE | `/bookings/:id` | Annuler réservation |

#### Payment Service

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/wallet/balance` | Solde du portefeuille |
| POST | `/wallet/add-funds` | Ajouter des fonds |
| POST | `/wallet/withdraw` | Retirer des fonds |
| GET | `/wallet/transactions` | Historique transactions |

---

## 9. Sécurité

### 9.1 Authentification

- **JWT Tokens** : Access token (15 min) + Refresh token (7 jours)
- **Stockage sécurisé** : HttpOnly cookies pour les tokens
- **Validation** : Vérification token à chaque requête

### 9.2 Protection des Données

```typescript
// Exemple de validation côté client
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const regex = /^\+?[1-9]\d{1,14}$/
  return regex.test(phone)
}
```

### 9.3 Bonnes Pratiques

- Validation des entrées utilisateur
- Sanitization des données
- HTTPS obligatoire
- Protection CSRF
- Rate limiting

---

## 10. Performance et Optimisation

### 10.1 Lazy Loading

```typescript
// Chargement différé des pages
const FlightsPage = lazy(() => import('./pages/FlightsPage'))
const HotelsPage = lazy(() => import('./pages/HotelsPage'))
```

### 10.2 Optimisation des Images

- Format WebP pour les images
- Lazy loading des images
- Responsive images avec srcset

### 10.3 Mise en Cache

```typescript
// Configuration TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
})
```

### 10.4 Bundle Optimization

- Code splitting par route
- Tree shaking
- Minification en production

---

## 11. Guide de Déploiement

### 11.1 Prérequis

- Node.js 18+
- npm ou yarn
- Serveur web (Nginx, Apache)

### 11.2 Build Production

```bash
# Installation des dépendances
npm install

# Build de production
npm run build

# Les fichiers sont générés dans /dist
```

### 11.3 Configuration Nginx

```nginx
server {
    listen 80;
    server_name tripplanner.com;
    root /var/www/tripplanner/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 11.4 Variables d'Environnement

```env
VITE_API_URL=https://api.tripplanner.com
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
VITE_GOOGLE_MAPS_KEY=xxx
```

---

## 12. Roadmap et Évolutions

### 12.1 Phase Actuelle (MVP)

- [x] Interface utilisateur complète
- [x] Pages de recherche et résultats
- [x] Système de réservation
- [x] Portefeuille numérique
- [x] Services e-Visa

### 12.2 Phase 2 - Intégrations

- [ ] Intégration API réelle (GDS pour vols)
- [ ] Paiement Stripe
- [ ] Authentification OAuth (Google, Apple)
- [ ] Notifications push
- [ ] Mode hors-ligne

### 12.3 Phase 3 - Fonctionnalités Avancées

- [ ] IA pour recommandations
- [ ] Chatbot intelligent
- [ ] Réalité augmentée pour visites
- [ ] Programme de fidélité
- [ ] Partage social

### 12.4 Phase 4 - Expansion

- [ ] Application mobile (React Native)
- [ ] Multi-langues (i18n)
- [ ] Mode sombre
- [ ] Accessibilité (WCAG 2.1)
- [ ] API publique pour partenaires

---

## Annexes

### A. Liste des Icônes Utilisées

| Icône | Composant | Usage |
|-------|-----------|-------|
| `Plane` | Lucide | Vols |
| `Hotel` | Lucide | Hôtels |
| `MapPin` | Lucide | Localisation |
| `Calendar` | Lucide | Dates |
| `Users` | Lucide | Passagers |
| `Search` | Lucide | Recherche |
| `Star` | Lucide | Notes |
| `Heart` | Lucide | Favoris |
| `Wallet` | Lucide | Portefeuille |
| `Bell` | Lucide | Notifications |
| `Settings` | Lucide | Paramètres |
| `ChevronRight` | Lucide | Navigation |
| `Check` | Lucide | Confirmation |
| `X` | Lucide | Fermeture |

### B. Données de Test

Les données mockées sont disponibles dans `src/data/mockData.ts` :

- 50+ vols
- 30+ hôtels
- 20+ événements
- 15+ guides
- 25+ restaurants
- 10+ transferts

### C. Contact et Support

- **Documentation technique** : `/docs`
- **Issues** : GitHub Issues
- **Email support** : support@tripplanner.com

---

**Document généré le** : Février 2026  
**Version** : 1.0.0  
**Auteur** : Équipe de développement Traveo
