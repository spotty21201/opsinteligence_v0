'use client';

import Image from 'next/image';

export function TrisigmaLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/brand/trisigma-logo.png"
      alt="Trisigma Logo"
      width={150}
      height={34}
      className={`h-8 w-auto object-contain ${className}`}
      priority
    />
  );
}
