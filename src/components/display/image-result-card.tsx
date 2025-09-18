"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Eye, Heart, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneratedImage } from "@/types/api";
import { ImageComparisonSlider } from "@/components/image-comparison-slider";
import { SideBySide } from "./side-by-side";

interface ImageResultCardProps {
  image: GeneratedImage;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (image: GeneratedImage) => void;
  onDownload: (imageOrUrl: string | GeneratedImage, type?: "before" | "after") => void;
}

export function ImageResultCard({
  image,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onDownload,
}: ImageResultCardProps) {
  const isI2I = image.type === "image-to-image" && image.sourceImages && image.sourceImages.length > 0;
  const [showSideBySide, setShowSideBySide] = useState(false);

  return (
    <Card className="group overflow-hidden image-gallery-card">
      <CardContent className="p-0">
        {/* 顶部展示区 */}
        {isI2I ? (
          <div className="space-y-4">
            <ImageComparisonSlider
              beforeImage={image.sourceImages![0]}
              afterImage={image.url}
              beforeLabel="原图"
              afterLabel="AI编辑后"
              prompt={image.prompt}
              onDownload={onDownload}
            />

            {/* 切换显示模式按钮 */}
            <div className="px-4 pb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSideBySide((v) => !v)}
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {showSideBySide ? "隐藏对比" : "显示对比"}
              </Button>
            </div>

            {showSideBySide && (
              <SideBySide beforeImage={image.sourceImages![0]} afterImage={image.url} />
            )}
          </div>
        ) : (
          <div className="relative w-full">
            <Image
              src={image.url}
              alt={image.prompt}
              width={1200}
              height={800}
              className="w-full h-auto object-contain bg-muted/10"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            />

            {/* 悬浮操作按钮 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 backdrop-blur-sm bg-white/90 hover:bg-white"
                    onClick={() => onToggleFavorite(image.id)}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 backdrop-blur-sm bg-white/90 hover:bg-white"
                    onClick={() => onPreview(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 信息与操作区 */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">{image.prompt}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {image.createdAt.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {image.size}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {image.model.split("-")[1]}
              </Badge>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(image)}
              className="flex items-center gap-2"
            >
              <Download className="h-3 w-3" />
              下载
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

