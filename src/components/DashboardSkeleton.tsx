import { Skeleton } from '@/components/ui/skeleton'
import PageTransition from './PageTransition'

export default function DashboardSkeleton() {
  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        <Skeleton className="h-32 md:h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[320px] lg:col-span-2 w-full rounded-xl shadow-sm" />
          <div className="space-y-6 lg:col-span-1 flex flex-col">
            <Skeleton className="h-[180px] w-full rounded-xl shadow-sm" />
            <Skeleton className="h-[120px] w-full rounded-xl shadow-sm" />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
