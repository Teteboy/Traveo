import type { Destination, Flight, Event, Hotel, Guide, Restaurant } from '@/types/schema'

// Video Content for Discovery Feed
export interface VideoContent {
  id: string
  title: string
  description: string
  location: string
  country: string
  views: number
  likes: number
  comments: number
  videoUrl: string
  thumbnail: string
  category: string
  creator: {
    name: string
    avatar: string
  }
}

export const mockVideos: VideoContent[] = [
  {
    id: 'VID001',
    title: 'Découvrez la magie de Paris',
    description: 'Une balade inoubliable à travers les rues de Paris, de la Tour Eiffel aux Champs-Élysées',
    location: 'Paris',
    country: 'France',
    views: 1250000,
    likes: 85000,
    comments: 12400,
    videoUrl: 'https://picsum.photos/400/600?random=10',
    thumbnail: 'https://picsum.photos/400/600?random=10',
    category: 'Ville',
    creator: {
      name: 'Marie Durand',
      avatar: 'https://i.pravatar.cc/150?u=marie'
    }
  },
  {
    id: 'VID002',
    title: 'Les plages paradisiaques de Zanzibar',
    description: 'Eau turquoise, sable blanc et cocotiers - bienvenue au paradis',
    location: 'Zanzibar',
    country: 'Tanzanie',
    views: 980000,
    likes: 62000,
    comments: 8900,
    videoUrl: 'https://picsum.photos/400/600?random=11',
    thumbnail: 'https://picsum.photos/400/600?random=11',
    category: 'Plage',
    creator: {
      name: 'Ahmed Hassan',
      avatar: 'https://i.pravatar.cc/150?u=ahmed'
    }
  },
  {
    id: 'VID003',
    title: 'Safari dans le Serengeti',
    description: 'Rencontre avec les Big Five dans la savane tanzanienne',
    location: 'Serengeti',
    country: 'Tanzanie',
    views: 2100000,
    likes: 150000,
    comments: 23500,
    videoUrl: 'https://picsum.photos/400/600?random=12',
    thumbnail: 'https://picsum.photos/400/600?random=12',
    category: 'Nature',
    creator: {
      name: 'John Safari',
      avatar: 'https://i.pravatar.cc/150?u=john'
    }
  },
  {
    id: 'VID004',
    title: 'Visite guidée de Marrakech',
    description: 'Explorez les souks colorés et les palais somptueux de la ville rouge',
    location: 'Marrakech',
    country: 'Maroc',
    views: 870000,
    likes: 54000,
    comments: 7200,
    videoUrl: 'https://picsum.photos/400/600?random=13',
    thumbnail: 'https://picsum.photos/400/600?random=13',
    category: 'Culture',
    creator: {
      name: 'Fatima El Amrani',
      avatar: 'https://i.pravatar.cc/150?u=fatima'
    }
  },
  {
    id: 'VID005',
    title: 'Tokyo de nuit',
    description: 'Néons, gratte-ciels et l\'énergie nocturne de la capitale japonaise',
    location: 'Tokyo',
    country: 'Japon',
    views: 1450000,
    likes: 98000,
    comments: 15600,
    videoUrl: 'https://picsum.photos/400/600?random=14',
    thumbnail: 'https://picsum.photos/400/600?random=14',
    category: 'Ville',
    creator: {
      name: 'Yuki Tanaka',
      avatar: 'https://i.pravatar.cc/150?u=yuki'
    }
  },
  {
    id: 'VID006',
    title: 'Gastronomie italienne à Rome',
    description: 'Découvrez les meilleurs restaurants et trattorias de la ville éternelle',
    location: 'Rome',
    country: 'Italie',
    views: 760000,
    likes: 48000,
    comments: 6700,
    videoUrl: 'https://picsum.photos/400/600?random=15',
    thumbnail: 'https://picsum.photos/400/600?random=15',
    category: 'Gastronomie',
    creator: {
      name: 'Marco Rossi',
      avatar: 'https://i.pravatar.cc/150?u=marco'
    }
  },
  {
    id: 'VID007',
    title: 'Aventure dans les Alpes suisses',
    description: 'Randonnée, ski et paysages à couper le souffle',
    location: 'Alpes',
    country: 'Suisse',
    views: 920000,
    likes: 67000,
    comments: 9800,
    videoUrl: 'https://picsum.photos/400/600?random=16',
    thumbnail: 'https://picsum.photos/400/600?random=16',
    category: 'Aventure',
    creator: {
      name: 'Hans Mueller',
      avatar: 'https://i.pravatar.cc/150?u=hans'
    }
  },
  {
    id: 'VID008',
    title: 'Temples anciens de Bali',
    description: 'Spiritualité et architecture dans les temples balinais',
    location: 'Bali',
    country: 'Indonésie',
    views: 1100000,
    likes: 79000,
    comments: 11200,
    videoUrl: 'https://picsum.photos/400/600?random=17',
    thumbnail: 'https://picsum.photos/400/600?random=17',
    category: 'Culture',
    creator: {
      name: 'Wayan Putra',
      avatar: 'https://i.pravatar.cc/150?u=wayan'
    }
  },
  {
    id: 'VID009',
    title: 'Aurores boréales en Islande',
    description: 'Le spectacle magique des lumières du nord',
    location: 'Reykjavik',
    country: 'Islande',
    views: 1680000,
    likes: 124000,
    comments: 18900,
    videoUrl: 'https://picsum.photos/400/600?random=18',
    thumbnail: 'https://picsum.photos/400/600?random=18',
    category: 'Nature',
    creator: {
      name: 'Bjork Sigurdsson',
      avatar: 'https://i.pravatar.cc/150?u=bjork'
    }
  },
  {
    id: 'VID010',
    title: 'Carnaval de Rio',
    description: 'Sambas, couleurs et l\'énergie incroyable du carnaval brésilien',
    location: 'Rio de Janeiro',
    country: 'Brésil',
    views: 1340000,
    likes: 91000,
    comments: 14300,
    videoUrl: 'https://picsum.photos/400/600?random=19',
    thumbnail: 'https://picsum.photos/400/600?random=19',
    category: 'Festival',
    creator: {
      name: 'Carolina Santos',
      avatar: 'https://i.pravatar.cc/150?u=carolina'
    }
  }
]

