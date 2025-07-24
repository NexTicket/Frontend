'use client';

import Image from 'next/image';
import { useState } from 'react';

interface EventImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function EventImage({ src, alt, fill, className, priority, width, height }: EventImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    // Fallback to a default image or placeholder
    setImageSrc('/api/placeholder/600/400');
  };

  if (hasError) {
    return (
      <div className={`${className} bg-gray-800 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Image not found</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      unoptimized={true} // Disable Next.js image optimization temporarily
    />
  );
}
