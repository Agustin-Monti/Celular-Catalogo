'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Smartphone } from 'lucide-react';

interface AdminImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function AdminImage({ src, alt, size = 'md', className = '' }: AdminImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
        <Smartphone className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1"
        sizes={`${size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}`}
        onError={() => setError(true)}
      />
    </div>
  );
}