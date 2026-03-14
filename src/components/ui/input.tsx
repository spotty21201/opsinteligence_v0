import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('h-10 w-full rounded-xl border border-[rgba(23,58,103,0.12)] bg-[rgba(255,252,247,0.96)] px-3 text-sm text-slate-900 outline-none focus:border-[color:var(--brand-primary)]', className)}
      {...props}
    />
  );
}
