"use client";

import Image from "next/image";
import { useState } from "react";

interface AdminImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: string;
}

export const AdminImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  fallback = "/placeholder.svg"
}: AdminImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Use fallback if no src, or if there was an error
  const imageSrc = hasError || !src ? fallback : src;

  return (
    <div className="relative">
      {isLoading && !hasError && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
};
