'use client';

import Image from 'next/image';
import { useState } from 'react';

export function TrisigmaLogo({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <Image
        src="/brand/trisigma-logo.png"
        alt="Trisigma Logo"
        width={150}
        height={34}
        className={`h-8 w-auto object-contain ${className}`}
        onError={() => setFailed(true)}
        priority
      />
    );
  }

  return (
    <div className={`inline-flex h-8 items-center rounded-full bg-[color:var(--brand-primary)] px-3 text-xs font-semibold tracking-wide text-white ${className}`}>
      TSI
    </div>
  );
}
