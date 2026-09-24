import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-16 grid md:grid-cols-2 gap-12">
      <Skeleton className="aspect-[4/5]" />
      <div>
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />
        <Skeleton className="h-14 w-72" />
      </div>
    </div>
  );
}
