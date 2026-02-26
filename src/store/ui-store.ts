'use client';

import { create } from 'zustand';

export type DrawerState =
  | { mode: 'closed'; selectedId: null }
  | { mode: 'asset'; selectedId: string }
  | { mode: 'project'; selectedId: string };

interface UiStore {
  drawer: DrawerState;
  dispatchPrefill: { projectId?: string; assetId?: string } | null;
  search: string;
  filters: {
    region: string;
    serviceLine: string;
    status: string;
    phase: string;
  };
  setDrawer: (next: DrawerState) => void;
  closeDrawer: () => void;
  setDispatchPrefill: (next: { projectId?: string; assetId?: string } | null) => void;
  setSearch: (search: string) => void;
  setFilter: (key: 'region' | 'serviceLine' | 'status' | 'phase', value: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  drawer: { mode: 'closed', selectedId: null },
  dispatchPrefill: null,
  search: '',
  filters: { region: 'All', serviceLine: 'All', status: 'All', phase: 'All' },
  setDrawer: (next) => set({ drawer: next }),
  closeDrawer: () => set({ drawer: { mode: 'closed', selectedId: null } }),
  setDispatchPrefill: (next) => set({ dispatchPrefill: next }),
  setSearch: (search) => set({ search }),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
}));
