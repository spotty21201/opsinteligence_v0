export const designTokens = {
  typography: {
    primary: 'Inter',
    accent: 'Source Serif 4',
  },
  colors: {
    bg: '#FFFFFF',
    surface: '#F6F7F9',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    accentOrange: '#F97316',
  },
  status: {
    Working: '#16A34A',
    Mobilizing: '#2563EB',
    Idle: '#F59E0B',
    Maintenance: '#DC2626',
    Survey: '#7C3AED',
    Standby: '#F59E0B',
  },
  component: {
    borderRadius: {
      base: 12,
      large: 16,
    },
  },
} as const;

export const statusTagClasses: Record<string, string> = {
  Working: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Mobilizing: 'bg-blue-50 text-blue-700 border-blue-200',
  Idle: 'bg-amber-50 text-amber-700 border-amber-200',
  Maintenance: 'bg-red-50 text-red-700 border-red-200',
  Survey: 'bg-violet-50 text-violet-700 border-violet-200',
  Standby: 'bg-amber-50 text-amber-700 border-amber-200',
  Lokasi: 'bg-slate-100 text-slate-700 border-slate-200',
  Perakitan: 'bg-orange-50 text-orange-700 border-orange-200',
  Operasi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Disposal: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  Mobilisasi: 'bg-blue-50 text-blue-700 border-blue-200',
  Planned: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  Active: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