// Comprehensive Destinations Data
export const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    description: 'La ville lumière avec la Tour Eiffel, le Louvre et ses magnifiques boulevards',
    rating: 4.8,
    reviewCount: 12450,
    popularityScore: 95
  },
  {
    id: '2',
    name: 'Marrakech',
    country: 'Maroc',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    description: 'Ville impériale aux souks colorés et palais somptueux',
    rating: 4.6,
    reviewCount: 8930,
    popularityScore: 88
  },
  {
    id: '3',
    name: 'Dakar',
    country: 'Sénégal',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    description: 'Capitale vibrante de l\'Afrique de l\'Ouest, plages et culture',
    rating: 4.5,
    reviewCount: 5620,
    popularityScore: 82
  },
  {
    id: '4',
    name: 'Dubai',
    country: 'Émirats Arabes Unis',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    description: 'Ville moderne aux gratte-ciels impressionnants et luxe inégalé',
    rating: 4.7,
    reviewCount: 15200,
    popularityScore: 92
  },
  {
    id: '5',
    name: 'Istanbul',
    country: 'Turquie',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    description: 'Pont entre l\'Europe et l\'Asie, riche en histoire et culture',
    rating: 4.6,
    reviewCount: 9840,
    popularityScore: 87
  },
  {
    id: '6',
    name: 'Le Caire',
    country: 'Égypte',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    description: 'Pyramides anciennes et trésors pharaoniques',
    rating: 4.4,
    reviewCount: 7650,
    popularityScore: 84
  },
  {
    id: '7',
    name: 'Barcelone',
    country: 'Espagne',
    imageUrl: 'https://picsum.photos/400/300?random=7',
    description: 'Architecture de Gaudí, plages méditerranéennes et tapas',
    rating: 4.7,
    reviewCount: 11200,
    popularityScore: 90
  },
  {
    id: '8',
    name: 'Lisbonne',
    country: 'Portugal',
    imageUrl: 'https://picsum.photos/400/300?random=8',
    description: 'Collines pittoresques, tramways vintage et Fado',
    rating: 4.6,
    reviewCount: 6890,
    popularityScore: 85
  },
  {
    id: '9',
    name: 'Rome',
    country: 'Italie',
    imageUrl: 'https://picsum.photos/400/300?random=9',
    description: 'Capitale éternelle, Colisée et patrimoine antique',
    rating: 4.8,
    reviewCount: 13560,
    popularityScore: 93
  },
  {
    id: '10',
    name: 'Londres',
    country: 'Royaume-Uni',
    imageUrl: 'https://picsum.photos/400/300?random=10',
    description: 'Histoire royale, musées de renommée mondiale',
    rating: 4.7,
    reviewCount: 14230,
    popularityScore: 91
  },
  {
    id: '11',
    name: 'New York',
    country: 'États-Unis',
    imageUrl: 'https://picsum.photos/400/300?random=11',
    description: 'La ville qui ne dort jamais, gratte-ciels emblématiques',
    rating: 4.8,
    reviewCount: 18900,
    popularityScore: 96
  },
  {
    id: '12',
    name: 'Tokyo',
    country: 'Japon',
    imageUrl: 'https://picsum.photos/400/300?random=12',
    description: 'Modernité et tradition, temples et néons',
    rating: 4.9,
    reviewCount: 16450,
    popularityScore: 94
  },
  {
    id: '13',
    name: 'Bali',
    country: 'Indonésie',
    imageUrl: 'https://picsum.photos/400/300?random=13',
    description: 'Île paradisiaque, temples hindous et rizières',
    rating: 4.7,
    reviewCount: 10230,
    popularityScore: 89
  },
  {
    id: '14',
    name: 'Zanzibar',
    country: 'Tanzanie',
    imageUrl: 'https://picsum.photos/400/300?random=14',
    description: 'Plages de sable blanc et eaux turquoise',
    rating: 4.6,
    reviewCount: 4560,
    popularityScore: 83
  },
  {
    id: '15',
    name: 'Abidjan',
    country: 'Côte d\'Ivoire',
    imageUrl: 'https://picsum.photos/400/300?random=15',
    description: 'Perle des lagunes, capitale économique dynamique',
    rating: 4.3,
    reviewCount: 3450,
    popularityScore: 78
  }
]

// Comprehensive Flights Data
export const mockFlights: Flight[] = [
  {
    id: 'FL001',
    airline: 'Air France',
    airlineLogo: 'https://picsum.photos/80/40?random=10',
    flightNumber: 'AF 1234',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '10:30',
      date: '2024-03-15'
    },
    arrival: {
      airport: 'Dakar Blaise Diagne',
      code: 'DSS',
      time: '15:45',
      date: '2024-03-15'
    },
    duration: '5h 15min',
    price: {
      economy: 450,
      business: 1200
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 24
  },
  {
    id: 'FL002',
    airline: 'Emirates',
    airlineLogo: 'https://picsum.photos/80/40?random=11',
    flightNumber: 'EK 5678',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '14:00',
      date: '2024-03-15'
    },
    arrival: {
      airport: 'Dubai International',
      code: 'DXB',
      time: '23:30',
      date: '2024-03-15'
    },
    duration: '6h 30min',
    price: {
      economy: 520,
      business: 1850
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 18
  },
  {
    id: 'FL003',
    airline: 'Turkish Airlines',
    airlineLogo: 'https://picsum.photos/80/40?random=12',
    flightNumber: 'TK 1830',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '08:15',
      date: '2024-03-16'
    },
    arrival: {
      airport: 'Istanbul Airport',
      code: 'IST',
      time: '13:45',
      date: '2024-03-16'
    },
    duration: '3h 30min',
    price: {
      economy: 280,
      business: 890
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 32
  },
  {
    id: 'FL004',
    airline: 'EgyptAir',
    airlineLogo: 'https://picsum.photos/80/40?random=13',
    flightNumber: 'MS 777',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '11:20',
      date: '2024-03-17'
    },
    arrival: {
      airport: 'Le Caire International',
      code: 'CAI',
      time: '16:30',
      date: '2024-03-17'
    },
    duration: '4h 10min',
    price: {
      economy: 390,
      business: 1100
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 28
  },
  {
    id: 'FL005',
    airline: 'Iberia',
    airlineLogo: 'https://picsum.photos/80/40?random=14',
    flightNumber: 'IB 3421',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '07:45',
      date: '2024-03-18'
    },
    arrival: {
      airport: 'Barcelona El Prat',
      code: 'BCN',
      time: '09:35',
      date: '2024-03-18'
    },
    duration: '1h 50min',
    price: {
      economy: 120,
      business: 450
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 45
  },
  {
    id: 'FL006',
    airline: 'TAP Air Portugal',
    airlineLogo: 'https://picsum.photos/80/40?random=15',
    flightNumber: 'TP 442',
    departure: {
      airport: 'Paris Orly',
      code: 'ORY',
      time: '12:30',
      date: '2024-03-19'
    },
    arrival: {
      airport: 'Lisbonne Portela',
      code: 'LIS',
      time: '13:45',
      date: '2024-03-19'
    },
    duration: '2h 15min',
    price: {
      economy: 145,
      business: 520
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 38
  },
  {
    id: 'FL007',
    airline: 'Royal Air Maroc',
    airlineLogo: 'https://picsum.photos/80/40?random=16',
    flightNumber: 'AT 765',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '09:00',
      date: '2024-03-20'
    },
    arrival: {
      airport: 'Marrakech Menara',
      code: 'RAK',
      time: '11:30',
      date: '2024-03-20'
    },
    duration: '3h 30min',
    price: {
      economy: 190,
      business: 680
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 26
  },
  {
    id: 'FL008',
    airline: 'Alitalia',
    airlineLogo: 'https://picsum.photos/80/40?random=17',
    flightNumber: 'AZ 312',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '13:15',
      date: '2024-03-21'
    },
    arrival: {
      airport: 'Rome Fiumicino',
      code: 'FCO',
      time: '15:30',
      date: '2024-03-21'
    },
    duration: '2h 15min',
    price: {
      economy: 165,
      business: 590
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 34
  },
  {
    id: 'FL009',
    airline: 'British Airways',
    airlineLogo: 'https://picsum.photos/80/40?random=18',
    flightNumber: 'BA 305',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '06:30',
      date: '2024-03-22'
    },
    arrival: {
      airport: 'Londres Heathrow',
      code: 'LHR',
      time: '06:50',
      date: '2024-03-22'
    },
    duration: '1h 20min',
    price: {
      economy: 110,
      business: 420
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 42
  },
  {
    id: 'FL010',
    airline: 'Air France',
    airlineLogo: 'https://picsum.photos/80/40?random=19',
    flightNumber: 'AF 022',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '22:30',
      date: '2024-03-23'
    },
    arrival: {
      airport: 'New York JFK',
      code: 'JFK',
      time: '01:15',
      date: '2024-03-24'
    },
    duration: '8h 45min',
    price: {
      economy: 680,
      business: 3200
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 15
  },
  {
    id: 'FL011',
    airline: 'Air France',
    airlineLogo: 'https://picsum.photos/80/40?random=20',
    flightNumber: 'AF 276',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '11:00',
      date: '2024-03-25'
    },
    arrival: {
      airport: 'Tokyo Narita',
      code: 'NRT',
      time: '06:45',
      date: '2024-03-26'
    },
    duration: '12h 45min',
    price: {
      economy: 890,
      business: 4500
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 12
  },
  {
    id: 'FL012',
    airline: 'Air France',
    airlineLogo: 'https://picsum.photos/80/40?random=21',
    flightNumber: 'AF 1560',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '16:45',
      date: '2024-03-26'
    },
    arrival: {
      airport: 'Abidjan Felix Houphouet',
      code: 'ABJ',
      time: '22:30',
      date: '2024-03-26'
    },
    duration: '6h 45min',
    price: {
      economy: 520,
      business: 1650
    },
    currency: 'XAF',
    stops: 0,
    availableSeats: 22
  },
  {
    id: 'FL013',
    airline: 'Kenya Airways',
    airlineLogo: 'https://picsum.photos/80/40?random=22',
    flightNumber: 'KQ 520',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '20:15',
      date: '2024-03-27'
    },
    arrival: {
      airport: 'Zanzibar Abeid Amani',
      code: 'ZNZ',
      time: '07:30',
      date: '2024-03-28'
    },
    duration: '9h 15min',
    price: {
      economy: 750,
      business: 2400
    },
    currency: 'XAF',
    stops: 1,
    availableSeats: 18
  },
  {
    id: 'FL014',
    airline: 'Garuda Indonesia',
    airlineLogo: 'https://picsum.photos/80/40?random=23',
    flightNumber: 'GA 9714',
    departure: {
      airport: 'Paris Charles de Gaulle',
      code: 'CDG',
      time: '18:20',
      date: '2024-03-28'
    },
    arrival: {
      airport: 'Bali Ngurah Rai',
      code: 'DPS',
      time: '21:40',
      date: '2024-03-29'
    },
    duration: '16h 20min',
    price: {
      economy: 920,
      business: 4200
    },
    currency: 'XAF',
    stops: 1,
    availableSeats: 14
  },
  {
    id: 'FL015',
    airline: 'Ethiopian Airlines',
    airlineLogo: 'https://picsum.photos/80/40?random=24',
    flightNumber: 'ET 714',
    departure: {
      airport: 'Dakar Blaise Diagne',
      code: 'DSS',
      time: '23:55',
      date: '2024-03-29'
    },
    arrival: {
      airport: 'Abidjan Felix Houphouet',
      code: 'ABJ',
      time: '03:25',
      date: '2024-03-30'
    },
    duration: '2h 30min',
    price: {
      economy: 180,
      business: 520
    },
    currency: 'XAF',
    stops: 1,
    availableSeats: 30
  }
]

