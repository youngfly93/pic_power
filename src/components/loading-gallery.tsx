'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingGalleryProps {
  className?: string;
  expectedCount?: number;
}

export function LoadingGallery({ className, expectedCount = 1 }: LoadingGalleryProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    '正在理解您的创意描述...',
    'AI 正在构思画面构图...',
    '正在生成精美的图片...',
    '正在进行最后的优化...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 800);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* 加载状态指示器 */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-pulse-slow">
                  <Palette className="h-16 w-16 mx-auto text-primary" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">AI 正在创作中...</h3>
                <p className="text-sm text-muted-foreground animate-pulse">
                  {steps[currentStep]}
                </p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(progress)}% 完成
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 骨架屏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: expectedCount }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* 图片骨架 */}
                  <Skeleton className="aspect-[4/3] w-full min-h-[300px] md:min-h-[400px]" />
                  
                  {/* 内容骨架 */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>请耐心等待，AI 正在为您精心创作...</p>
          <p className="mt-1">生成时间通常需要 10-30 秒</p>
        </div>
      </div>
    </div>
  );
}
