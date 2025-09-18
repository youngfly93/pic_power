'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Download, 
  Eye, 
  Copy, 
  Share2, 
  Heart,
  MoreHorizontal,
  Calendar,
  Palette
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { GeneratedImage } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingGallery } from './loading-gallery';

interface ImageGalleryProps {
  className?: string;
}

export function ImageGallery({ className }: ImageGalleryProps) {
  const { currentImages, isGenerating } = useAppStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleDownload = (image: GeneratedImage) => {
    const encodedUrl = encodeURIComponent(image.url);
    const filename = encodeURIComponent(`ai-generated-${image.id}.png`);
    const a = document.createElement('a');
    a.href = `/api/download?url=${encodedUrl}&filename=${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.message('开始下载...', { description: '如未自动开始，请检查浏览器弹窗/下载设置' });
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('提示词已复制到剪贴板');
  };

  const toggleFavorite = (imageId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
  };

  if (isGenerating && currentImages.length === 0) {
    return <LoadingGallery className={className} expectedCount={1} />;
  }

  if (currentImages.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">还没有生成的图片</h3>
        <p className="text-muted-foreground">
          在上方输入您的创意描述，开始生成第一张图片吧！
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">生成结果</h2>
        <Badge variant="secondary">
          {currentImages.length} 张图片
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {currentImages.map((image) => (
          <Card key={image.id} className="group overflow-hidden image-gallery-card">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] min-h-[300px] md:min-h-[400px]">
                <Image
                  src={image.url}
                  alt={image.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* 悬浮操作按钮 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleFavorite(image.id)}
                      >
                        <Heart 
                          className={cn(
                            "h-4 w-4",
                            favorites.has(image.id) && "fill-red-500 text-red-500"
                          )} 
                        />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>

              {/* 图片信息 */}
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.prompt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {image.createdAt.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {image.size}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {image.model.split('-')[1]}
                  </Badge>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    下载
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyPrompt(image.prompt)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图片详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>图片详情</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="relative w-full max-h-[70vh] flex items-center justify-center image-preview-container rounded-lg">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    width={800}
                    height={800}
                    className="object-contain max-h-[70vh] w-auto h-auto"
                    sizes="(max-width: 768px) 100vw, 90vw"
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