// Comprehensive Events Data
export const mockEvents: Event[] = [
  {
    id: 'EV001',
    title: 'Festival de Jazz de Dakar',
    description: 'Un événement musical incontournable en Afrique avec les plus grands artistes internationaux',
    imageUrl: 'https://picsum.photos/600/400?random=20',
    location: 'Dakar',
    country: 'Sénégal',
    startDate: '2024-04-20',
    endDate: '2024-04-23',
    price: 75,
    currency: 'XAF',
    category: 'Musique',
    availableTickets: 500
  },
  {
    id: 'EV002',
    title: 'Marathon de Paris',
    description: 'Course mythique à travers la capitale française, 42km dans les plus beaux quartiers',
    imageUrl: 'https://picsum.photos/600/400?random=21',
    location: 'Paris',
    country: 'France',
    startDate: '2024-04-14',
    endDate: '2024-04-14',
    price: 120,
    currency: 'XAF',
    category: 'Sport',
    availableTickets: 200
  },
  {
    id: 'EV003',
    title: 'Festival Gnaoua de Essaouira',
    description: 'Festival de musiques du monde au Maroc, fusion entre tradition et modernité',
    imageUrl: 'https://picsum.photos/600/400?random=22',
    location: 'Essaouira',
    country: 'Maroc',
    startDate: '2024-06-15',
    endDate: '2024-06-18',
    price: 85,
    currency: 'XAF',
    category: 'Musique',
    availableTickets: 300
  },
  {
    id: 'EV004',
    title: 'Roland Garros - Finale',
    description: 'Finale du tournoi de tennis le plus prestigieux sur terre battue',
    imageUrl: 'https://picsum.photos/600/400?random=23',
    location: 'Paris',
    country: 'France',
    startDate: '2024-06-09',
    endDate: '2024-06-09',
    price: 350,
    currency: 'XAF',
    category: 'Sport',
    availableTickets: 50
  },
  {
    id: 'EV005',
    title: 'Exposition Toutânkhamon',
    description: 'Découvrez les trésors du pharaon dans une exposition exceptionnelle',
    imageUrl: 'https://picsum.photos/600/400?random=24',
    location: 'Le Caire',
    country: 'Égypte',
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    price: 45,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 800
  },
  {
    id: 'EV006',
    title: 'La Sagrada Familia - Visite Nocturne',
    description: 'Visite exclusive de nuit du chef-d\'œuvre de Gaudí',
    imageUrl: 'https://picsum.photos/600/400?random=25',
    location: 'Barcelone',
    country: 'Espagne',
    startDate: '2024-05-15',
    endDate: '2024-05-15',
    price: 65,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 150
  },
  {
    id: 'EV007',
    title: 'Festival Gastronomique de Lisbonne',
    description: 'Découvrez la cuisine portugaise avec les meilleurs chefs du pays',
    imageUrl: 'https://picsum.photos/600/400?random=26',
    location: 'Lisbonne',
    country: 'Portugal',
    startDate: '2024-07-10',
    endDate: '2024-07-13',
    price: 95,
    currency: 'XAF',
    category: 'Gastronomie',
    availableTickets: 400
  },
  {
    id: 'EV008',
    title: 'Opéra à la Scala de Milan',
    description: 'Représentation d\'Aida de Verdi dans le théâtre le plus prestigieux',
    imageUrl: 'https://picsum.photos/600/400?random=27',
    location: 'Milan',
    country: 'Italie',
    startDate: '2024-06-20',
    endDate: '2024-06-20',
    price: 180,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 100
  },
  {
    id: 'EV009',
    title: 'Carnaval de Rio',
    description: 'Le plus grand carnaval du monde, une explosion de couleurs et de samba',
    imageUrl: 'https://picsum.photos/600/400?random=28',
    location: 'Rio de Janeiro',
    country: 'Brésil',
    startDate: '2025-02-28',
    endDate: '2025-03-04',
    price: 250,
    currency: 'XAF',
    category: 'Festival',
    availableTickets: 1000
  },
  {
    id: 'EV010',
    title: 'Festival des Lumières de Dubai',
    description: 'Spectacle lumineux époustouflant sur Burj Khalifa et la marina',
    imageUrl: 'https://picsum.photos/600/400?random=29',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    startDate: '2024-12-15',
    endDate: '2024-12-31',
    price: 120,
    currency: 'XAF',
    category: 'Festival',
    availableTickets: 600
  },
  {
    id: 'EV011',
    title: 'Grand Prix de Formule 1 de Monaco',
    description: 'Course de F1 la plus glamour sur le circuit urbain de Monte-Carlo',
    imageUrl: 'https://picsum.photos/600/400?random=30',
    location: 'Monaco',
    country: 'Monaco',
    startDate: '2024-05-26',
    endDate: '2024-05-26',
    price: 850,
    currency: 'XAF',
    category: 'Sport',
    availableTickets: 30
  },
  {
    id: 'EV012',
    title: 'Fête de la Tabaski',
    description: 'Célébrations traditionnelles et festivités culturelles sénégalaises',
    imageUrl: 'https://picsum.photos/600/400?random=31',
    location: 'Dakar',
    country: 'Sénégal',
    startDate: '2024-06-16',
    endDate: '2024-06-17',
    price: 35,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 250
  },
  {
    id: 'EV013',
    title: 'Festival de Cannes - Projection Spéciale',
    description: 'Soirée de gala avec projection d\'un film en compétition officielle',
    imageUrl: 'https://picsum.photos/600/400?random=32',
    location: 'Cannes',
    country: 'France',
    startDate: '2024-05-14',
    endDate: '2024-05-14',
    price: 450,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 75
  },
  {
    id: 'EV014',
    title: 'Concert de Jazz à Blue Note Tokyo',
    description: 'Soirée jazz exclusive dans le club légendaire de Tokyo',
    imageUrl: 'https://picsum.photos/600/400?random=33',
    location: 'Tokyo',
    country: 'Japon',
    startDate: '2024-08-10',
    endDate: '2024-08-10',
    price: 125,
    currency: 'XAF',
    category: 'Musique',
    availableTickets: 180
  },
  {
    id: 'EV015',
    title: 'Safari & Dîner sous les étoiles',
    description: 'Safari de luxe suivi d\'un dîner gastronomique dans la savane',
    imageUrl: 'https://picsum.photos/600/400?random=34',
    location: 'Zanzibar',
    country: 'Tanzanie',
    startDate: '2024-07-20',
    endDate: '2024-07-20',
    price: 380,
    currency: 'XAF',
    category: 'Aventure',
    availableTickets: 40
  },
  {
    id: 'EV016',
    title: 'Festival Nyege Nyege',
    description: 'Le plus grand festival de musique électronique d\'Afrique de l\'Est',
    imageUrl: 'https://picsum.photos/600/400?random=35',
    location: 'Jinja',
    country: 'Ouganda',
    startDate: '2024-09-05',
    endDate: '2024-09-08',
    price: 140,
    currency: 'XAF',
    category: 'Musique',
    availableTickets: 450
  },
  {
    id: 'EV017',
    title: 'Dégustation de Vins en Provence',
    description: 'Tour des vignobles provençaux avec dégustation de vins rosés',
    imageUrl: 'https://picsum.photos/600/400?random=36',
    location: 'Provence',
    country: 'France',
    startDate: '2024-06-25',
    endDate: '2024-06-25',
    price: 155,
    currency: 'XAF',
    category: 'Gastronomie',
    availableTickets: 60
  },
  {
    id: 'EV018',
    title: 'Cérémonie du Thé à Kyoto',
    description: 'Expérience authentique de la cérémonie du thé japonaise',
    imageUrl: 'https://picsum.photos/600/400?random=37',
    location: 'Kyoto',
    country: 'Japon',
    startDate: '2024-05-30',
    endDate: '2024-05-30',
    price: 85,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 25
  },
  {
    id: 'EV019',
    title: 'Festival International du Film de Marrakech',
    description: 'Projections de films du monde entier dans un cadre somptueux',
    imageUrl: 'https://picsum.photos/600/400?random=38',
    location: 'Marrakech',
    country: 'Maroc',
    startDate: '2024-11-29',
    endDate: '2024-12-07',
    price: 95,
    currency: 'XAF',
    category: 'Culture',
    availableTickets: 320
  },
  {
    id: 'EV020',
    title: 'New Year\'s Eve à Times Square',
    description: 'Célébrez le Nouvel An au cœur de Manhattan',
    imageUrl: 'https://picsum.photos/600/400?random=39',
    location: 'New York',
    country: 'États-Unis',
    startDate: '2024-12-31',
    endDate: '2024-12-31',
    price: 450,
    currency: 'XAF',
    category: 'Festival',
    availableTickets: 500
  }
]

