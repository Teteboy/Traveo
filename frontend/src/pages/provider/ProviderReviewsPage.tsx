import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star, MessageSquare, Send } from 'lucide-react'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'

type ProviderReview = {
  id: string
  rating: number
  comment: string
  createdAt: string
  guestName: string
  guestAvatar: string | null
  serviceName?: string | null
  providerResponse?: string | null
  respondedAt?: string | null
}

type ProviderReviewsResponse = {
  page: number
  limit: number
  total: number
  items: ProviderReview[]
}

export function ProviderReviewsPage() {
  const qc = useQueryClient()
  const [ratingFilter, setRatingFilter] = useState<number | 'all' | 'unresponded'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [respondDialogOpen, setRespondDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ProviderReview | null>(null)
  const [responseText, setResponseText] = useState('')

  const reviewsQuery = useQuery<ProviderReviewsResponse>({
    queryKey: ['provider-reviews', currentPage, pageSize],
    queryFn: () => apiClient.get<ProviderReviewsResponse>(`/providers/reviews?page=${currentPage}&limit=${pageSize}`),
    staleTime: 30 * 1000,
  })

  const reviews = reviewsQuery.data?.items ?? []

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter === 'all') return true
      if (ratingFilter === 'unresponded') return !r.providerResponse
      return Math.round(r.rating) === ratingFilter
    })
  }, [ratingFilter, reviews])

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
      apiClient.patch(`/providers/reviews/${reviewId}/response`, { response }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-reviews'] })
      setRespondDialogOpen(false)
      setSelectedReview(null)
      setResponseText('')
      toast.success('Réponse envoyée')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de l\'envoi'),
  })

  const handleOpenRespond = (review: ProviderReview) => {
    setSelectedReview(review)
    setResponseText(review.providerResponse || '')
    setRespondDialogOpen(true)
  }

  const handleSubmitResponse = () => {
    if (!selectedReview || !responseText.trim()) return
    respondMutation.mutate({ reviewId: selectedReview.id, response: responseText.trim() })
  }

  const totalReviews = reviewsQuery.data?.total ?? 0
  const allLoadedRatings = reviews.map((r) => Math.round(r.rating))
  const overallRating = allLoadedRatings.length > 0 ? allLoadedRatings.reduce((acc, n) => acc + n, 0) / allLoadedRatings.length : 0

  const ratingDistribution = {
    5: allLoadedRatings.filter((r) => r === 5).length,
    4: allLoadedRatings.filter((r) => r === 4).length,
    3: allLoadedRatings.filter((r) => r === 3).length,
    2: allLoadedRatings.filter((r) => r === 2).length,
    1: allLoadedRatings.filter((r) => r === 1).length,
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-[#FC960E] text-[#FC960E]' : 'text-slate-300'}`} />
        ))}
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(totalReviews / pageSize))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Guest Reviews</h1>
        <p className="text-slate-500 mt-1">Manage and respond to your guest feedback</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">{overallRating.toFixed(1)}</div>
              {renderStars(Math.round(overallRating))}
              <p className="text-sm text-slate-500 mt-2">{totalReviews} reviews</p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-[#FC960E] text-[#FC960E]" />
                    </div>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-slate-500 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={ratingFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRatingFilter('all')}
          className={ratingFilter === 'all' ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}
        >
          All
        </Button>
        {[5, 4, 3].map((rating) => (
          <Button
            key={rating}
            variant={ratingFilter === rating ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRatingFilter(rating)}
            className={ratingFilter === rating ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}
          >
            {rating} ★
          </Button>
        ))}
        <Button
          variant={ratingFilter === 'unresponded' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRatingFilter('unresponded')}
          className={ratingFilter === 'unresponded' ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}
        >
          Unresponded
        </Button>
      </div>

      {reviewsQuery.isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">Loading reviews...</CardContent>
        </Card>
      )}

      {reviewsQuery.isError && (
        <Card>
          <CardContent className="p-8 text-center text-red-600">Failed to load provider reviews</CardContent>
        </Card>
      )}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.guestAvatar ?? undefined} />
                    <AvatarFallback className="bg-[#44DBD4] text-white">
                      {review.guestName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.guestName}</p>
                        {renderStars(Math.round(review.rating))}
                      </div>
                      <p className="text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    {review.serviceName && <p className="text-sm text-[#44DBD4] mb-2">{review.serviceName}</p>}
                    <p className="text-slate-700 mb-4">{review.comment}</p>
                    {review.providerResponse ? (
                      <div className="bg-slate-50 p-3 rounded-lg mt-3">
                        <p className="text-xs text-slate-500 mb-1">Votre réponse ({new Date(review.respondedAt!).toLocaleDateString('fr-FR')}):</p>
                        <p className="text-sm text-slate-700">{review.providerResponse}</p>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleOpenRespond(review)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Répondre
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && filteredReviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">No reviews found</CardContent>
        </Card>
      )}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && totalReviews > pageSize && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalReviews}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setCurrentPage(1)
            setPageSize(size)
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à l'avis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedReview.guestName}</p>
                <p className="text-sm text-slate-600 mt-1">{selectedReview.comment}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Votre réponse</label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Merci pour votre avis ! Nous sommes ravis que vous ayez apprécié votre séjour..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleSubmitResponse}
              className="bg-[#44DBD4] hover:bg-[#3bc9c2]"
              disabled={respondMutation.isPending || !responseText.trim()}
            >
              {respondMutation.isPending ? 'Envoi...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
