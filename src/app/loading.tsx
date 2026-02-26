import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="rounded-xl border bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
        <span className="inline-flex items-center gap-2"><Spinner />Loading...</span>
      </div>
    </div>
  );
}