// Comprehensive Hotels Data
export const mockHotels: Hotel[] = [
  {
    id: 'HT001',
    name: 'Radisson Blu Hotel Dakar',
    description: 'Hôtel 5 étoiles avec vue sur l\'océan Atlantique, piscine à débordement et spa de luxe',
    imageUrl: 'https://picsum.photos/600/400?random=30',
    location: 'Dakar',
    country: 'Sénégal',
    rating: 4.7,
    reviewCount: 1248,
    price: 120,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Parking', 'Salle de sport'],
    starRating: 5,
    availableRooms: 12
  },
  {
    id: 'HT002',
    name: 'Hôtel de France Paris',
    description: 'Boutique hôtel au cœur du Marais, décoration contemporaine et élégante',
    imageUrl: 'https://picsum.photos/600/400?random=31',
    location: 'Paris',
    country: 'France',
    rating: 4.5,
    reviewCount: 892,
    price: 180,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Petit-déjeuner', 'Bar', 'Climatisation', 'Room service'],
    starRating: 4,
    availableRooms: 8
  },
  {
    id: 'HT003',
    name: 'Riad Yasmine Marrakech',
    description: 'Riad traditionnel avec patio, fontaine et terrasse avec vue sur l\'Atlas',
    imageUrl: 'https://picsum.photos/600/400?random=32',
    location: 'Marrakech',
    country: 'Maroc',
    rating: 4.8,
    reviewCount: 654,
    price: 95,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Petit-déjeuner', 'Terrasse', 'Hammam', 'Restaurant'],
    starRating: 4,
    availableRooms: 5
  },
  {
    id: 'HT004',
    name: 'Burj Al Arab Dubai',
    description: 'Hôtel de luxe iconique sur une île artificielle, service de butler 24/7',
    imageUrl: 'https://picsum.photos/600/400?random=33',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    rating: 4.9,
    reviewCount: 2156,
    price: 850,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Plage privée', 'Butler', 'Héliport'],
    starRating: 5,
    availableRooms: 3
  },
  {
    id: 'HT005',
    name: 'Lamantin Beach Resort',
    description: 'Resort en bord de mer avec golf 18 trous, spa et activités nautiques',
    imageUrl: 'https://picsum.photos/600/400?random=34',
    location: 'Saly',
    country: 'Sénégal',
    rating: 4.6,
    reviewCount: 421,
    price: 140,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Golf', 'Plage', 'Sports nautiques'],
    starRating: 5,
    availableRooms: 15
  },
  {
    id: 'HT006',
    name: 'Hotel Pullman Paris Tour Eiffel',
    description: 'Vue imprenable sur la Tour Eiffel, emplacement idéal près du Trocadéro',
    imageUrl: 'https://picsum.photos/600/400?random=35',
    location: 'Paris',
    country: 'France',
    rating: 4.7,
    reviewCount: 1564,
    price: 280,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Restaurant', 'Bar', 'Salle de sport', 'Parking', 'Room service'],
    starRating: 4,
    availableRooms: 20
  },
  {
    id: 'HT007',
    name: 'Four Seasons Istanbul',
    description: 'Palace historique restauré sur les rives du Bosphore',
    imageUrl: 'https://picsum.photos/600/400?random=36',
    location: 'Istanbul',
    country: 'Turquie',
    rating: 4.9,
    reviewCount: 987,
    price: 320,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Spa', 'Restaurant', 'Bar', 'Concierge', 'Parking'],
    starRating: 5,
    availableRooms: 7
  },
  {
    id: 'HT008',
    name: 'Marriott Mena House Cairo',
    description: 'Hôtel de luxe avec vue directe sur les Pyramides de Gizeh',
    imageUrl: 'https://picsum.photos/600/400?random=37',
    location: 'Le Caire',
    country: 'Égypte',
    rating: 4.6,
    reviewCount: 745,
    price: 195,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Jardins', 'Golf', 'Parking'],
    starRating: 5,
    availableRooms: 18
  },
  {
    id: 'HT009',
    name: 'W Barcelona',
    description: 'Hôtel design moderne en forme de voile sur la plage de Barceloneta',
    imageUrl: 'https://picsum.photos/600/400?random=38',
    location: 'Barcelone',
    country: 'Espagne',
    rating: 4.7,
    reviewCount: 1023,
    price: 245,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Bar', 'Spa', 'Plage', 'Nightclub'],
    starRating: 5,
    availableRooms: 11
  },
  {
    id: 'HT010',
    name: 'Pestana Palace Lisboa',
    description: 'Palace du 19ème siècle avec jardins subtropicaux et vue sur le Tage',
    imageUrl: 'https://picsum.photos/600/400?random=39',
    location: 'Lisbonne',
    country: 'Portugal',
    rating: 4.8,
    reviewCount: 568,
    price: 215,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Jardins', 'Bar', 'Parking'],
    starRating: 5,
    availableRooms: 9
  },
  {
    id: 'HT011',
    name: 'Hotel Hassler Roma',
    description: 'Hôtel de luxe au sommet des marches espagnoles avec vue panoramique',
    imageUrl: 'https://picsum.photos/600/400?random=40',
    location: 'Rome',
    country: 'Italie',
    rating: 4.9,
    reviewCount: 1342,
    price: 395,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Restaurant', 'Bar', 'Spa', 'Terrasse', 'Room service', 'Concierge'],
    starRating: 5,
    availableRooms: 6
  },
  {
    id: 'HT012',
    name: 'The Savoy London',
    description: 'Hôtel emblématique sur le Strand avec service de majordome',
    imageUrl: 'https://picsum.photos/600/400?random=41',
    location: 'Londres',
    country: 'Royaume-Uni',
    rating: 4.8,
    reviewCount: 1876,
    price: 425,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Bar', 'Salle de sport', 'Concierge'],
    starRating: 5,
    availableRooms: 8
  },
  {
    id: 'HT013',
    name: 'The Plaza New York',
    description: 'Hôtel historique face à Central Park, emblème du luxe new-yorkais',
    imageUrl: 'https://picsum.photos/600/400?random=42',
    location: 'New York',
    country: 'États-Unis',
    rating: 4.8,
    reviewCount: 2345,
    price: 550,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Restaurant', 'Bar', 'Spa', 'Salle de sport', 'Concierge', 'Butler'],
    starRating: 5,
    availableRooms: 5
  },
  {
    id: 'HT014',
    name: 'Park Hyatt Tokyo',
    description: 'Hôtel de luxe au sommet de la tour, vue spectaculaire sur Tokyo et le Mont Fuji',
    imageUrl: 'https://picsum.photos/600/400?random=43',
    location: 'Tokyo',
    country: 'Japon',
    rating: 4.9,
    reviewCount: 1523,
    price: 480,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Bar', 'Salle de sport', 'Bibliothèque'],
    starRating: 5,
    availableRooms: 7
  },
  {
    id: 'HT015',
    name: 'Four Seasons Bali at Sayan',
    description: 'Resort de jungle luxueux niché dans la vallée de la rivière Ayung',
    imageUrl: 'https://picsum.photos/600/400?random=44',
    location: 'Ubud, Bali',
    country: 'Indonésie',
    rating: 4.9,
    reviewCount: 876,
    price: 385,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Yoga', 'Activités culturelles', 'Butler'],
    starRating: 5,
    availableRooms: 10
  },
  {
    id: 'HT016',
    name: 'The Residence Zanzibar',
    description: 'Resort de plage de luxe avec villas privées sur sable blanc',
    imageUrl: 'https://picsum.photos/600/400?random=45',
    location: 'Zanzibar',
    country: 'Tanzanie',
    rating: 4.8,
    reviewCount: 543,
    price: 425,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Plage privée', 'Sports nautiques', 'Butler'],
    starRating: 5,
    availableRooms: 6
  },
  {
    id: 'HT017',
    name: 'Sofitel Abidjan Hotel Ivoire',
    description: 'Hôtel de luxe avec casino, bowling et vue sur la lagune Ébrié',
    imageUrl: 'https://picsum.photos/600/400?random=46',
    location: 'Abidjan',
    country: 'Côte d\'Ivoire',
    rating: 4.5,
    reviewCount: 432,
    price: 165,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Casino', 'Spa', 'Salle de sport', 'Bowling'],
    starRating: 5,
    availableRooms: 14
  },
  {
    id: 'HT018',
    name: 'La Mamounia Marrakech',
    description: 'Palace légendaire avec jardins majestueux au pied de l\'Atlas',
    imageUrl: 'https://picsum.photos/600/400?random=47',
    location: 'Marrakech',
    country: 'Maroc',
    rating: 4.9,
    reviewCount: 1234,
    price: 450,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant', 'Spa', 'Jardins', 'Bar', 'Concierge', 'Hammam'],
    starRating: 5,
    availableRooms: 4
  },
  {
    id: 'HT019',
    name: 'Atlantis The Palm Dubai',
    description: 'Resort spectaculaire sur l\'île Palm Jumeirah avec parc aquatique',
    imageUrl: 'https://picsum.photos/600/400?random=48',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    rating: 4.7,
    reviewCount: 3456,
    price: 380,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Aquaventure', 'Restaurant', 'Plage', 'Aquarium', 'Spa'],
    starRating: 5,
    availableRooms: 22
  },
  {
    id: 'HT020',
    name: 'Hôtel Le Bristol Paris',
    description: 'Palace parisien rue du Faubourg Saint-Honoré avec jardin à la française',
    imageUrl: 'https://picsum.photos/600/400?random=49',
    location: 'Paris',
    country: 'France',
    rating: 4.9,
    reviewCount: 987,
    price: 650,
    currency: 'XAF',
    amenities: ['Wi-Fi', 'Piscine', 'Restaurant 3 étoiles', 'Spa', 'Jardin', 'Bar', 'Concierge'],
    starRating: 5,
    availableRooms: 3
  }
]

