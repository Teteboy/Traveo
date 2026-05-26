import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Star, MessageSquare } from 'lucide-react'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { apiClient } from '@/lib/apiClient'

type ProviderReview = {
  id: string
  rating: number
  comment: string
  createdAt: string
  guestName: string
  guestAvatar: string | null
  serviceName?: string | null
}

type ProviderReviewsResponse = {
  page: number
  limit: number
  total: number
  items: ProviderReview[]
}

export function ProviderReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState<number | 'all' | 'unresponded'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const reviewsQuery = useQuery<ProviderReviewsResponse>({
    queryKey: ['provider-reviews', currentPage, pageSize],
    queryFn: () => apiClient.get<ProviderReviewsResponse>(`/providers/reviews?page=${currentPage}&limit=${pageSize}`),
    staleTime: 30 * 1000,
  })

  const reviews = reviewsQuery.data?.items ?? []

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter === 'all') return true
      if (ratingFilter === 'unresponded') return true
      return Math.round(r.rating) === ratingFilter
    })
  }, [ratingFilter, reviews])

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
                    <Button size="sm" variant="outline" disabled>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond
                    </Button>
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
    </div>
  )
}
