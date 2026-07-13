import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-white/5 rounded-xl ${className}`} />
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0B0F1A] border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 space-y-6 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};