// Comprehensive Guides Data
export const mockGuides: Guide[] = [
  {
    id: 'GD001',
    name: 'Mamadou Diallo',
    description: 'Guide touristique certifié avec 10 ans d\'expérience, spécialiste de l\'histoire coloniale et de la culture wolof',
    imageUrl: 'https://i.pravatar.cc/200?u=guide1',
    location: 'Dakar',
    country: 'Sénégal',
    rating: 4.9,
    reviewCount: 156,
    languages: ['Français', 'Anglais', 'Wolof'],
    specialties: ['Histoire', 'Culture', 'Gastronomie'],
    pricePerHour: 25,
    currency: 'XAF'
  },
  {
    id: 'GD002',
    name: 'Sophie Laurent',
    description: 'Passionnée d\'histoire et d\'architecture parisienne, docteur en histoire de l\'art',
    imageUrl: 'https://i.pravatar.cc/200?u=guide2',
    location: 'Paris',
    country: 'France',
    rating: 4.8,
    reviewCount: 243,
    languages: ['Français', 'Anglais', 'Espagnol'],
    specialties: ['Architecture', 'Art', 'Histoire'],
    pricePerHour: 45,
    currency: 'XAF'
  },
  {
    id: 'GD003',
    name: 'Ahmed El Fassi',
    description: 'Expert de la médina et des souks de Marrakech, guide depuis 15 ans',
    imageUrl: 'https://i.pravatar.cc/200?u=guide3',
    location: 'Marrakech',
    country: 'Maroc',
    rating: 4.7,
    reviewCount: 187,
    languages: ['Français', 'Arabe', 'Anglais'],
    specialties: ['Culture', 'Shopping', 'Gastronomie'],
    pricePerHour: 30,
    currency: 'XAF'
  },
  {
    id: 'GD004',
    name: 'Fatima Al-Rashid',
    description: 'Guide experte des souks et de la culture émiratie, multilingue',
    imageUrl: 'https://i.pravatar.cc/200?u=guide4',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    rating: 4.9,
    reviewCount: 312,
    languages: ['Arabe', 'Anglais', 'Français', 'Hindi'],
    specialties: ['Shopping', 'Architecture moderne', 'Culture'],
    pricePerHour: 55,
    currency: 'XAF'
  },
  {
    id: 'GD005',
    name: 'Mehmet Yılmaz',
    description: 'Historien spécialisé dans l\'Empire ottoman et Byzance',
    imageUrl: 'https://i.pravatar.cc/200?u=guide5',
    location: 'Istanbul',
    country: 'Turquie',
    rating: 4.8,
    reviewCount: 198,
    languages: ['Turc', 'Anglais', 'Français', 'Allemand'],
    specialties: ['Histoire', 'Architecture', 'Religion'],
    pricePerHour: 35,
    currency: 'XAF'
  },
  {
    id: 'GD006',
    name: 'Youssef Hassan',
    description: 'Égyptologue passionné, spécialiste des pyramides et de l\'Égypte ancienne',
    imageUrl: 'https://i.pravatar.cc/200?u=guide6',
    location: 'Le Caire',
    country: 'Égypte',
    rating: 4.9,
    reviewCount: 267,
    languages: ['Arabe', 'Anglais', 'Français'],
    specialties: ['Égyptologie', 'Histoire ancienne', 'Archéologie'],
    pricePerHour: 40,
    currency: 'XAF'
  },
  {
    id: 'GD007',
    name: 'Carlos Rodriguez',
    description: 'Guide expert de Gaudí et du modernisme catalan',
    imageUrl: 'https://i.pravatar.cc/200?u=guide7',
    location: 'Barcelone',
    country: 'Espagne',
    rating: 4.7,
    reviewCount: 221,
    languages: ['Espagnol', 'Catalan', 'Anglais', 'Français'],
    specialties: ['Architecture', 'Art', 'Histoire'],
    pricePerHour: 38,
    currency: 'XAF'
  },
  {
    id: 'GD008',
    name: 'Maria Silva',
    description: 'Passionnée de fado et de culture portugaise, guide certifiée',
    imageUrl: 'https://i.pravatar.cc/200?u=guide8',
    location: 'Lisbonne',
    country: 'Portugal',
    rating: 4.8,
    reviewCount: 174,
    languages: ['Portugais', 'Anglais', 'Espagnol'],
    specialties: ['Culture', 'Musique', 'Gastronomie'],
    pricePerHour: 32,
    currency: 'XAF'
  },
  {
    id: 'GD009',
    name: 'Giuseppe Bianchi',
    description: 'Historien de la Rome antique et guide passionné du Colisée',
    imageUrl: 'https://i.pravatar.cc/200?u=guide9',
    location: 'Rome',
    country: 'Italie',
    rating: 4.9,
    reviewCount: 298,
    languages: ['Italien', 'Anglais', 'Français', 'Espagnol'],
    specialties: ['Histoire romaine', 'Archéologie', 'Art'],
    pricePerHour: 42,
    currency: 'XAF'
  },
  {
    id: 'GD010',
    name: 'Emma Thompson',
    description: 'Guide royale certifiée, spécialiste de la monarchie britannique',
    imageUrl: 'https://i.pravatar.cc/200?u=guide10',
    location: 'Londres',
    country: 'Royaume-Uni',
    rating: 4.8,
    reviewCount: 345,
    languages: ['Anglais', 'Français', 'Allemand'],
    specialties: ['Histoire royale', 'Architecture', 'Culture'],
    pricePerHour: 48,
    currency: 'XAF'
  },
  {
    id: 'GD011',
    name: 'Michael Chen',
    description: 'Guide new-yorkais depuis 20 ans, expert des quartiers historiques',
    imageUrl: 'https://i.pravatar.cc/200?u=guide11',
    location: 'New York',
    country: 'États-Unis',
    rating: 4.7,
    reviewCount: 412,
    languages: ['Anglais', 'Chinois', 'Espagnol'],
    specialties: ['Histoire', 'Architecture', 'Culture urbaine'],
    pricePerHour: 50,
    currency: 'XAF'
  },
  {
    id: 'GD012',
    name: 'Yuki Tanaka',
    description: 'Guide culturelle spécialisée dans les traditions japonaises et les temples',
    imageUrl: 'https://i.pravatar.cc/200?u=guide12',
    location: 'Tokyo',
    country: 'Japon',
    rating: 4.9,
    reviewCount: 276,
    languages: ['Japonais', 'Anglais', 'Français'],
    specialties: ['Culture', 'Temples', 'Gastronomie'],
    pricePerHour: 45,
    currency: 'XAF'
  },
  {
    id: 'GD013',
    name: 'Wayan Sujana',
    description: 'Guide balinais expert des temples hindous et de la culture locale',
    imageUrl: 'https://i.pravatar.cc/200?u=guide13',
    location: 'Bali',
    country: 'Indonésie',
    rating: 4.8,
    reviewCount: 189,
    languages: ['Indonésien', 'Anglais', 'Japonais'],
    specialties: ['Culture', 'Religion', 'Nature'],
    pricePerHour: 28,
    currency: 'XAF'
  },
  {
    id: 'GD014',
    name: 'Amani Kamau',
    description: 'Guide de safaris et expert de la faune africaine',
    imageUrl: 'https://i.pravatar.cc/200?u=guide14',
    location: 'Zanzibar',
    country: 'Tanzanie',
    rating: 4.9,
    reviewCount: 234,
    languages: ['Swahili', 'Anglais', 'Français'],
    specialties: ['Safari', 'Faune', 'Nature'],
    pricePerHour: 35,
    currency: 'XAF'
  },
  {
    id: 'GD015',
    name: 'Kofi Mensah',
    description: 'Guide culturel expert de l\'Afrique de l\'Ouest et de ses traditions',
    imageUrl: 'https://i.pravatar.cc/200?u=guide15',
    location: 'Abidjan',
    country: 'Côte d\'Ivoire',
    rating: 4.6,
    reviewCount: 145,
    languages: ['Français', 'Anglais', 'Baoulé'],
    specialties: ['Culture', 'Histoire', 'Art'],
    pricePerHour: 22,
    currency: 'XAF'
  }
]

