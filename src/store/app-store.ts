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

          // 分支：局部重绘（无 inpaint，本地裁剪 + 指令编辑 + 合成）
          if (form.mode === 'local-edit') {
            if (!form.baseImageDataUrl || !form.maskImageDataUrl || !form.localEditRect) {
              setError('请先选择基图并生成遮罩');
              setGenerating(false);
              return;
            }

            const historyItem: GenerationHistory = {
              id: historyId,
              prompt: form.prompt,
              images: [],
              createdAt: new Date(),
              status: 'pending',
              type: 'local-edit',
              sourceImages: [form.baseImageDataUrl],
            };
            addToHistory(historyItem);

            const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            });

            // 整图编辑 + 仅在选区合成
            const baseImg = await loadImage(form.baseImageDataUrl);
            const rect = form.localEditRect;

            const baseW = baseImg.naturalWidth || baseImg.width;
            const baseH = baseImg.naturalHeight || baseImg.height;

            // 根据接口约束选择 size：优先用与整图同宽高，若像素不足921600则同比例放大
            const MIN_AREA = 921600;
            const pickSize = (sel: string) => {
              const wxh = sel.match(/^(\d+)x(\d+)$/);
              if (wxh) {
                let w = parseInt(wxh[1], 10), h = parseInt(wxh[2], 10);
                if (w * h < MIN_AREA) {
                  const scale = Math.ceil(Math.sqrt(MIN_AREA / (w * h)));
                  w = w * scale; h = h * scale;
                }
                return `${w}x${h}`;
              }
              // 其他（含 1K/2K/4K/adaptive）统一按整图比例，保证不低于最小像素
              let w = baseW, h = baseH;
              if (w * h < MIN_AREA) {
                const scale = Math.ceil(Math.sqrt(MIN_AREA / (w * h)));
                w = Math.round(w * scale);
                h = Math.round(h * scale);
              }
              return `${w}x${h}`;
            };
            const sizeForEdit = pickSize(form.size);

            // 提示词优化：选框仅用于“指示目标对象”，允许为保持对象完整而略微越界；避免绘制矩形/高亮/遮罩。
            const enhancedPrompt = `参考选框（整图坐标：x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)}）定位其中的主要对象，并按如下要求进行修改：${form.prompt}。选框只是提示，不是硬边界`;

            const request: import('@/types/api').ImageGenerationRequest = {
              model: form.model,
              prompt: enhancedPrompt,
              size: sizeForEdit as import('@/types/api').ArkImageSize,
              watermark: form.watermark,
              response_format: 'b64_json',
              n: 1,
              image: [form.baseImageDataUrl],
              ...(form.seed !== undefined && form.seed !== -1 && { seed: form.seed }),
            };

            const response = await ImageGenerationAPI.generateImages(request);
            const b64 = response.data[0].b64_json || '';
            const fullUrl = `data:image/png;base64,${b64}`;
            const fullImg = await loadImage(fullUrl);

            // 合成：差异驱动的柔和遮罩。让模型可在目标边界略微越界，避免“硬矩形”。
            const PAD = 24; // 额外容差（像素）
            const BLUR_PX = 4; // 遮罩羽化

            // 1) 绘制基图与编辑后整图到缓冲
            const baseBuf = document.createElement('canvas');
            baseBuf.width = baseW; baseBuf.height = baseH;
            const bctx = baseBuf.getContext('2d')!;
            bctx.drawImage(baseImg, 0, 0, baseW, baseH);

            const editBuf = document.createElement('canvas');
            editBuf.width = baseW; editBuf.height = baseH;
            const ectx = editBuf.getContext('2d')!;
            ectx.drawImage(fullImg, 0, 0, fullImg.width, fullImg.height, 0, 0, baseW, baseH);

            // 2) 仅在选框附近计算“变化”蒙版
            const rx0 = Math.max(0, Math.floor(rect.x - PAD));
            const ry0 = Math.max(0, Math.floor(rect.y - PAD));
            const rw2 = Math.min(baseW - rx0, Math.ceil(rect.width + PAD * 2));
            const rh2 = Math.min(baseH - ry0, Math.ceil(rect.height + PAD * 2));

            const baseData = bctx.getImageData(rx0, ry0, rw2, rh2);
            const editData = ectx.getImageData(rx0, ry0, rw2, rh2);
            const maskRoi = new ImageData(rw2, rh2);

            // 阈值区间：更平滑的 alpha（0..1）
            const T0 = 12; // 无视小噪声
            const T1 = 40; // 明显变化
            for (let y1 = 0; y1 < rh2; y1++) {
              for (let x1 = 0; x1 < rw2; x1++) {
                const idx = (y1 * rw2 + x1) * 4;
                const r0 = baseData.data[idx],   g0 = baseData.data[idx+1], b0 = baseData.data[idx+2];
                const r1 = editData.data[idx],   g1 = editData.data[idx+1], b1 = editData.data[idx+2];
                const d = (Math.abs(r1 - r0) + Math.abs(g1 - g0) + Math.abs(b1 - b0)) / 3;
                let a = 0;
                if (d > T0) a = Math.min(1, (d - T0) / (T1 - T0));
                const a255 = Math.round(a * 255);
                maskRoi.data[idx] = 255;
                maskRoi.data[idx+1] = 255;
                maskRoi.data[idx+2] = 255;
                maskRoi.data[idx+3] = a255;
              }
            }

            // 3) 将 ROI 蒙版放到整图蒙版并做羽化
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = baseW; maskCanvas.height = baseH;
            const mctx = maskCanvas.getContext('2d')!;
            const roiCanvas = document.createElement('canvas');
            roiCanvas.width = rw2; roiCanvas.height = rh2;
            const roictx = roiCanvas.getContext('2d')!;
            roictx.putImageData(maskRoi, 0, 0);
            mctx.filter = `blur(${BLUR_PX}px)`;
            mctx.drawImage(roiCanvas, rx0, ry0);
            mctx.filter = 'none';

            // 4) 用蒙版裁剪编辑后的整图
            const regionCanvas = document.createElement('canvas');
            regionCanvas.width = baseW; regionCanvas.height = baseH;
            const rctx = regionCanvas.getContext('2d')!;
            rctx.drawImage(editBuf, 0, 0);
            rctx.globalCompositeOperation = 'destination-in';
            rctx.drawImage(maskCanvas, 0, 0);
            rctx.globalCompositeOperation = 'source-over';

            // 5) 与基图合成
            const outCanvas = document.createElement('canvas');
            outCanvas.width = baseW; outCanvas.height = baseH;
            const octx = outCanvas.getContext('2d')!;
            octx.drawImage(baseBuf, 0, 0);
            octx.drawImage(regionCanvas, 0, 0);
            const mergedUrl = outCanvas.toDataURL('image/png');

            const generatedImages: GeneratedImage[] = [{
              id: `${historyId}_0`,
              url: mergedUrl,
              prompt: form.prompt,
              revisedPrompt: response.data[0].revised_prompt,
              createdAt: new Date(),
              size: form.size,
              model: form.model,
              type: 'local-edit',
              sourceImages: [form.baseImageDataUrl],
            }];

            setCurrentImages(generatedImages);
            set((state) => ({
              history: state.history.map(h =>
                h.id === historyId
                  ? { ...h, images: generatedImages, status: 'completed' as const }
                  : h
              )
            }));
            return;
          }

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
