'use client';

import Image from 'next/image';

export function TrisigmaLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/brand/trisigma-logo.png"
      alt="Trisigma Logo"
      width={170}
      height={34}
      className={`mt-1 h-[34px] w-auto max-w-[170px] object-contain ${className}`}
      priority
    />
  );
}