// Comprehensive Restaurants Data
export const mockRestaurants: Restaurant[] = [
  {
    id: 'RS001',
    name: 'La Guinguette',
    description: 'Restaurant gastronomique avec vue sur l\'océan, spécialités de poissons frais et thiéboudienne',
    imageUrl: 'https://picsum.photos/600/400?random=40',
    location: 'Dakar',
    country: 'Sénégal',
    rating: 4.6,
    reviewCount: 324,
    cuisine: 'Sénégalaise',
    priceRange: 'FFF',
    averagePrice: 35,
    currency: 'XAF'
  },
  {
    id: 'RS002',
    name: 'Le Jules Verne',
    description: 'Restaurant étoilé Michelin au 2ème étage de la Tour Eiffel, cuisine française raffinée',
    imageUrl: 'https://picsum.photos/600/400?random=41',
    location: 'Paris',
    country: 'France',
    rating: 4.9,
    reviewCount: 892,
    cuisine: 'Française',
    priceRange: 'FFFF',
    averagePrice: 180,
    currency: 'XAF'
  },
  {
    id: 'RS003',
    name: 'Le Comptoir Darna',
    description: 'Restaurant marocain avec spectacle de danse orientale et musique live',
    imageUrl: 'https://picsum.photos/600/400?random=42',
    location: 'Marrakech',
    country: 'Maroc',
    rating: 4.7,
    reviewCount: 456,
    cuisine: 'Marocaine',
    priceRange: 'FF',
    averagePrice: 45,
    currency: 'XAF'
  },
  {
    id: 'RS004',
    name: 'Pierchic',
    description: 'Restaurant de fruits de mer sur pilotis avec vue sur le Burj Al Arab',
    imageUrl: 'https://picsum.photos/600/400?random=43',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    rating: 4.8,
    reviewCount: 678,
    cuisine: 'Fruits de mer',
    priceRange: 'FFFF',
    averagePrice: 150,
    currency: 'XAF'
  },
  {
    id: 'RS005',
    name: 'Mikla',
    description: 'Restaurant sur le toit avec vue panoramique sur Istanbul et le Bosphore',
    imageUrl: 'https://picsum.photos/600/400?random=44',
    location: 'Istanbul',
    country: 'Turquie',
    rating: 4.7,
    reviewCount: 523,
    cuisine: 'Turque moderne',
    priceRange: 'FFF',
    averagePrice: 85,
    currency: 'XAF'
  },
  {
    id: 'RS006',
    name: 'Abou El Sid',
    description: 'Restaurant égyptien traditionnel dans un décor authentique des années 1940',
    imageUrl: 'https://picsum.photos/600/400?random=45',
    location: 'Le Caire',
    country: 'Égypte',
    rating: 4.6,
    reviewCount: 387,
    cuisine: 'Égyptienne',
    priceRange: 'FF',
    averagePrice: 28,
    currency: 'XAF'
  },
  {
    id: 'RS007',
    name: 'Tickets Bar',
    description: 'Tapas créatives par les frères Adrià dans un cadre de théâtre',
    imageUrl: 'https://picsum.photos/600/400?random=46',
    location: 'Barcelone',
    country: 'Espagne',
    rating: 4.8,
    reviewCount: 712,
    cuisine: 'Tapas modernes',
    priceRange: 'FFF',
    averagePrice: 65,
    currency: 'XAF'
  },
  {
    id: 'RS008',
    name: 'Time Out Market',
    description: 'Marché gastronomique avec les meilleurs chefs de Lisbonne',
    imageUrl: 'https://picsum.photos/600/400?random=47',
    location: 'Lisbonne',
    country: 'Portugal',
    rating: 4.5,
    reviewCount: 1243,
    cuisine: 'Internationale',
    priceRange: 'FF',
    averagePrice: 25,
    currency: 'XAF'
  },
  {
    id: 'RS009',
    name: 'La Pergola',
    description: 'Restaurant 3 étoiles Michelin avec terrasse et vue sur Rome',
    imageUrl: 'https://picsum.photos/600/400?random=48',
    location: 'Rome',
    country: 'Italie',
    rating: 4.9,
    reviewCount: 456,
    cuisine: 'Italienne gastronomique',
    priceRange: 'FFFF',
    averagePrice: 220,
    currency: 'XAF'
  },
  {
    id: 'RS010',
    name: 'Dishoom',
    description: 'Restaurant indien inspiré des cafés Irani de Bombay',
    imageUrl: 'https://picsum.photos/600/400?random=49',
    location: 'Londres',
    country: 'Royaume-Uni',
    rating: 4.7,
    reviewCount: 2134,
    cuisine: 'Indienne',
    priceRange: 'FF',
    averagePrice: 35,
    currency: 'XAF'
  },
  {
    id: 'RS011',
    name: 'Eleven Madison Park',
    description: 'Restaurant 3 étoiles Michelin, expérience culinaire inoubliable',
    imageUrl: 'https://picsum.photos/600/400?random=50',
    location: 'New York',
    country: 'États-Unis',
    rating: 4.9,
    reviewCount: 876,
    cuisine: 'Américaine contemporaine',
    priceRange: 'FFFF',
    averagePrice: 295,
    currency: 'XAF'
  },
  {
    id: 'RS012',
    name: 'Sukiyabashi Jiro',
    description: 'Restaurant de sushi légendaire 3 étoiles Michelin',
    imageUrl: 'https://picsum.photos/600/400?random=51',
    location: 'Tokyo',
    country: 'Japon',
    rating: 4.9,
    reviewCount: 543,
    cuisine: 'Sushi',
    priceRange: 'FFFF',
    averagePrice: 350,
    currency: 'XAF'
  },
  {
    id: 'RS013',
    name: 'Mozaic Restaurant',
    description: 'Restaurant gastronomique fusion dans les rizières d\'Ubud',
    imageUrl: 'https://picsum.photos/600/400?random=52',
    location: 'Bali',
    country: 'Indonésie',
    rating: 4.8,
    reviewCount: 312,
    cuisine: 'Fusion asiatique',
    priceRange: 'FFF',
    averagePrice: 75,
    currency: 'XAF'
  },
  {
    id: 'RS014',
    name: 'The Rock Restaurant',
    description: 'Restaurant unique sur un rocher au milieu de l\'océan',
    imageUrl: 'https://picsum.photos/600/400?random=53',
    location: 'Zanzibar',
    country: 'Tanzanie',
    rating: 4.7,
    reviewCount: 624,
    cuisine: 'Fruits de mer',
    priceRange: 'FFF',
    averagePrice: 55,
    currency: 'XAF'
  },
  {
    id: 'RS015',
    name: 'La Terrasse d\'Abidjan',
    description: 'Restaurant panoramique avec cuisine ivoirienne raffinée',
    imageUrl: 'https://picsum.photos/600/400?random=54',
    location: 'Abidjan',
    country: 'Côte d\'Ivoire',
    rating: 4.5,
    reviewCount: 267,
    cuisine: 'Ivoirienne',
    priceRange: 'FF',
    averagePrice: 32,
    currency: 'XAF'
  },
  {
    id: 'RS016',
    name: 'Le Foundouk',
    description: 'Restaurant fusion dans un ancien caravansérail rénové',
    imageUrl: 'https://picsum.photos/600/400?random=55',
    location: 'Marrakech',
    country: 'Maroc',
    rating: 4.6,
    reviewCount: 398,
    cuisine: 'Fusion méditerranéenne',
    priceRange: 'FFF',
    averagePrice: 48,
    currency: 'XAF'
  },
  {
    id: 'RS017',
    name: 'L\'Atelier de Joël Robuchon',
    description: 'Concept unique de comptoir gastronomique',
    imageUrl: 'https://picsum.photos/600/400?random=56',
    location: 'Paris',
    country: 'France',
    rating: 4.8,
    reviewCount: 756,
    cuisine: 'Française moderne',
    priceRange: 'FFFF',
    averagePrice: 145,
    currency: 'XAF'
  },
  {
    id: 'RS018',
    name: 'Nusr-Et Steakhouse',
    description: 'Steakhouse de luxe du célèbre Salt Bae',
    imageUrl: 'https://picsum.photos/600/400?random=57',
    location: 'Dubai',
    country: 'Émirats Arabes Unis',
    rating: 4.6,
    reviewCount: 934,
    cuisine: 'Steakhouse',
    priceRange: 'FFFF',
    averagePrice: 185,
    currency: 'XAF'
  },
  {
    id: 'RS019',
    name: 'Chez Loutcha',
    description: 'Cuisine sénégalaise authentique dans une villa coloniale',
    imageUrl: 'https://picsum.photos/600/400?random=58',
    location: 'Dakar',
    country: 'Sénégal',
    rating: 4.7,
    reviewCount: 432,
    cuisine: 'Sénégalaise',
    priceRange: 'FF',
    averagePrice: 28,
    currency: 'XAF'
  },
  {
    id: 'RS020',
    name: 'Septime',
    description: 'Bistrot parisien moderne, l\'un des restaurants les plus réservés',
    imageUrl: 'https://picsum.photos/600/400?random=59',
    location: 'Paris',
    country: 'France',
    rating: 4.8,
    reviewCount: 623,
    cuisine: 'Française contemporaine',
    priceRange: 'FFF',
    averagePrice: 75,
    currency: 'XAF'
  }
]

