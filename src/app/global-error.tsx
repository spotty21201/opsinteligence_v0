'use client';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div className="m-4 rounded-2xl border bg-white p-8 text-center shadow-soft">
          <AlertTriangle className="mx-auto h-6 w-6 text-amber-600" />
          <h2 className="mt-3 text-xl font-semibold">Unexpected error</h2>
          <p className="mt-1 text-sm text-slate-600">Please retry this action.</p>
          <button className="mt-4 rounded-xl border bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white" onClick={() => reset()}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
