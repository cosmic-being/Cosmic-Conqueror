import { motion } from 'framer-motion';
import React from 'react';

export function SkeletonLoader({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={`bg-muted/50 rounded-xl overflow-hidden relative ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
      {...props as any}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
    </motion.div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-10 max-w-[1600px] mx-auto space-y-8">
      <SkeletonLoader className="h-32 w-full rounded-[24px]" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-32 rounded-[24px]" />
            ))}
          </div>
          <div className="space-y-4">
             {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} className="h-24 rounded-[20px]" />
            ))}
          </div>
        </div>
        <div className="xl:col-span-1">
          <SkeletonLoader className="h-[400px] rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}

export function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 p-8 max-w-[1600px] mx-auto space-y-8">
      <SkeletonLoader className="h-8 w-64 rounded-lg" />
      <SkeletonLoader className="h-64 w-full rounded-[24px]" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0 space-y-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1">
          <SkeletonLoader className="h-[600px] w-full rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