// Transfer/Transport Options
export interface Transfer {
  id: string
  type: 'airport_transfer' | 'car_rental' | 'train' | 'bus' | 'private_driver'
  name: string
  description: string
  from: string
  to: string
  country: string
  duration: string
  price: number
  currency: string
  capacity: number
  imageUrl: string
}

export const mockTransfers: Transfer[] = [
  {
    id: 'TR001',
    type: 'airport_transfer',
    name: 'Transfert Aéroport Dakar - Hôtel',
    description: 'Transfert privé confortable de l\'aéroport Blaise Diagne vers votre hôtel à Dakar',
    from: 'Aéroport Blaise Diagne',
    to: 'Centre-ville Dakar',
    country: 'Sénégal',
    duration: '45min',
    price: 35,
    currency: 'XAF',
    capacity: 4,
    imageUrl: 'https://picsum.photos/400/300?random=60'
  },
  {
    id: 'TR002',
    type: 'private_driver',
    name: 'Chauffeur Privé Paris',
    description: 'Chauffeur privé Mercedes Classe E pour une journée à Paris',
    from: 'Paris',
    to: 'Paris et environs',
    country: 'France',
    duration: '8h',
    price: 320,
    currency: 'XAF',
    capacity: 3,
    imageUrl: 'https://picsum.photos/400/300?random=61'
  },
  {
    id: 'TR003',
    type: 'car_rental',
    name: 'Location BMW Série 3',
    description: 'Voiture de luxe pour explorer la Côte d\'Azur en toute liberté',
    from: 'Nice Aéroport',
    to: 'Nice Aéroport',
    country: 'France',
    duration: '3 jours',
    price: 250,
    currency: 'XAF',
    capacity: 5,
    imageUrl: 'https://picsum.photos/400/300?random=62'
  },
  {
    id: 'TR004',
    type: 'airport_transfer',
    name: 'Transfert Aéroport Dubai',
    description: 'Limousine de luxe de l\'aéroport vers votre hôtel à Dubai',
    from: 'Dubai International Airport',
    to: 'Hotels Dubai',
    country: 'Émirats Arabes Unis',
    duration: '30min',
    price: 75,
    currency: 'XAF',
    capacity: 6,
    imageUrl: 'https://picsum.photos/400/300?random=63'
  },
  {
    id: 'TR005',
    type: 'train',
    name: 'TGV Paris - Marseille',
    description: 'Train à grande vitesse 1ère classe',
    from: 'Paris Gare de Lyon',
    to: 'Marseille Saint-Charles',
    country: 'France',
    duration: '3h20',
    price: 95,
    currency: 'XAF',
    capacity: 1,
    imageUrl: 'https://picsum.photos/400/300?random=64'
  },
  {
    id: 'TR006',
    type: 'bus',
    name: 'Bus Marrakech - Essaouira',
    description: 'Bus confortable climatisé avec Wi-Fi',
    from: 'Marrakech',
    to: 'Essaouira',
    country: 'Maroc',
    duration: '2h30',
    price: 12,
    currency: 'XAF',
    capacity: 1,
    imageUrl: 'https://picsum.photos/400/300?random=65'
  },
  {
    id: 'TR007',
    type: 'airport_transfer',
    name: 'Transfert Aéroport Istanbul',
    description: 'Transfert privé vers les hôtels de Sultanahmet ou Taksim',
    from: 'Istanbul Airport',
    to: 'Hotels Istanbul',
    country: 'Turquie',
    duration: '45min',
    price: 40,
    currency: 'XAF',
    capacity: 4,
    imageUrl: 'https://picsum.photos/400/300?random=66'
  },
  {
    id: 'TR008',
    type: 'private_driver',
    name: 'Chauffeur Tokyo',
    description: 'Chauffeur privé anglophone pour visiter Tokyo',
    from: 'Tokyo',
    to: 'Tokyo',
    country: 'Japon',
    duration: '6h',
    price: 280,
    currency: 'XAF',
    capacity: 4,
    imageUrl: 'https://picsum.photos/400/300?random=67'
  },
  {
    id: 'TR009',
    type: 'car_rental',
    name: 'Location Scooter Bali',
    description: 'Scooter automatique pour explorer Bali',
    from: 'Ubud',
    to: 'Ubud',
    country: 'Indonésie',
    duration: '2 jours',
    price: 25,
    currency: 'XAF',
    capacity: 2,
    imageUrl: 'https://picsum.photos/400/300?random=68'
  },
  {
    id: 'TR010',
    type: 'airport_transfer',
    name: 'Transfert JFK - Manhattan',
    description: 'Transfert privé vers les hôtels de Manhattan',
    from: 'JFK Airport',
    to: 'Manhattan',
    country: 'États-Unis',
    duration: '50min',
    price: 85,
    currency: 'XAF',
    capacity: 4,
    imageUrl: 'https://picsum.photos/600/400?random=69'
  }
]
