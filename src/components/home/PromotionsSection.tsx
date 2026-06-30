import { useNavigate } from 'react-router-dom'
import { Tag, Percent, ArrowRight, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePromotions } from '@/hooks/usePromotions'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/formatters'

export function PromotionsSection() {
  const navigate = useNavigate()
  const { data, isLoading } = usePromotions({ page: 1, limit: 4 })
  const promotions = data?.items ?? []

  if (promotions.length === 0 && !isLoading) {
    return null
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-[#44DBD4]/10 to-[#FC960E]/10">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FC960E]/10 rounded-xl">
              <Gift className="h-6 w-6 text-[#FC960E]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#010A09]">Offres Spéciales</h2>
              <p className="text-slate-500">
                Profitez de nos promotions exclusives
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotions.map((promotion) => (
              <Card
                key={promotion.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#FC960E]/20 bg-white"
              >
                <div className="relative h-32 bg-gradient-to-br from-[#44DBD4] to-[#FC960E] flex items-center justify-center">
                  <div className="text-center text-white">
                    {promotion.discountType === 'percentage' ? (
                      <div className="text-4xl font-bold">{promotion.discount}%</div>
                    ) : (
                      <div className="text-4xl font-bold">{formatPrice(promotion.discount, 'XAF')}</div>
                    )}
                    <div className="text-sm opacity-90">de réduction</div>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-white text-[#FC960E] border-0">
                    <Tag className="h-3 w-3 mr-1" />
                    {promotion.code}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-[#010A09] line-clamp-1">
                    {promotion.description}
                  </h3>
                  {promotion.minPurchase > 0 && (
                    <p className="text-sm text-slate-500 mb-3">
                      Min. achat: {formatPrice(promotion.minPurchase, 'XAF')}
                    </p>
                  )}
                  {promotion.usageLimit && (
                    <p className="text-xs text-slate-400 mb-3">
                      {promotion.usageLimit - promotion.usedCount} utilisations restantes
                    </p>
                  )}
                  <Button
                    className="w-full bg-[#FC960E] hover:bg-[#e5860d] text-white"
                    onClick={() => navigate('/discover')}
                  >
                    <Percent className="mr-2 h-4 w-4" />
                    Profiter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
