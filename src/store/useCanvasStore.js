import { create } from 'zustand';

// Simple structure for layers: { id, name, visible, opacity, dataUrl (optional caching) }
export const useCanvasStore = create((set) => ({
  color: '#c084fc', // Default to primary-light
  brushSize: 5,
  tool: 'brush', // 'brush', 'eraser', 'rectangle', 'circle', 'line'
  layers: [
    { id: 'layer-1', name: 'Background', visible: true, opacity: 1 },
    { id: 'layer-2', name: 'Layer 1', visible: true, opacity: 1 }
  ],
  activeLayerId: 'layer-2',
  
  setColor: (color) => set({ color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setTool: (tool) => set({ tool }),
  
  addLayer: () => set((state) => ({
    layers: [...state.layers, { id: `layer-${Date.now()}`, name: `Layer ${state.layers.length + 1}`, visible: true, opacity: 1 }]
  })),
  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter(layer => layer.id !== id),
    // Switch active layer if current active is deleted
    activeLayerId: state.activeLayerId === id ? (state.layers[0]?.id || null) : state.activeLayerId
  })),
  setActiveLayer: (id) => set({ activeLayerId: id }),
  toggleLayerVisibility: (id) => set((state) => ({
    layers: state.layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
  })),
  setLayerOpacity: (id, opacity) => set((state) => ({
    layers: state.layers.map(layer => layer.id === id ? { ...layer, opacity } : layer)
  })),
  clearCanvas: () => set((state) => ({
    clearTrigger: Date.now() // A trigger we can listen to in CanvasBoard
  })),
  clearTrigger: null,
  
  airDrawEvent: null, // { x: 0-1, y: 0-1, type: 'down' | 'move' | 'up' }
  setAirDrawEvent: (evt) => set({ airDrawEvent: evt }),
  
  isAirDrawEnabled: false,
  toggleAirDraw: () => set((state) => ({ isAirDrawEnabled: !state.isAirDrawEnabled }))
}));
