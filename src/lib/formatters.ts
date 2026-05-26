// Date formatting helpers
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
}

export function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function formatDateTime(datetime: string | Date): string {
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Price formatting
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Duration formatting (from minutes)
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins.toString().padStart(2, '0')}min`
}

// Status badge text
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'Confirmé',
    'pending': 'En attente',
    'cancelled': 'Annulé',
    'completed': 'Terminé',
    'approved': 'Approuvé',
    'rejected': 'Rejeté',
    'processing': 'En traitement',
    'paid': 'Payé',
    'refunded': 'Remboursé',
    'failed': 'Échoué'
  }
  return statusMap[status] || status
}

// Booking type labels
export function getBookingTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'flight': 'Vol',
    'hotel': 'Hôtel',
    'event': 'Événement',
    'guide': 'Guide',
    'transfer': 'Transfert',
    'restaurant': 'Restaurant'
  }
  return typeMap[type] || type
}
