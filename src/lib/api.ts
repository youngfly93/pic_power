// 即梦API集成层
import { ImageGenerationRequest, ImageGenerationResponse, ImageGenerationError } from '@/types/api';

export class ImageGenerationAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: ImageGenerationError = await response.json();
      throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return this.makeRequest<ImageGenerationResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }


}

// 默认配置
export const DEFAULT_CONFIG = {
  model: 'doubao-seedream-4-0-250828',
  size: '2K' as const,
  maxImages: 1,
  watermark: true,
  responseFormat: 'url' as const,
};

// 可用的模型列表
export const AVAILABLE_MODELS = [
  {
    id: 'doubao-seedream-4-0-250828',
    name: 'Seedream 4.0',
    description: '高质量图像生成模型，支持多种风格',
  },
];

// 可用的尺寸选项
export const AVAILABLE_SIZES = [
  { id: '1K', name: '1K (1024x1024)', description: '标准分辨率，生成速度快' },
  { id: '2K', name: '2K (2048x2048)', description: '高分辨率，细节丰富' },
  { id: '4K', name: '4K (4096x4096)', description: '超高分辨率，最佳质量' },
  { id: '1024x1536', name: '竖屏 (1024x1536)', description: '适合手机壁纸和海报' },
  { id: '1536x1024', name: '横屏 (1536x1024)', description: '适合桌面壁纸和横幅' },
  { id: '1664x936', name: '宽屏 (1664x936)', description: '电影比例，适合风景图' },
  { id: '936x1664', name: '长屏 (936x1664)', description: '适合社交媒体故事' },
  { id: 'adaptive', name: '自适应', description: '根据内容自动调整尺寸' },
] as const;
