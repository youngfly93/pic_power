'use client';

import React, { useState, useRef, useEffect } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  RotateCcw,
  ArrowLeftRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  prompt?: string;
  className?: string;
  onDownload?: (imageUrl: string, type: 'before' | 'after') => void;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = '原图',
  afterLabel = '编辑后',
  prompt,
  className,
  onDownload
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!naturalSize) {
      const img = e.currentTarget;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
    setImageLoaded(true);
  };

  // 处理滑块位置更新
  const updateSliderPosition = (percentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  };

  // 根据鼠标/触摸位置计算百分比
  const getPercentageFromEvent = (clientX: number) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return (x / rect.width) * 100;
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(getPercentageFromEvent(e.clientX));
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateSliderPosition(getPercentageFromEvent(e.clientX));
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updateSliderPosition(getPercentageFromEvent(touch.clientX));
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    updateSliderPosition(getPercentageFromEvent(touch.clientX));
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      updateSliderPosition(sliderPosition - 5);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      updateSliderPosition(sliderPosition + 5);
      e.preventDefault();
    } else if (e.key === 'Home') {
      updateSliderPosition(0);
      e.preventDefault();
    } else if (e.key === 'End') {
      updateSliderPosition(100);
      e.preventDefault();
    }
  };

  // 重置到中间位置
  const resetPosition = () => {
    updateSliderPosition(50);
    toast.success('已重置到中间位置');
  };

  // 绑定全局事件
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const handleDownload = (type: 'before' | 'after') => {
    const imageUrl = type === 'before' ? beforeImage : afterImage;
    if (onDownload) {
      onDownload(imageUrl, type);
    } else {
      // 默认下载逻辑
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${type === 'before' ? '原图' : '编辑后'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${type === 'before' ? '原图' : '编辑后图片'}下载成功！`);
    }
  };

  return (
    <Card className={cn("overflow-hidden group", className)}>
      <CardContent className="p-0">
        {/* 图片对比区域 */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden bg-muted/10 cursor-ew-resize select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" style={{ aspectRatio: naturalSize ? `${naturalSize.w} / ${naturalSize.h}` : '4 / 3' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="图片对比滑块"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
        >
          {/* 编辑后图 (背景层) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 h-full w-full object-contain"
            onLoad={handleImgLoad}
          />

          {/* 原图 (前景层，使用clip-path裁剪) */}
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 h-full w-full object-contain transition-all duration-100 ease-out"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            onLoad={handleImgLoad}
          />

          {/* 滑块线条 */}
          <div
            ref={sliderRef}
            className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-100 ease-out z-10"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            {/* 滑块手柄 */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* 标签 */}
          {imageLoaded && (
            <>
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  {beforeLabel}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 z-20">
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  {afterLabel}
                </Badge>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white border-0"
              onClick={resetPosition}
              title="重置到中间"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white border-0"
              onClick={() => handleDownload('after')}
              title="下载编辑后图片"
            >
              <Download className="h-3 w-3" />
            </Button>

          </div>
        </div>

        {/* 信息区域 */}
        {prompt && (
          <div className="p-4 bg-muted/30">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">编辑指令</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prompt}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="p-4 border-t bg-muted/10">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>🖱️ 拖动滑块对比</span>
            <span>👆 点击图片定位</span>
            <span>⌨️ 左右箭头键控制</span>
            <span>📱 支持触摸操作</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
