import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Traveo database (comprehensive)...')

  // ─── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12)
  const userHash = await bcrypt.hash('user1234', 12)
  const providerHash = await bcrypt.hash('provider123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@traveo.cm' },
    update: {},
    create: { email: 'admin@traveo.cm', password: adminHash, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', country: 'CM', title: 'Mr', dateOfBirth: new Date('1980-01-01'), gender: 'm' },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@traveo.cm' },
    update: {},
    create: { email: 'user@traveo.cm', password: userHash, firstName: 'Jean', lastName: 'Dupont', role: 'USER', country: 'CM', phone: '+237600000001', title: 'Mr', dateOfBirth: new Date('1990-05-15'), gender: 'm' },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@traveo.cm' },
    update: {},
    create: { email: 'user2@traveo.cm', password: userHash, firstName: 'Sophie', lastName: 'Martin', role: 'USER', country: 'FR', phone: '+33612345678', title: 'Ms', dateOfBirth: new Date('1992-08-20'), gender: 'f' },
  })

  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@traveo.cm' },
    update: {},
    create: { email: 'provider@traveo.cm', password: providerHash, firstName: 'Marie', lastName: 'Kotto', role: 'PROVIDER', country: 'CM', phone: '+237600000002', title: 'Mrs', dateOfBirth: new Date('1985-03-10'), gender: 'f' },
  })

  const provider2User = await prisma.user.upsert({
    where: { email: 'provider2@traveo.cm' },
    update: {},
    create: { email: 'provider2@traveo.cm', password: providerHash, firstName: 'Pierre', lastName: 'Mbea', role: 'PROVIDER', country: 'CM', phone: '+237600000003', title: 'Mr', dateOfBirth: new Date('1982-11-25'), gender: 'm' },
  })

  // ─── Wallets ───────────────────────────────────────────────────────────────
  const userWallet = await prisma.walletAccount.upsert({
    where: { userId: user.id }, update: {},
    create: { userId: user.id, balance: 250000, currency: 'XAF' },
  })
  await prisma.walletAccount.upsert({
    where: { userId: user2.id }, update: {},
    create: { userId: user2.id, balance: 150000, currency: 'EUR' },
  })
  const providerWallet = await prisma.walletAccount.upsert({
    where: { userId: providerUser.id }, update: {},
    create: { userId: providerUser.id, balance: 1500000, currency: 'XAF' },
  })
  await prisma.walletAccount.upsert({
    where: { userId: provider2User.id }, update: {},
    create: { userId: provider2User.id, balance: 800000, currency: 'XAF' },
  })

  // ─── Wallet Transactions ─────────────────────────────────────────────────────
  await prisma.walletTransaction.createMany({
    data: [
      { walletId: userWallet.id, type: 'credit', amount: 250000, currency: 'XAF', status: 'completed', description: 'Initial deposit' },
      { walletId: userWallet.id, type: 'debit', amount: 45000, currency: 'XAF', status: 'completed', description: 'Flight booking payment' },
      { walletId: providerWallet.id, type: 'credit', amount: 1500000, currency: 'XAF', status: 'completed', description: 'Payout received' },
    ],
    skipDuplicates: true,
  })

  // ─── Providers ──────────────────────────────────────────────────────────────
  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id }, update: {},
    create: { userId: providerUser.id, companyName: 'Kotto Travel Services', businessType: 'HOTEL', description: 'Hôtels et séjours de luxe au Cameroun', isVerified: true, verificationProgress: 100 },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: provider2User.id }, update: {},
    create: { userId: provider2User.id, companyName: 'Mbea Safari Adventures', businessType: 'GUIDE', description: 'Safaris et excursions dans les parcs nationaux', isVerified: true, verificationProgress: 100 },
  })

  // ─── Provider Documents ─────────────────────────────────────────────────────
  await prisma.providerDocument.createMany({
    data: [
      { providerId: provider.id, documentType: 'business_license', fileUrl: 'https://example.com/license.pdf', fileName: 'business_license.pdf', status: 'APPROVED' },
      { providerId: provider.id, documentType: 'insurance', fileUrl: 'https://example.com/insurance.pdf', fileName: 'insurance.pdf', status: 'APPROVED' },
      { providerId: provider2.id, documentType: 'id_card', fileUrl: 'https://example.com/id.pdf', fileName: 'id_card.pdf', status: 'APPROVED' },
    ],
    skipDuplicates: true,
  })

  // ─── Payout Requests ───────────────────────────────────────────────────────
  await prisma.payoutRequest.createMany({
    data: [
      { providerId: provider.id, amount: 500000, currency: 'XAF', status: 'COMPLETED', bankDetails: { bank: 'SGBC', account: '1234567890' }, processedAt: new Date('2026-05-15') },
      { providerId: provider2.id, amount: 200000, currency: 'XAF', status: 'PENDING', bankDetails: { bank: 'Ecobank', account: '0987654321' } },
    ],
    skipDuplicates: true,
  })

  // ─── Destinations ──────────────────────────────────────────────────────────
  const destinations = [
    { name: 'Yaoundé', country: 'Cameroun', imageUrl: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800', description: 'La capitale politique du Cameroun, ville des collines', rating: 4.3, reviewCount: 1240, popularityScore: 88 },
    { name: 'Douala', country: 'Cameroun', imageUrl: 'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=800', description: 'Le poumon économique du Cameroun, ville côtière animée', rating: 4.1, reviewCount: 980, popularityScore: 85 },
    { name: 'Kribi', country: 'Cameroun', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', description: 'Plages paradisiaques et cascades de Lobé', rating: 4.7, reviewCount: 760, popularityScore: 92 },
    { name: 'Limbe', country: 'Cameroun', imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800', description: 'Plages de sable noir, faune sauvage et Mont Cameroun', rating: 4.5, reviewCount: 540, popularityScore: 87 },
    { name: 'Bafoussam', country: 'Cameroun', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', description: 'Cœur culturel des Grassfields, artisanat et chefferies', rating: 4.2, reviewCount: 320, popularityScore: 75 },
    { name: 'Paris', country: 'France', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', description: 'La ville lumière, capitale de la mode et de la culture', rating: 4.8, reviewCount: 45000, popularityScore: 98 },
    { name: 'Dubaï', country: 'Émirats arabes unis', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', description: 'La cité futuriste du désert, shopping et luxe', rating: 4.7, reviewCount: 32000, popularityScore: 96 },
    { name: 'Marrakech', country: 'Maroc', imageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800', description: 'La ville rouge, souks, palais et jardins exotiques', rating: 4.6, reviewCount: 18500, popularityScore: 93 },
    { name: 'Dakar', country: 'Sénégal', imageUrl: 'https://images.unsplash.com/photo-1536183922588-166604504d5e?w=800', description: 'Capitale vibrante de l\'Afrique de l\'Ouest', rating: 4.4, reviewCount: 8200, popularityScore: 86 },
    { name: 'Zanzibar', country: 'Tanzanie', imageUrl: 'https://images.unsplash.com/photo-1538881926668-3c3e51d3ebfc?w=800', description: 'L\'île des épices, plages turquoise et vieille ville', rating: 4.8, reviewCount: 22000, popularityScore: 95 },
  ]

  for (const d of destinations) {
    await prisma.destination.upsert({ where: { id: d.name.toLowerCase().replace(/\s/g, '-') }, update: d, create: { id: d.name.toLowerCase().replace(/\s/g, '-'), ...d } })
  }

  // ─── Flights ───────────────────────────────────────────────────────────────
  const flights = [
    { airline: 'Camair-Co', flightNumber: 'QC101', origin: 'Douala', originCode: 'DLA', destination: 'Yaoundé', destinationCode: 'NSI', departAt: new Date('2026-06-15T06:00:00Z'), arriveAt: new Date('2026-06-15T07:05:00Z'), durationMinutes: 65, stops: 0, priceEconomy: 45000, priceBusiness: 85000, currency: 'XAF', availableSeats: 80 },
    { airline: 'Camair-Co', flightNumber: 'QC205', origin: 'Douala', originCode: 'DLA', destination: 'Paris', destinationCode: 'CDG', departAt: new Date('2026-06-20T22:00:00Z'), arriveAt: new Date('2026-06-21T08:30:00Z'), durationMinutes: 630, stops: 1, priceEconomy: 380000, priceBusiness: 950000, currency: 'XAF', availableSeats: 120 },
    { airline: 'Air France', flightNumber: 'AF967', origin: 'Paris', originCode: 'CDG', destination: 'Douala', destinationCode: 'DLA', departAt: new Date('2026-06-25T23:50:00Z'), arriveAt: new Date('2026-06-26T10:20:00Z'), durationMinutes: 630, stops: 0, priceEconomy: 420000, priceBusiness: 1100000, currency: 'XAF', availableSeats: 200 },
    { airline: 'Ethiopian Airlines', flightNumber: 'ET921', origin: 'Douala', originCode: 'DLA', destination: 'Dubai', destinationCode: 'DXB', departAt: new Date('2026-07-01T01:00:00Z'), arriveAt: new Date('2026-07-01T14:30:00Z'), durationMinutes: 810, stops: 1, priceEconomy: 320000, priceBusiness: 820000, currency: 'XAF', availableSeats: 150 },
    { airline: 'Royal Air Maroc', flightNumber: 'AT500', origin: 'Yaoundé', originCode: 'NSI', destination: 'Casablanca', destinationCode: 'CMN', departAt: new Date('2026-06-18T09:15:00Z'), arriveAt: new Date('2026-06-18T17:45:00Z'), durationMinutes: 510, stops: 0, priceEconomy: 280000, priceBusiness: 650000, currency: 'XAF', availableSeats: 90 },
    { airline: 'Kenya Airways', flightNumber: 'KQ413', origin: 'Douala', originCode: 'DLA', destination: 'Nairobi', destinationCode: 'NBO', departAt: new Date('2026-06-22T15:30:00Z'), arriveAt: new Date('2026-06-22T22:45:00Z'), durationMinutes: 255, stops: 0, priceEconomy: 195000, priceBusiness: 480000, currency: 'XAF', availableSeats: 110 },
  ]

  const flightIds: string[] = []
  for (const f of flights) {
    const flight = await prisma.flight.upsert({ where: { id: f.flightNumber }, update: f, create: { id: f.flightNumber, ...f } })
    flightIds.push(flight.id)
  }

  // ─── Hotels ────────────────────────────────────────────────────────────────
  const hotels = [
    { type: 'HOTEL' as const, name: 'Hôtel Hilton Yaoundé', description: 'Hôtel de luxe au cœur de Yaoundé avec piscine et spa', imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', location: 'Avenue du 20 mai, Yaoundé', country: 'Cameroun', rating: 4.6, reviewCount: 820, price: 95000, currency: 'XAF', metadata: { amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking'], starRating: 5, roomTypes: ['Standard', 'Deluxe', 'Suite'], availableRooms: 45 } },
    { type: 'HOTEL' as const, name: 'Kiri Hotel Douala', description: 'Hôtel moderne avec vue panoramique sur la ville', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', location: 'Bonanjo, Douala', country: 'Cameroun', rating: 4.4, reviewCount: 650, price: 75000, currency: 'XAF', metadata: { amenities: ['WiFi', 'Restaurant', 'Bar', 'Parking', 'Climatisation'], starRating: 4, roomTypes: ['Standard', 'Business', 'Suite'], availableRooms: 30 } },
    { type: 'HOTEL' as const, name: 'Kribi Beach Resort', description: 'Resort en bord de mer avec accès direct à la plage', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', location: 'Kribi Beach, Kribi', country: 'Cameroun', rating: 4.7, reviewCount: 430, price: 65000, currency: 'XAF', metadata: { amenities: ['WiFi', 'Plage privée', 'Piscine', 'Restaurant', 'Sports nautiques'], starRating: 4, roomTypes: ['Bungalow', 'Suite Ocean'], availableRooms: 20 } },
    { type: 'HOTEL' as const, name: 'Palais des Congrès Hotel', description: 'Hôtel de prestige adjacent au Palais des Congrès', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', location: 'Centre-ville, Yaoundé', country: 'Cameroun', rating: 4.3, reviewCount: 380, price: 55000, currency: 'XAF', metadata: { amenities: ['WiFi', 'Restaurant', 'Gym', 'Business Center'], starRating: 4, roomTypes: ['Standard', 'Superior', 'Junior Suite'], availableRooms: 60 } },
  ]

  const hotelIds: string[] = []
  for (const h of hotels) {
    const existing = await prisma.service.findFirst({ where: { name: h.name, type: 'HOTEL' } })
    if (existing) {
      // Update existing service to link to current provider
      const hotel = await prisma.service.update({ where: { id: existing.id }, data: { providerId: provider.id, ...h } })
      hotelIds.push(hotel.id)
    } else {
      const hotel = await prisma.service.create({ data: { ...h, providerId: provider.id, isActive: true } })
      hotelIds.push(hotel.id)
    }
  }

  // ─── Hotel Rooms ───────────────────────────────────────────────────────────
  for (const hotelId of hotelIds) {
    await prisma.hotelRoom.createMany({
      data: [
        { serviceId: hotelId, name: 'Standard Room', price: 45000, maxGuests: 2, available: 10, amenities: ['WiFi', 'AC', 'TV'], description: 'Comfortable standard room' },
        { serviceId: hotelId, name: 'Deluxe Room', price: 75000, maxGuests: 2, available: 5, amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], description: 'Spacious deluxe room' },
        { serviceId: hotelId, name: 'Suite', price: 120000, maxGuests: 4, available: 3, amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Balcony'], description: 'Luxury suite with balcony' },
      ],
      skipDuplicates: true,
    })
  }

  // ─── Guides ────────────────────────────────────────────────────────────────
  const guides = [
    { type: 'GUIDE' as const, name: 'Paul Biya Tours', description: 'Guide expert des savanes et forêts du Cameroun', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800', location: 'Yaoundé', country: 'Cameroun', rating: 4.8, reviewCount: 240, price: 25000, currency: 'XAF', metadata: { languages: ['Français', 'Anglais', 'Bassa'], specialties: ['Nature', 'Culture', 'Histoire'], pricePerHour: 25000, groupSizeMax: 8 } },
    { type: 'GUIDE' as const, name: 'Amara Safari Guide', description: 'Spécialiste des parcs nationaux et de la faune sauvage', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', location: 'Garoua', country: 'Cameroun', rating: 4.9, reviewCount: 180, price: 35000, currency: 'XAF', metadata: { languages: ['Français', 'Anglais', 'Peul'], specialties: ['Safari', 'Photographie', 'Faune'], pricePerHour: 35000, groupSizeMax: 6 } },
    { type: 'GUIDE' as const, name: 'Douala City Explorer', description: 'Découvrez les secrets de Douala avec un guide local', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800', location: 'Douala', country: 'Cameroun', rating: 4.6, reviewCount: 310, price: 20000, currency: 'XAF', metadata: { languages: ['Français', 'Anglais', 'Duala'], specialties: ['Gastronomie', 'Art', 'Marché'], pricePerHour: 20000, groupSizeMax: 10 } },
  ]

  const guideIds: string[] = []
  for (const g of guides) {
    const existing = await prisma.service.findFirst({ where: { name: g.name, type: 'GUIDE' } })
    if (existing) {
      // Update existing service to link to current provider
      const guide = await prisma.service.update({ where: { id: existing.id }, data: { providerId: provider2.id, ...g } })
      guideIds.push(guide.id)
    } else {
      const guide = await prisma.service.create({ data: { ...g, providerId: provider2.id, isActive: true } })
      guideIds.push(guide.id)
    }
  }

  // ─── Tours ─────────────────────────────────────────────────────────────────
  for (const guideId of guideIds) {
    await prisma.tour.createMany({
      data: [
        { serviceId: guideId, name: 'City Walking Tour', price: 25000, duration: '2 hours', groupSize: 10, languages: ['Français', 'Anglais'], description: 'Explore the city on foot' },
        { serviceId: guideId, name: 'Full Day Safari', price: 150000, duration: 'full day', groupSize: 6, languages: ['Français', 'Anglais'], difficulty: 'moderate', description: 'Full day wildlife safari' },
      ],
      skipDuplicates: true,
    })
  }

  // ─── Restaurants ──────────────────────────────────────────────────────────
  const restaurants = [
    { type: 'RESTAURANT' as const, name: 'La Terrasse du Centre', description: 'Restaurant gastronomique avec vue panoramique', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', location: 'Plateau, Yaoundé', country: 'Cameroun', rating: 4.7, reviewCount: 520, price: 35000, currency: 'XAF', metadata: { cuisine: 'Fusion africaine', priceRange: '$$$$', diningOptions: ['Dîner', 'Déjeuner', 'Privatisation'], openHours: '12h-23h' } },
    { type: 'RESTAURANT' as const, name: 'Le Wouri Restaurant', description: 'Cuisine camerounaise authentique au bord du fleuve', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', location: 'Bord du Wouri, Douala', country: 'Cameroun', rating: 4.5, reviewCount: 680, price: 18000, currency: 'XAF', metadata: { cuisine: 'Camerounaise traditionnelle', priceRange: '$$$', diningOptions: ['Déjeuner', 'Dîner'], openHours: '11h-22h' } },
    { type: 'RESTAURANT' as const, name: 'Mama Africa Kitchen', description: 'Street food et plats africains dans un cadre festif', imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800', location: 'Ndokoti, Douala', country: 'Cameroun', rating: 4.3, reviewCount: 890, price: 8000, currency: 'XAF', metadata: { cuisine: 'Africaine', priceRange: '$$', diningOptions: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], openHours: '07h-22h' } },
  ]

  const restaurantIds: string[] = []
  for (const r of restaurants) {
    const existing = await prisma.service.findFirst({ where: { name: r.name, type: 'RESTAURANT' } })
    const restaurant = existing || await prisma.service.create({ data: { ...r, providerId: provider.id, isActive: true } })
    restaurantIds.push(restaurant.id)
  }

  // ─── Menu Items ────────────────────────────────────────────────────────────
  for (const restaurantId of restaurantIds) {
    await prisma.menuItem.createMany({
      data: [
        { serviceId: restaurantId, name: 'Poulet DG', price: 12000, cuisine: 'Camerounaise', description: 'Poulet braisé avec plantains et légumes' },
        { serviceId: restaurantId, name: 'Ndolé', price: 10000, cuisine: 'Camerounaise', description: 'Feuilles de ndolé avec crevettes et poisson séché' },
        { serviceId: restaurantId, name: 'Saka Saka', price: 8000, cuisine: 'Camerounaise', description: 'Feuilles de manioc à la sauce arachide' },
      ],
      skipDuplicates: true,
    })
  }

  // ─── Events ────────────────────────────────────────────────────────────────
  const events = [
    { type: 'EVENTS' as const, name: 'Festival des Arts et de la Culture', description: 'Le plus grand festival culturel du Cameroun', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', location: 'Palais des Congrès, Yaoundé', country: 'Cameroun', rating: 4.8, reviewCount: 1200, price: 15000, currency: 'XAF', metadata: { startDate: '2026-07-10', endDate: '2026-07-15', category: 'Culture', availableTickets: 500 } },
    { type: 'EVENTS' as const, name: 'Kribi Beach Festival', description: 'Musique, plage et gastronomie à Kribi', imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800', location: 'Plage de Kribi', country: 'Cameroun', rating: 4.6, reviewCount: 780, price: 25000, currency: 'XAF', metadata: { startDate: '2026-08-01', endDate: '2026-08-03', category: 'Musique', availableTickets: 1000 } },
    { type: 'EVENTS' as const, name: 'Douala Business Summit', description: 'Forum économique international de l\'Afrique centrale', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', location: 'Hôtel Hilton, Douala', country: 'Cameroun', rating: 4.4, reviewCount: 340, price: 75000, currency: 'XAF', metadata: { startDate: '2026-09-15', endDate: '2026-09-17', category: 'Business', availableTickets: 200 } },
  ]

  const eventIds: string[] = []
  for (const e of events) {
    const existing = await prisma.service.findFirst({ where: { name: e.name, type: 'EVENTS' } })
    const event = existing || await prisma.service.create({ data: { ...e, providerId: provider.id, isActive: true } })
    eventIds.push(event.id)
  }

  // ─── Event Spaces ─────────────────────────────────────────────────────────
  for (const eventId of eventIds) {
    await prisma.eventSpace.createMany({
      data: [
        { serviceId: eventId, name: 'Main Hall', price: 500000, capacity: 500, eventType: 'corporate', equipment: ['projector', 'sound system', 'catering'] },
        { serviceId: eventId, name: 'VIP Room', price: 200000, capacity: 50, eventType: 'party', equipment: ['sound system', 'catering'] },
      ],
      skipDuplicates: true,
    })
  }

  // ─── Transfers ────────────────────────────────────────────────────────────
  const transfers = [
    { type: 'TRANSPORT' as const, name: 'Airport Transfer Douala', description: 'Navette aéroport - ville confortable et fiable', imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', location: 'Aéroport International de Douala', country: 'Cameroun', rating: 4.5, reviewCount: 420, price: 15000, currency: 'XAF', metadata: { vehicleTypes: ['Berline', 'SUV', 'Minivan'], seatingCapacity: 8, route: 'DLA-Ville' } },
    { type: 'TRANSPORT' as const, name: 'VIP Intercity Transfer', description: 'Transport VIP entre les principales villes du Cameroun', imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', location: 'Yaoundé - Douala', country: 'Cameroun', rating: 4.7, reviewCount: 280, price: 35000, currency: 'XAF', metadata: { vehicleTypes: ['Mercedes Classe E', 'Land Cruiser'], seatingCapacity: 4, route: 'NSI-DLA' } },
  ]

  const transferIds: string[] = []
  for (const t of transfers) {
    const existing = await prisma.service.findFirst({ where: { name: t.name, type: 'TRANSPORT' } })
    const transfer = existing || await prisma.service.create({ data: { ...t, providerId: provider.id, isActive: true } })
    transferIds.push(transfer.id)
  }

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  for (const transferId of transferIds) {
    await prisma.vehicle.createMany({
      data: [
        { serviceId: transferId, name: 'Toyota Camry', price: 15000, capacity: 4, vehicleType: 'sedan', routes: ['DLA-Ville', 'NSI-Ville'], features: ['ac', 'wifi', 'usb'] },
        { serviceId: transferId, name: 'Toyota Land Cruiser', price: 35000, capacity: 7, vehicleType: 'suv', routes: ['NSI-DLA', 'DLA-NSI'], features: ['ac', 'wifi', 'usb', 'leather'] },
      ],
      skipDuplicates: true,
    })
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────
  const allServiceIds = [...hotelIds, ...guideIds, ...restaurantIds, ...eventIds, ...transferIds]
  await prisma.booking.createMany({
    data: [
      { userId: user.id, serviceType: 'flight', flightId: flightIds[0], status: 'CONFIRMED', totalAmount: 45000, currency: 'XAF', metadata: { cabin: 'economy', passengers: 1 } },
      { userId: user.id, serviceType: 'hotel', serviceId: hotelIds[0], providerId: provider.id, status: 'CONFIRMED', totalAmount: 95000, currency: 'XAF', metadata: { checkIn: '2026-07-01', checkOut: '2026-07-03', guests: 2 } },
      { userId: user2.id, serviceType: 'guide', serviceId: guideIds[0], providerId: provider2.id, status: 'PENDING', totalAmount: 50000, currency: 'XAF', metadata: { date: '2026-07-10', duration: '2 hours' } },
      { userId: user.id, serviceType: 'restaurant', serviceId: restaurantIds[0], providerId: provider.id, status: 'COMPLETED', totalAmount: 35000, currency: 'XAF', metadata: { date: '2026-05-20', guests: 4 } },
    ],
    skipDuplicates: true,
  })

  // ─── Payments ─────────────────────────────────────────────────────────────
  const bookings = await prisma.booking.findMany({ take: 2 })
  await prisma.payment.createMany({
    data: [
      { bookingId: bookings[0]?.id || '', amount: 45000, currency: 'XAF', provider: 'wallet', status: 'COMPLETED', completedAt: new Date('2026-06-01') },
      { bookingId: bookings[1]?.id || '', amount: 95000, currency: 'XAF', provider: 'mtn_momo', status: 'COMPLETED', completedAt: new Date('2026-06-02') },
    ],
    skipDuplicates: true,
  })

  // ─── Refund Requests ─────────────────────────────────────────────────────
  await prisma.refundRequest.createMany({
    data: [
      { bookingId: bookings[0]?.id || '', amount: 45000, currency: 'XAF', reason: 'Flight cancelled by airline', status: 'APPROVED', completedDate: new Date('2026-06-05') },
    ],
    skipDuplicates: true,
  })

  // ─── Visa Applications ────────────────────────────────────────────────────
  await prisma.visaApplication.createMany({
    data: [
      { userId: user.id, countryCode: 'FR', countryName: 'France', status: 'APPROVED', applicantData: { fullName: 'Jean Dupont', passportNumber: 'AB1234567', nationality: 'CM' }, processingFee: 50000 },
      { userId: user2.id, countryCode: 'US', countryName: 'United States', status: 'PROCESSING', applicantData: { fullName: 'Sophie Martin', passportNumber: 'CD9876543', nationality: 'FR' }, processingFee: 75000 },
    ],
    skipDuplicates: true,
  })

  // ─── Reviews ─────────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { userId: user.id, serviceId: hotelIds[0], rating: 5, comment: 'Excellent séjour, personnel très professionnel' },
      { userId: user2.id, serviceId: guideIds[0], rating: 4.5, comment: 'Guide très compétent, safari inoubliable' },
      { userId: user.id, serviceId: restaurantIds[0], rating: 4, comment: 'Bonne cuisine mais service un peu lent' },
    ],
    skipDuplicates: true,
  })

  // ─── Conversations & Messages ─────────────────────────────────────────────
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      providerId: provider.id,
      lastMessage: 'Bonjour, je voudrais réserver une chambre pour le mois prochain',
      lastMessageAt: new Date(),
    },
  })

  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, senderId: user.id, senderType: 'user', text: 'Bonjour, je voudrais réserver une chambre pour le mois prochain' },
      { conversationId: conversation.id, senderId: providerUser.id, senderType: 'provider', text: 'Bonjour! Quelle période exactement et combien de personnes?' },
    ],
    skipDuplicates: true,
  })

  // ─── Videos ───────────────────────────────────────────────────────────────
  const videos = [
    { title: 'Kribi - Le paradis camerounais', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', destination: 'Kribi', country: 'Cameroun', likes: 1240, views: 45000 },
    { title: 'Safari au Parc de Waza', videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw', thumbnailUrl: 'https://images.unsplash.com/photo-1535083783855-ded51a20380a?w=400', destination: 'Waza', country: 'Cameroun', likes: 890, views: 32000 },
    { title: 'Yaoundé - Ville des Collines', videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk', thumbnailUrl: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=400', destination: 'Yaoundé', country: 'Cameroun', likes: 560, views: 18000 },
    { title: 'Mont Cameroun - L\'ascension', videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0', thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', destination: 'Buea', country: 'Cameroun', likes: 2100, views: 78000 },
    { title: 'Limbe - Ville des Plages Volcaniques', videoUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8', thumbnailUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400', destination: 'Limbe', country: 'Cameroun', likes: 780, views: 22000 },
    { title: 'Bafoussam - Cœur des Grassfields', videoUrl: 'https://www.youtube.com/embed/OPf0YbXqDm0', thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', destination: 'Bafoussam', country: 'Cameroun', likes: 450, views: 15000 },
  ]

  for (const v of videos) {
    const existing = await prisma.video.findFirst({ where: { title: v.title } })
    if (!existing) await prisma.video.create({ data: v })
  }

  // ─── Notifications ───────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: 'system', title: 'Bienvenue sur Traveo!', message: 'Découvrez les meilleures destinations d\'Afrique et du monde.' },
      { userId: user.id, type: 'booking', title: 'Réservation confirmée', message: 'Votre vol QC101 a été confirmé avec succès.' },
      { userId: user2.id, type: 'visa', title: 'Visa en cours de traitement', message: 'Votre demande de visa pour les États-Unis est en cours.' },
    ],
    skipDuplicates: true,
  })

  // ─── Chat Messages ───────────────────────────────────────────────────────
  await prisma.chatMessage.createMany({
    data: [
      { userId: user.id, message: 'Comment fonctionne le remboursement?', response: 'Les remboursements sont traités sous 5-7 jours ouvrables selon le mode de paiement.' },
      { userId: user2.id, message: 'Puis-je modifier ma réservation?', response: 'Oui, vous pouvez modifier votre réservation jusqu\'à 24h avant le départ.' },
    ],
    skipDuplicates: true,
  })

  // ─── Documents ───────────────────────────────────────────────────────────
  await prisma.document.createMany({
    data: [
      { userId: user.id, fileName: 'passport_copy.pdf', fileSize: 2048576, category: 'passport' },
      { userId: user2.id, fileName: 'visa_application.pdf', fileSize: 1048576, category: 'visa' },
    ],
    skipDuplicates: true,
  })

  // ─── Growth & Monetization ───────────────────────────────────────────────
  await prisma.promotion.createMany({
    data: [
      {
        code: 'SUMMER20',
        description: '20% de réduction sur tous les vols cet été',
        discount: 20,
        discountType: 'PERCENTAGE',
        minPurchase: 50000,
        maxDiscount: 100000,
        usageLimit: 100,
        usedCount: 15,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        status: 'ACTIVE',
        applicableTo: ['flights'],
        metadata: { season: 'summer' },
      },
      {
        code: 'HOTEL15',
        description: '15% de réduction sur les hôtels 4 étoiles et plus',
        discount: 15,
        discountType: 'PERCENTAGE',
        minPurchase: 100000,
        maxDiscount: 150000,
        usageLimit: 50,
        usedCount: 8,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-12-31'),
        status: 'ACTIVE',
        applicableTo: ['hotels'],
        metadata: { minStars: 4 },
      },
      {
        code: 'WELCOME10',
        description: '10% de réduction pour votre première réservation',
        discount: 10,
        discountType: 'PERCENTAGE',
        minPurchase: 20000,
        maxDiscount: 50000,
        usageLimit: 1000,
        usedCount: 245,
        startDate: new Date('2026-01-01'),
        endDate: null,
        status: 'ACTIVE',
        applicableTo: ['flights', 'hotels', 'events', 'guides', 'restaurants', 'transfers'],
        metadata: { firstBooking: true },
      },
      {
        code: 'EVENTS5000',
        description: '5000 XAF de réduction sur les événements culturels',
        discount: 5000,
        discountType: 'FIXED',
        minPurchase: 30000,
        maxDiscount: null,
        usageLimit: 200,
        usedCount: 42,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-09-30'),
        status: 'ACTIVE',
        applicableTo: ['events'],
        metadata: { category: 'cultural' },
      },
    ],
    skipDuplicates: true,
  })
  // await prisma.partnership.createMany({ data: [...], skipDuplicates: true })
  // await prisma.sponsoredContent.createMany({ data: [...], skipDuplicates: true })

  // ─── Risks, Legal & Moderation ───────────────────────────────────────────
  // Skipping - tables may not be synced yet
  // await prisma.moderationItem.createMany({ data: [...], skipDuplicates: true })
  // await prisma.legalCase.createMany({ data: [...], skipDuplicates: true })
  // await prisma.securityAlert.createMany({ data: [...], skipDuplicates: true })

  // ─── Security Tables ─────────────────────────────────────────────────────
  // Skipping - tables may not be synced yet
  // await prisma.ipBlock.createMany({ data: [...], skipDuplicates: true })
  // await prisma.failedLoginAttempt.createMany({ data: [...], skipDuplicates: true })

  console.log('✅ Comprehensive seeding complete!')
  console.log('   Admin: admin@traveo.cm / admin123')
  console.log('   User:  user@traveo.cm  / user1234')
  console.log('   User2: user2@traveo.cm / user1234')
  console.log('   Pro:   provider@traveo.cm / provider123')
  console.log('   Pro2:  provider2@traveo.cm / provider123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
