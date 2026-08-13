// stores/useSelectedCut.ts
import { create } from "zustand";


type SelectedCutStore = {
  selectedCut: string | null;
  setSelectedCut: (cut: string) => void;
  clearSelectedCut: () => void;
};

export const useSelectedCutStore = create<SelectedCutStore>((set) => ({
  selectedCut: null,
  setSelectedCut: (cut) => set({ selectedCut: cut }),
  clearSelectedCut: () => set({ selectedCut: null }),
}));