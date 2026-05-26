import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star, Filter, Search, ThumbsUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { apiClient } from '@/lib/apiClient'

type ReviewType = 'flight' | 'hotel' | 'event' | 'guide' | 'restaurant' | 'transfer'

type UserReviewItem = {
  id: string
  rating: number
  comment: string
  createdAt: string
  service?: {
    name: string
    type: string
    imageUrl: string | null
  } | null
}

type UserReviewsResponse = {
  page: number
  limit: number
  total: number
  items: UserReviewItem[]
}

type Review = {
  id: string
  userName: string
  userAvatar: string
  rating: number
  title: string
  comment: string
  date: string
  type: ReviewType
  itemName: string
  helpful: number
  verified: boolean
}

function toReviewType(value: string | undefined): ReviewType {
  const normalized = (value ?? '').toLowerCase()
  if (normalized === 'flight' || normalized === 'hotel' || normalized === 'event' || normalized === 'guide' || normalized === 'restaurant' || normalized === 'transfer') {
    return normalized
  }
  return 'event'
}

export function ReviewsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const reviewsQuery = useQuery<UserReviewsResponse>({
    queryKey: ['my-reviews'],
    queryFn: () => apiClient.get<UserReviewsResponse>('/reviews?limit=100'),
    staleTime: 30 * 1000,
  })

  const reviews = useMemo<Review[]>(() => {
    return (reviewsQuery.data?.items ?? []).map((item) => ({
      id: item.id,
      userName: 'Vous',
      userAvatar: '',
      rating: Math.round(item.rating),
      title: item.comment.length > 60 ? `${item.comment.slice(0, 60)}...` : item.comment || 'Avis',
      comment: item.comment,
      date: item.createdAt,
      type: toReviewType(item.service?.type),
      itemName: item.service?.name ?? 'Service',
      helpful: 0,
      verified: true,
    }))
  }, [reviewsQuery.data?.items])

  const filteredReviews = reviews.filter((review) => {
    const matchesFilter = selectedFilter === 'all' || review.type === selectedFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      review.title.toLowerCase().includes(q) ||
      review.comment.toLowerCase().includes(q) ||
      review.itemName.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes Avis</h1>
        <p className="text-muted-foreground">Partagez vos expériences et aidez les autres voyageurs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} avis au total</p>
              </div>

              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" disabled>Écrire un avis</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un avis..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setCurrentPage(1)
                      setSearchQuery(e.target.value)
                    }}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={selectedFilter}
            onValueChange={(v) => {
              setCurrentPage(1)
              setSelectedFilter(v)
            }}
          >
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="flight">Vols</TabsTrigger>
              <TabsTrigger value="hotel">Hôtels</TabsTrigger>
              <TabsTrigger value="event">Événements</TabsTrigger>
              <TabsTrigger value="guide">Guides</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
              <TabsTrigger value="transfer">Transferts</TabsTrigger>
            </TabsList>
          </Tabs>

          {reviewsQuery.isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Chargement des avis...</p>
              </CardContent>
            </Card>
          )}

          {reviewsQuery.isError && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600">Impossible de charger vos avis</p>
              </CardContent>
            </Card>
          )}

          {!reviewsQuery.isLoading && !reviewsQuery.isError && (
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.userAvatar} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{review.userName}</p>
                              {review.verified && <Badge variant="secondary" className="text-xs">Vérifié</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{new Date(review.date).toLocaleDateString('fr-FR')}</span>
                              <span>•</span>
                              <span>{getTypeLabel(review.type)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm font-medium text-primary">{review.itemName}</p>

                        <div>
                          <h3 className="font-semibold mb-1">{review.title}</h3>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <Button variant="ghost" size="sm" className="gap-2" disabled>
                            <ThumbsUp className="h-4 w-4" />
                            <span>Utile ({review.helpful})</span>
                          </Button>
                          <Button variant="ghost" size="sm" disabled>Signaler</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!reviewsQuery.isLoading && !reviewsQuery.isError && filteredReviews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Aucun avis trouvé</p>
              </CardContent>
            </Card>
          )}

          {!reviewsQuery.isLoading && !reviewsQuery.isError && filteredReviews.length > pageSize && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredReviews.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setCurrentPage(1)
                setPageSize(size)
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flight: 'Vol',
    hotel: 'Hôtel',
    event: 'Événement',
    guide: 'Guide',
    restaurant: 'Restaurant',
    transfer: 'Transfert',
  }
  return labels[type] || type
}
