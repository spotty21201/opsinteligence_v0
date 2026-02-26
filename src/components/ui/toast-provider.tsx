'use client';

import { create } from 'zustand';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  type: ToastType;
}

interface ToastStore {
  items: ToastItem[];
  push: (title: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (title, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({ items: [...state.items, { id, title, type }] }));
    setTimeout(() => set((state) => ({ items: state.items.filter((item) => item.id !== id) })), 2600);
  },
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export function useToast() {
  return useToastStore((state) => state.push);
}

export function ToastViewport() {
  const items = useToastStore((state) => state.items);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto rounded-xl border bg-white px-3 py-2 text-sm shadow-soft',
            item.type === 'success' && 'border-emerald-200 text-emerald-700',
            item.type === 'error' && 'border-red-200 text-red-700',
            item.type === 'info' && 'border-slate-200 text-slate-700',
          )}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}
