/* Ephemeral view state. Never persisted — if it matters after a refresh,
   it belongs in the account or run save instead. */

import { create } from 'zustand';

export type Screen = 'bridge' | 'roster' | 'hangar' | 'requisition' | 'run' | 'styleguide';

export interface Toast {
  id: number;
  text: string;
  tone: 'neutral' | 'good' | 'bad';
}

interface UiStore {
  screen: Screen;
  selectedHeroId: string | null;
  toasts: Toast[];
  combatLogOpen: boolean;
  setScreen: (screen: Screen) => void;
  selectHero: (id: string | null) => void;
  toast: (text: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  toggleCombatLog: () => void;
}

let toastId = 0;

export const useUi = create<UiStore>((set) => ({
  screen: 'bridge',
  selectedHeroId: null,
  toasts: [],
  combatLogOpen: false,
  setScreen: (screen) => set({ screen }),
  selectHero: (selectedHeroId) => set({ selectedHeroId }),
  toast: (text, tone = 'neutral') => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, text, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleCombatLog: () => set((s) => ({ combatLogOpen: !s.combatLogOpen })),
}));

/** §2.5 — read once, respected everywhere motion is used. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
