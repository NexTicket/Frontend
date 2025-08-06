import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circular';
  lines?: number;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'default',
  lines = 1 
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-full h-12 w-12"></div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index} 
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

// Shimmer effect component
export function ShimmerEffect({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  );
}
