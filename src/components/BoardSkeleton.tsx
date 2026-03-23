import { Skeleton } from '@/components/ui/skeleton'
import PageTransition from './PageTransition'

export default function BoardSkeleton() {
  return (
    <PageTransition>
      <div className="h-full flex flex-col pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-card p-5 rounded-2xl border gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl hidden md:flex" />
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden px-1 items-start h-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-muted/40 rounded-2xl p-4 w-full md:min-w-[320px] md:w-[320px] border"
            >
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
