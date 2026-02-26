import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium leading-none', className)} {...props}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {props.children}
    </span>
  );
}
