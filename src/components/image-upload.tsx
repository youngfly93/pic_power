'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { toast } from 'sonner';


interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ onImagesChange, maxImages = 4, disabled = false }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const appendImages = useCallback((files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const remaining = Math.max(0, maxImages - uploadedImages.length);
    if (remaining === 0) {
      toast.warning(`已达到最大上传数量 (${maxImages})`);
      return;
    }

    const filesToAdd = validFiles.slice(0, remaining);
    const newImages = [...uploadedImages, ...filesToAdd];
    setUploadedImages(newImages);
    onImagesChange(newImages);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviews((prev) => {
          const updated = [...prev, result];
          return updated.slice(0, maxImages);
        });
      };
      reader.readAsDataURL(file);
    });

    if (filesToAdd.length > 0) {
      toast.success(`已添加 ${filesToAdd.length} 张图片`);
    }
  }, [uploadedImages, maxImages, onImagesChange]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    appendImages(files);
  }, [appendImages]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const items = Array.from(event.clipboardData?.items || []);
    const pastedFiles: File[] = [];

    // 1) 直接粘贴图片（浏览器剪贴板里有 image/*）
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }

    // 2) 粘贴文本（可能是图片 URL 或 data URL）
    if (pastedFiles.length === 0) {
      const text = event.clipboardData?.getData('text')?.trim();
      if (text) {
        try {
          // 简单判断是否可能是图片链接或 data:image
          const looksLikeImageUrl = /^data:image\/|https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(text);
          if (looksLikeImageUrl) {
            const res = await fetch(text);
            const blob = await res.blob();
            if (!blob.type.startsWith('image/')) {
              throw new Error('不是有效的图片');
            }
            const ext = blob.type.split('/')[1] || 'png';
            const file = new File([blob], `pasted-image.${ext}`, { type: blob.type });
            pastedFiles.push(file);
          }
        } catch (err) {
          toast.error('从链接粘贴图片失败，可能被跨域或链接无效');
        }
      }
    }

    if (pastedFiles.length > 0) {
      event.preventDefault();
      appendImages(pastedFiles);
    }
  }, [appendImages, disabled]);

  const removeImage = useCallback((index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setUploadedImages(newImages);
    setPreviews(newPreviews);
    onImagesChange(newImages);
  }, [uploadedImages, previews, onImagesChange]);

  const clearAll = useCallback(() => {
    setUploadedImages([]);
    setPreviews([]);
    onImagesChange([]);
  }, [onImagesChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">参考图片 (可选)</label>
        {uploadedImages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={disabled}
          >
            清空全部
          </Button>
        )}
      </div>

      {/* 上传区域 */}
      <div className="relative" onPaste={handlePaste} tabIndex={0} aria-label="上传图片区域（支持粘贴）">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || uploadedImages.length >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="image-upload"
        />
        <Card className={`border-2 border-dashed transition-colors ${
          disabled || uploadedImages.length >= maxImages
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}>
          <CardContent className="p-0">
            {previews.length > 0 ? (
              <div className="relative w-full flex items-center justify-center bg-muted/10 p-4">
                {/* 大图预览（优先展示第一张) */}
                <img
                  src={previews[0]}
                  alt="预览"
                  className="block max-h-[420px] w-full object-contain"
                />
                <div className="absolute bottom-3 right-3 text-[11px] bg-black/60 text-white px-2 py-1 rounded">
                  点击/拖拽可替换，最多 {maxImages} 张
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {uploadedImages.length >= maxImages
                    ? `已达到最大上传数量 (${maxImages})`
                    : '点击或拖拽上传图片，或按 Ctrl+V 粘贴图片/图片链接'}
                </p>
                <p className="text-xs text-gray-400">支持 JPG、PNG、WebP 格式，最多 {maxImages} 张</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 缩略图区域：仅在上传 2 张及以上时显示 */}
      {previews.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={preview}
                      alt={`上传的图片 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {uploadedImages[index]?.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 提示信息 */}
      {uploadedImages.length > 0 && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
          <ImageIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">图片编辑模式</p>
            <p>已上传 {uploadedImages.length} 张图片，将基于这些图片进行编辑生成。请在提示词中描述您希望的修改效果。</p>
          </div>
        </div>
      )}
    </div>
  );
}
