import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-1/3" />
        <LoadingSkeleton className="h-4 w-2/3" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <LoadingSkeleton className="h-48 w-full" />
            <LoadingSkeleton className="h-6 w-3/4" />
            <LoadingSkeleton className="h-4 w-1/2" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
