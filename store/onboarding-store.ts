import { create } from "zustand";

interface OnboardingStore {
  pendingGeneration: boolean;
  setPendingGeneration: (value: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  pendingGeneration: false,
  setPendingGeneration: (value) => set({ pendingGeneration: value }),
}));