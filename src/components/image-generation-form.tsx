'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sparkles,
  Image as ImageIcon,
  Settings,
  Wand2,
  Loader2,
  Edit3,
  Crop
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { AVAILABLE_MODELS, AVAILABLE_SIZES } from '@/lib/api';
import { ImageGenerationForm } from '@/types/api';
import { ImageUpload } from './image-upload';
import { RegionSelectorCanvas } from './region-selector-canvas';

export function ImageGenerationFormComponent() {
  const {
    currentPrompt,
    selectedSize,
    selectedModel,
    isGenerating,
    error,
    mode,
    setPrompt,
    setSize,
    setModel,
    setMode,
    generateImages,
    clearError,
  } = useAppStore();

  const [maxImages, setMaxImages] = useState(1);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [seed, setSeed] = useState<number>(-1);
  const [localBasePreview, setLocalBasePreview] = useState<string | null>(null);
  const [localMaskPreview, setLocalMaskPreview] = useState<string | null>(null);
  const [localMaskRect, setLocalMaskRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const watermark = false; // 确保无水印

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPrompt.trim()) {
      return;
    }

    // 图片编辑模式需要有参考图片
    if (mode === 'image-to-image' && referenceImages.length === 0) {
      return;
    }

    // 局部重绘：需要基图与遮罩，提交 /images/edits
    if (mode === 'local-edit') {
      if (!localBasePreview || !localMaskPreview || !localMaskRect) return;
      const form: ImageGenerationForm = {
        prompt: currentPrompt,
        size: selectedSize,
        model: selectedModel,
        maxImages,
        watermark,
        mode: 'local-edit',
        seed: seed === -1 ? undefined : seed,
        baseImageDataUrl: localBasePreview,
        maskImageDataUrl: localMaskPreview,
        localEditRect: localMaskRect,
      };
      await generateImages(form);
      return;
    }

    // 防止用户上传了参考图后误切换到“文生图”再点击生成
    // 只要存在参考图片就按图片编辑模式提交
    const modeForSubmit: 'text-to-image' | 'image-to-image' =
      referenceImages.length > 0 || mode === 'image-to-image'
        ? 'image-to-image'
        : 'text-to-image';

    const form: ImageGenerationForm = {
      prompt: currentPrompt,
      size: selectedSize,
      model: selectedModel,
      maxImages,
      watermark,
      referenceImages: modeForSubmit === 'image-to-image' ? referenceImages : undefined,
      mode: modeForSubmit,
      seed: seed === -1 ? undefined : seed,
    };

    await generateImages(form);
  };

  const textToImageSuggestions = [
    '一只可爱的小猫在花园里玩耍',
    '未来科技城市的夜景',
    '水彩画风格的山水风景',
    '卡通风格的宇宙飞船',
    '油画风格的向日葵田',
  ];

  const imageToImageSuggestions = [
    '把天空换成粉紫色日落，保留主体人物与服装细节',
    '将背景替换为星空，并增强文字清晰度',
    '改变为水彩画风格，保持原有构图',
    '添加雪花效果，营造冬日氛围',
    '转换为油画风格，增强色彩饱和度',
  ];

  const currentSuggestions = mode === 'text-to-image' ? textToImageSuggestions : imageToImageSuggestions;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary" />
          AI 图片生成
        </CardTitle>
        <p className="text-muted-foreground">
          创建全新图片或基于现有图片进行编辑
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 模式切换 */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'text-to-image' | 'image-to-image' | 'local-edit')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text-to-image" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              文生图
            </TabsTrigger>
            <TabsTrigger value="image-to-image" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              图片编辑
            </TabsTrigger>
            <TabsTrigger value="local-edit" className="flex items-center gap-2">
              <Crop className="h-4 w-4" />
              局部编辑（原型）
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="image-to-image" className="mt-0">
              <ImageUpload
                onImagesChange={setReferenceImages}
                maxImages={4}
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="local-edit" className="mt-0 space-y-4">
              <ImageUpload
                onImagesChange={(files) => {
                  setReferenceImages(files);
                  setLocalMaskPreview(null);
                  setLocalMaskRect(null);
                }}
                onPreviewsUpdate={(previews) => {
                  setLocalBasePreview(previews[0] || null);
                }}
                maxImages={1}
                disabled={isGenerating}
              />
              {localBasePreview && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    拖拽选择局部区域后会自动导出白/黑遮罩，必要时点击“重新生成遮罩”微调；遮罩就绪后即可点击下方按钮进行局部重绘。
                  </p>
                  <RegionSelectorCanvas
                    imageSrc={localBasePreview}
                    onMaskChange={(maskUrl, rect) => { setLocalMaskPreview(maskUrl); setLocalMaskRect(rect); }}
                  />
                </div>
              )}
            </TabsContent>
            {/* 提示词输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                {mode === 'text-to-image' ? '描述您想要的图片' : '描述您希望的修改效果'}
              </label>
              <Textarea
                placeholder={
                  mode === 'text-to-image'
                    ? "例如：一只可爱的小猫在花园里玩耍，阳光明媚，水彩画风格..."
                    : "例如：把天空换成粉紫色日落，保留主体人物与服装细节..."
                }
                value={currentPrompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) clearError();
                }}
                className="min-h-[100px] resize-none"
                disabled={isGenerating}
              />

              {/* 提示词建议 */}
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>

          {/* 设置选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 图片尺寸 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                图片尺寸
              </label>
              <Select value={selectedSize} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SIZES.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <div className="flex flex-col">
                        <span>{size.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {size.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 生成数量 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                生成数量
              </label>
              <Select value={maxImages.toString()} onValueChange={(v) => setMaxImages(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} 张图片
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 高级设置 */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <label className="text-sm font-medium">高级设置</label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* 种子值 */}
              <div className="space-y-2">
                <Label className="text-sm">种子值 (Seed)</Label>
                <Select value={seed.toString()} onValueChange={(v) => setSeed(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">随机 (-1)</SelectItem>
                    <SelectItem value="42">固定 (42)</SelectItem>
                    <SelectItem value="123">固定 (123)</SelectItem>
                    <SelectItem value="456">固定 (456)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  相同种子值会产生相似的结果
                </p>
              </div>
            </div>
          </div>

          {/* 模型选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI 模型</label>
            <Select value={selectedModel} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 生成按钮 */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              isGenerating ||
              !currentPrompt.trim() ||
              (mode === 'image-to-image' && referenceImages.length === 0) ||
              (mode === 'local-edit' && (!localBasePreview || !localMaskPreview))
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'text-to-image' ? '正在生成图片...' : '正在编辑图片...'}
              </>
            ) : (
              <>
                {mode === 'text-to-image' ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成图片
                  </>
                ) : mode === 'local-edit' ? (
                  <>
                    <Crop className="mr-2 h-4 w-4" />
                    生成局部重绘
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    编辑图片
                  </>
                )}
              </>
            )}
          </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
