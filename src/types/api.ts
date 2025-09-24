// 即梦API相关类型定义

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  image?: string[];
  n?: number;
  sequential_image_generation?: 'auto' | 'manual';
  sequential_image_generation_options?: {
    max_images: number;
  };
  response_format?: 'url' | 'b64_json';
  size?: '1K' | '2K' | '4K' | '1024x1024' | '1024x1536' | '1536x1024' | '1664x936' | '936x1664' | 'adaptive';
  stream?: boolean;
  watermark?: boolean;
  seed?: number;
}


export interface ImageEditRequest {
  model: string;
  prompt: string;
  size?: '1K' | '2K' | '4K' | '1024x1024' | '1024x1536' | '1536x1024' | '1664x936' | '936x1664' | 'adaptive';
  // base64 data URL of the original image(s)
  image: string[];
  // base64 data URL of the mask (white=keep/black=edit，或相反，视服务而定)
  mask: string;
  response_format?: 'url' | 'b64_json';
  n?: number;
  watermark?: boolean;
  seed?: number;
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// 应用状态类型
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  revisedPrompt?: string;
  createdAt: Date;
  size: string;
  model: string;
  type?: 'text-to-image' | 'image-to-image' | 'local-edit';
  sourceImages?: string[];
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  images: GeneratedImage[];
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  type?: 'text-to-image' | 'image-to-image' | 'local-edit';
  sourceImages?: string[];
}

// UI状态类型
export interface AppState {
  isGenerating: boolean;
  currentPrompt: string;
  selectedSize: '1K' | '2K' | '4K' | '1024x1024' | '1024x1536' | '1536x1024' | '1664x936' | '936x1664' | 'adaptive';
  selectedModel: string;
  history: GenerationHistory[];
  currentImages: GeneratedImage[];
  error: string | null;
  mode: 'text-to-image' | 'image-to-image' | 'local-edit';
}

// 表单类型
export interface ImageGenerationForm {
  prompt: string;
  size: '1K' | '2K' | '4K' | '1024x1024' | '1024x1536' | '1536x1024' | '1664x936' | '936x1664' | 'adaptive';
  model: string;
  maxImages: number;
  watermark: boolean;
  referenceImages?: File[]; // image-to-image 模式
  mode: 'text-to-image' | 'image-to-image' | 'local-edit';
  seed?: number;
  // 以下为 local-edit 模式专用
  baseImageDataUrl?: string;
  maskImageDataUrl?: string;
  localEditRect?: { x: number; y: number; width: number; height: number };
}
