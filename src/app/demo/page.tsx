'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageComparisonSlider } from '@/components/image-comparison-slider';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  // 使用示例图片URL（您可以替换为实际的图片）
  const beforeImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop";
  const afterImage = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop";

  const handleDownload = (imageUrl: string, type: 'before' | 'after') => {
    console.log(`下载${type === 'before' ? '原图' : '编辑后图片'}:`, imageUrl);
    // 这里可以实现实际的下载逻辑
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回主页
            </Button>
          </Link>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                滑窗对比功能演示
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              体验强大的滑窗对比功能，直观查看AI图片编辑前后的效果对比
            </p>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl mb-2">🖱️</div>
              <h3 className="font-semibold mb-1">拖拽滑块</h3>
              <p className="text-sm text-muted-foreground">拖动滑块查看对比</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl mb-2">👆</div>
              <h3 className="font-semibold mb-1">点击定位</h3>
              <p className="text-sm text-muted-foreground">点击图片快速定位</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl mb-2">⌨️</div>
              <h3 className="font-semibold mb-1">键盘控制</h3>
              <p className="text-sm text-muted-foreground">左右箭头键控制</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">触摸支持</h3>
              <p className="text-sm text-muted-foreground">完美支持移动设备</p>
            </CardContent>
          </Card>
        </div>

        {/* 滑窗对比演示 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              滑窗对比演示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageComparisonSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeLabel="夏日山景"
              afterLabel="冬季雪景"
              prompt="将夏日山景转换为冬季雪景，添加雪花和冰霜效果"
              onDownload={handleDownload}
            />
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>如何在PicPower AI中使用滑窗对比</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                  切换到图片编辑模式
                </h3>
                <p className="text-sm text-muted-foreground pl-8">
                  在主界面点击「图片编辑」标签，而不是「文生图」模式
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                  上传参考图片
                </h3>
                <p className="text-sm text-muted-foreground pl-8">
                  选择1-4张图片作为编辑的基础，这些将作为「原图」
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                  输入编辑指令
                </h3>
                <p className="text-sm text-muted-foreground pl-8">
                  描述您想要的编辑效果，如「改变背景」、「调整风格」等
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">4</Badge>
                  享受滑窗对比
                </h3>
                <p className="text-sm text-muted-foreground pl-8">
                  编辑完成后，自动显示滑窗对比界面，拖动查看效果
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 重要提示</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                滑窗对比功能只在<strong>图片编辑模式</strong>下可用。如果您使用的是文生图模式，将看不到滑窗对比效果。
                请确保切换到「图片编辑」标签并上传参考图片。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 底部链接 */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              开始使用 PicPower AI
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
