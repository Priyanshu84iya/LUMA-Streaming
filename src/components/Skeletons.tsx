export function CardSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-lg skeleton" />
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-6 w-48 rounded skeleton" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-36 md:w-44 flex-shrink-0">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute bottom-20 left-6 md:left-16 space-y-4 w-3/4 md:w-1/2">
        <div className="h-10 w-2/3 rounded skeleton" />
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-4/5 rounded skeleton" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-32 rounded-lg skeleton" />
          <div className="h-12 w-32 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div className="px-4 md:px-12 -mt-24 relative space-y-6">
        <div className="flex gap-6">
          <div className="w-40 h-60 rounded-lg skeleton flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-2/3 rounded skeleton" />
            <div className="h-4 w-1/2 rounded skeleton" />
            <div className="h-20 w-full rounded skeleton" />
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-lg skeleton" />
              <div className="h-10 w-28 rounded-lg skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
