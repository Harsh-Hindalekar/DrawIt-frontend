import { create } from 'zustand';

// Frame structure: { id, layersData: [...] (snapshot of canvas layers state) }
export const useFlipbookStore = create((set, get) => ({
  frames: [
    { id: 'frame-1', dataUrl: null }
  ],
  currentFrameIndex: 0,
  isPlaying: false,
  fps: 12,
  onionSkinEnabled: true,
  
  addFrame: () => set((state) => ({
    frames: [...state.frames, { id: `frame-${Date.now()}`, dataUrl: null }],
    currentFrameIndex: state.frames.length
  })),
  duplicateFrame: (index) => set((state) => {
    const newFrames = [...state.frames];
    const frameToDuplicate = newFrames[index];
    newFrames.splice(index + 1, 0, { id: `frame-${Date.now()}`, dataUrl: frameToDuplicate.dataUrl });
    return { frames: newFrames, currentFrameIndex: index + 1 };
  }),
  deleteFrame: (index) => set((state) => {
    if (state.frames.length <= 1) return state; // don't delete last frame
    const newFrames = state.frames.filter((_, i) => i !== index);
    const newIndex = Math.min(state.currentFrameIndex, newFrames.length - 1);
    return { frames: newFrames, currentFrameIndex: newIndex };
  }),
  setCurrentFrame: (index) => set({ currentFrameIndex: index }),
  setFrameData: (index, dataUrl) => set((state) => {
    const newFrames = [...state.frames];
    if (newFrames[index]) {
      newFrames[index].dataUrl = dataUrl;
    }
    return { frames: newFrames };
  }),
  setFps: (fps) => set({ fps }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  toggleOnionSkin: () => set((state) => ({ onionSkinEnabled: !state.onionSkinEnabled })),
}));
