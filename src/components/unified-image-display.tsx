'use client';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Palette } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { GeneratedImage } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GeneratingState } from '@/components/display/generating-state';
import { EmptyState } from '@/components/display/empty-state';
import { ImageResultCard } from '@/components/display/image-result-card';

interface UnifiedImageDisplayProps {
  className?: string;
}

export function UnifiedImageDisplay({ className }: UnifiedImageDisplayProps) {
  const { currentImages, isGenerating } = useAppStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  // 模拟进度更新
  React.useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isGenerating]);

  const handleDownload = (imageUrlOrImage: string | GeneratedImage, type?: 'before' | 'after') => {
    let urlToFetch: string;
    let filename: string;

    if (typeof imageUrlOrImage === 'string') {
      urlToFetch = imageUrlOrImage;
      filename = `${type === 'before' ? '原图' : 'AI编辑后'}-${Date.now()}.png`;
    } else {
      urlToFetch = imageUrlOrImage.url;
      filename = `ai-generated-${imageUrlOrImage.id}.png`;
    }

    const encoded = encodeURIComponent(urlToFetch);
    const encodedName = encodeURIComponent(filename);
    const a = document.createElement('a');
    a.href = `/api/download?url=${encoded}&filename=${encodedName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.message('开始下载...', { description: '如未自动开始，请检查浏览器弹窗/下载设置' });
  };

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
        toast.success('已取消收藏');
      } else {
        newFavorites.add(imageId);
        toast.success('已添加到收藏');
      }
      return newFavorites;
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 标题区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {isGenerating ? 'AI 正在创作中...' : '生成结果'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating ? '请耐心等待，精彩即将呈现' : `${currentImages.length} 张图片`}
            </p>
          </div>
        </div>
        {currentImages.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {currentImages.length} 张图片
          </Badge>
        )}
      </div>

      {/* 生成中状态 */}
      {isGenerating && <GeneratingState progress={progress} />}

      {/* 图片展示区域 */}
      {currentImages.length > 0 && (
        <div className="space-y-6">
          {currentImages.map((image) => (
            <ImageResultCard
              key={image.id}
              image={image}
              isFavorite={favorites.has(image.id)}
              onToggleFavorite={toggleFavorite}
              onPreview={(img) => setSelectedImage(img)}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isGenerating && currentImages.length === 0 && (
        <EmptyState />
      )}

      {/* 图片详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>图片详情</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="relative w-full flex items-center justify-center image-preview-container rounded-lg p-4">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    className="object-contain max-h-[70vh] w-auto h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">提示词</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.prompt}
                    </p>
                  </div>
                  {selectedImage.revisedPrompt && (
                    <div>
                      <h4 className="font-semibold mb-1">优化后的提示词</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedImage.revisedPrompt}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span><strong>尺寸:</strong> {selectedImage.size}</span>
                    <span><strong>模型:</strong> {selectedImage.model}</span>
                    <span><strong>创建时间:</strong> {selectedImage.createdAt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
