export const designTokens = {
  typography: {
    primary: 'Inter',
    accent: 'Instrument Serif',
  },
  colors: {
    bg: '#FFFFFF',
    surface: '#F6F7F9',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    brandPrimary: '#1D498B',
    brandSecondary: '#36787D',
    brandSoft: '#EAEFF4',
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
  Working: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Mobilizing: 'bg-blue-50 text-blue-800 border-blue-200',
  Idle: 'bg-amber-50 text-amber-800 border-amber-200',
  Maintenance: 'bg-red-50 text-red-800 border-red-200',
  Survey: 'bg-violet-50 text-violet-800 border-violet-200',
  Standby: 'bg-amber-50 text-amber-800 border-amber-200',
  Lokasi: 'bg-slate-100 text-slate-700 border-slate-200',
  Perakitan: 'bg-teal-50 text-teal-700 border-teal-200',
  Operasi: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Disposal: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  Mobilisasi: 'bg-blue-50 text-blue-800 border-blue-200',
  Planned: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  Active: 'bg-blue-50 text-blue-800 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};
