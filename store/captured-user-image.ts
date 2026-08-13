import { create } from "zustand";

type userImageState = {
    capturedUserImage: string | null;
    setCapturedUserImage: (userImage: string) => void;
    clearCapturedUserImage: () => void;
}

export const useCapturedUserImageStore = create<userImageState>((set) => ({
    capturedUserImage: null,
    setCapturedUserImage: (userImage) => set({ capturedUserImage: userImage }),
    clearCapturedUserImage: () => set({ capturedUserImage: null }),
}));