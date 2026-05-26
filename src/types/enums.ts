// Trip booking types
export type BookingType = 'flight' | 'hotel' | 'event' | 'guide' | 'transfer' | 'restaurant'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type PaymentStatus = 'paid' | 'pending' | 'refunded'

// Flight related
export type FlightClass = 'economy' | 'premium_economy' | 'business' | 'first'
export type TripType = 'one_way' | 'round_trip' | 'multi_city'

// Visa related  
export type VisaStatus = 'pending' | 'approved' | 'rejected' | 'processing'
export type DocumentType = 'passport' | 'photo' | 'proof_of_funds' | 'invitation_letter' | 'other'

// Wallet related
export type TransactionType = 'credit' | 'debit'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

// General
export type SortOption = 'price_low' | 'price_high' | 'duration_short' | 'rating_high' | 'popularity'
export type FilterType = 'budget' | 'date' | 'country' | 'category' | 'rating'
