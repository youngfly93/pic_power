// 全局状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, GeneratedImage, GenerationHistory, ImageGenerationForm } from '@/types/api';
import { ImageGenerationAPI, DEFAULT_CONFIG } from '@/lib/api';

interface AppStore extends AppState {
  // Actions
  setPrompt: (prompt: string) => void;
  setSize: (size: '1K' | '2K' | '4K' | '1024x1024' | '1024x1536' | '1536x1024' | '1664x936' | '936x1664' | 'adaptive') => void;
  setModel: (model: string) => void;
  setMode: (mode: 'text-to-image' | 'image-to-image' | 'local-edit') => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Image generation
  generateImages: (form: ImageGenerationForm) => Promise<void>;
  addToHistory: (history: GenerationHistory) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  clearAllData: () => void;

  // UI state
  setGenerating: (isGenerating: boolean) => void;
  setCurrentImages: (images: GeneratedImage[]) => void;
  addCurrentImage: (image: GeneratedImage) => void;
  clearCurrentImages: () => void;
}

// 存储配置 - 限制历史记录数量避免配额超限
const MAX_HISTORY_ITEMS = 20;
const MAX_CURRENT_IMAGES = 8;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isGenerating: false,
      currentPrompt: '',
      selectedSize: DEFAULT_CONFIG.size,
      selectedModel: DEFAULT_CONFIG.model,
      history: [],
      currentImages: [],
      error: null,
      mode: 'text-to-image',

      // Actions
      setPrompt: (prompt) => set({ currentPrompt: prompt }),
      setSize: (size) => set({ selectedSize: size }),
      setModel: (model) => set({ selectedModel: model }),
      setMode: (mode) => set({ mode }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setCurrentImages: (images) => set({
        currentImages: images.slice(0, MAX_CURRENT_IMAGES)
      }),
      addCurrentImage: (image) => set((state) => ({
        currentImages: [...state.currentImages, image].slice(0, MAX_CURRENT_IMAGES)
      })),
      clearCurrentImages: () => set({ currentImages: [] }),

      addToHistory: (history) => set((state) => ({
        history: [history, ...state.history].slice(0, MAX_HISTORY_ITEMS)
      })),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),
      clearAllData: () => set({
        history: [],
        currentImages: [],
        error: null,
        isGenerating: false,
      }),

      generateImages: async (form) => {
        const { setGenerating, setError, clearError, addToHistory, setCurrentImages } = get();

        const historyId = `gen_${Date.now()}`;

        try {
          setGenerating(true);
          clearError();
          setCurrentImages([]);

          // 处理参考图片（如果是图片编辑模式）
          let imageUrls: string[] = [];
          if (form.mode === 'image-to-image' && form.referenceImages) {
            // 将文件转换为base64
            imageUrls = await Promise.all(
              form.referenceImages.map(file => {
                return new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    resolve(result);
                  };
                  reader.readAsDataURL(file);
                });
              })
            );
          }

          const historyItem: GenerationHistory = {
            id: historyId,
            prompt: form.prompt,
            images: [],
            createdAt: new Date(),
            status: 'pending',
            type: form.mode,
            sourceImages: imageUrls,
          };

          addToHistory(historyItem);

          const request = {
            model: form.model,
            prompt: form.prompt,
            size: form.size,
            watermark: form.watermark,
            response_format: 'url' as const,
            n: form.maxImages,
            ...(form.mode === 'image-to-image' && imageUrls.length > 0 && {
              image: imageUrls,
            }),
            ...(form.seed !== undefined && form.seed !== -1 && {
              seed: form.seed,
            }),
          };

          const response = await ImageGenerationAPI.generateImages(request);

          const generatedImages: GeneratedImage[] = response.data.map((item, index) => ({
            id: `${historyId}_${index}`,
            url: item.url || '',
            prompt: form.prompt,
            revisedPrompt: item.revised_prompt,
            createdAt: new Date(),
            size: form.size,
            model: form.model,
            type: form.mode,
            sourceImages: imageUrls,
          }));

          setCurrentImages(generatedImages);

          // Update history with completed images
          set((state) => ({
            history: state.history.map(h => 
              h.id === historyId 
                ? { ...h, images: generatedImages, status: 'completed' as const }
                : h
            )
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '生成图片时发生未知错误';
          setError(errorMessage);
          
          // Update history with error status
          set((state) => ({
            history: state.history.map(h => 
              h.id === historyId 
                ? { ...h, status: 'failed' as const, error: errorMessage }
                : h
            )
          }));
        } finally {
          setGenerating(false);
        }
      },
    }),
    {
      name: 'pic-power-storage',
      partialize: (state) => ({
        history: state.history,
        selectedSize: state.selectedSize,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
