import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center md:items-start justify-start md:grid md:grid-cols-9 gap-8">
        <div className="col-span-4 w-full">
          <LoadingSkeleton className="h-96 w-full" />
        </div>
        <div className="md:col-span-5 w-full space-y-4">
          <LoadingSkeleton className="h-8 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/2" />
          <LoadingSkeleton className="h-6 w-1/4" />
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-1/3" />
        <LoadingSkeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
