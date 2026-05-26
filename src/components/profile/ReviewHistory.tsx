import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle, Edit, Trash2, MoreVertical, Plane, Building, Calendar, Utensils, Plus, Loader2, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  type: 'flight' | 'hotel' | 'event' | 'restaurant'
  name: string
  image?: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  reply?: {
    author: string
    date: string
    content: string
  }
}

const mockReviews: Review[] = [
  {
    id: 'rev1',
    type: 'hotel',
    name: 'Hôtel Royal Beach',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200',
    rating: 5,
    title: 'Séjour exceptionnel!',
    comment: 'Vue magnifique sur l\'océan, service impeccable et personnel très attentionné. Je recommande vivement!',
    date: '2024-02-15',
    helpful: 12,
    reply: {
      author: 'Hôtel Royal Beach',
      date: '2024-02-16',
      content: 'Merci pour votre avis! Nous sommes ravis que votre séjour ait été exceptionnel. À bientôt!'
    }
  },
  {
    id: 'rev2',
    type: 'flight',
    name: 'Air France - Paris vers Tokyo',
    rating: 4,
    title: 'Bon vol, service correct',
    comment: 'Vol confortable, repas corrects. Un peu de retard au décollage mais rien de grave.',
    date: '2024-01-28',
    helpful: 5
  },
  {
    id: 'rev3',
    type: 'event',
    name: 'Festival de la Musique',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf529c15b?w=200',
    rating: 5,
    title: 'Expérience inoubliable',
    comment: 'Organisation parfaite, ambiance géniale et artistes au top! Je reviendrai l\'année prochaine.',
    date: '2024-01-20',
    helpful: 23
  },
  {
    id: 'rev4',
    type: 'restaurant',
    name: 'Le Petit Bistrot',
    rating: 3,
    title: 'Cuisine correcte mais service lent',
    comment: 'Les plats étaient bons mais l\'attente était trop longue. Prix un peu élevé pour la qualité.',
    date: '2024-01-10',
    helpful: 3
  }
]

const typeConfig = {
  flight: {
    label: 'Vol',
    icon: Plane,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  },
  hotel: {
    label: 'Hôtel',
    icon: Building,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100'
  },
  event: {
    label: 'Événement',
    icon: Calendar,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  restaurant: {
    label: 'Restaurant',
    icon: Utensils,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  }
}

export function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [showNewReviewDialog, setShowNewReviewDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({
    type: 'hotel',
    name: '',
    rating: 5,
    title: '',
    comment: ''
  })

  const handleDelete = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const handleSubmitReview = async () => {
    if (!newReview.name || !newReview.title || !newReview.comment) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const review: Review = {
      id: `rev${Date.now()}`,
      type: newReview.type as any,
      name: newReview.name,
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    }

    setReviews(prev => [review, ...prev])
    setIsSubmitting(false)
    setShowNewReviewDialog(false)
    setNewReview({ type: 'hotel', name: '', rating: 5, title: '', comment: '' })
  }

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Mes Avis
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{averageRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length} avis)</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun avis publié</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const config = typeConfig[review.type]
                const TypeIcon = config.icon
                
                return (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Image or Icon */}
                      {review.image ? (
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
                          <TypeIcon className={cn("h-8 w-8", config.color)} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={cn(config.bgColor, config.color)}>
                                {config.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <h4 className="font-semibold">{review.name}</h4>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 my-2">
                          {renderStars(review.rating)}
                          <span className="font-medium">{review.title}</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {review.comment}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            Utile ({review.helpful})
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <MessageCircle className="h-4 w-4" />
                            Répondre
                          </Button>
                          <div className="flex-1" />
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Reply */}
                        {review.reply && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">{review.reply.author}</span>
                              <span className="text-xs text-muted-foreground">{review.reply.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.reply.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Write Review */}
          <div className="mt-6 pt-4 border-t">
            <Button className="w-full" onClick={() => setShowNewReviewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Écrire un nouvel avis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Review Dialog */}
      <Dialog open={showNewReviewDialog} onOpenChange={setShowNewReviewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Écrire un avis</DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec la communauté
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={newReview.type}
                onValueChange={(value) => setNewReview(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Vol</SelectItem>
                  <SelectItem value="hotel">Hôtel</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                placeholder="Nom de l'établissement, compagnie, etc."
                value={newReview.name}
                onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <div className="flex items-center gap-2">
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
                <span className="text-sm text-muted-foreground ml-2">
                  {newReview.rating}/5
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Résumez votre expérience"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                placeholder="Décrivez votre expérience en détail..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewReviewDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmitReview}
              disabled={isSubmitting || !newReview.name || !newReview.title || !newReview.comment}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Publier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}