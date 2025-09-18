"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface RegionSelectorCanvasProps {
  imageSrc: string; // base64 或 URL
  onMaskChange?: (maskDataUrl: string, rect: { x: number; y: number; width: number; height: number }) => void;
  className?: string;
}

// 简易矩形选区 + 导出遮罩（白=重绘，黑=保留）
export function RegionSelectorCanvas({ imageSrc, onMaskChange, className }: RegionSelectorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [imgOffset, setImgOffset] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const [dragging, setDragging] = useState(false);
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  // 更新显示尺寸与偏移
  const updateLayout = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const box = img.getBoundingClientRect();
    setDisplaySize({ width: box.width, height: box.height });
    setImgOffset({ left: box.left + window.scrollX, top: box.top + window.scrollY });
  }, []);

  useEffect(() => {
    const handler = () => updateLayout();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [updateLayout]);

  const scale = useMemo(() => {
    if (!naturalSize || !displaySize) return 1;
    // object-contain 等比缩放，宽高缩放比一致
    return displaySize.width / naturalSize.width;
  }, [naturalSize, displaySize]);

  const toImageCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!imgRef.current || !displaySize || !naturalSize) return null;
      // 将页面坐标转换到图片显示坐标
      const xInImg = clientX - imgOffset.left;
      const yInImg = clientY - imgOffset.top;
      // 限制在图片显示范围内
      const x = Math.max(0, Math.min(displaySize.width, xInImg));
      const y = Math.max(0, Math.min(displaySize.height, yInImg));
      return { x, y };
    },
    [imgOffset, displaySize, naturalSize]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pt = toImageCoords(e.clientX, e.clientY);
      if (!pt) return;
      setDragging(true);
      setStartPt(pt);
      setRect(null);
    },
    [toImageCoords]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !startPt) return;
      const pt = toImageCoords(e.clientX, e.clientY);
      if (!pt) return;
      const x = Math.min(startPt.x, pt.x);
      const y = Math.min(startPt.y, pt.y);
      const w = Math.abs(pt.x - startPt.x);
      const h = Math.abs(pt.y - startPt.y);
      setRect({ x, y, width: w, height: h });
    },
    [dragging, startPt, toImageCoords]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const resetSelection = useCallback(() => {
    setRect(null);
    setMaskUrl(null);
    onMaskChange?.("", { x: 0, y: 0, width: 0, height: 0 });
  }, [onMaskChange]);

  const exportMask = useCallback(() => {
    if (!rect || !naturalSize || !scale) return;
    // 将显示坐标 rect 转为原图坐标
    const rx = Math.round(rect.x / scale);
    const ry = Math.round(rect.y / scale);
    const rw = Math.round(rect.width / scale);
    const rh = Math.round(rect.height / scale);

    const canvas = document.createElement("canvas");
    canvas.width = naturalSize.width;
    canvas.height = naturalSize.height;
    const ctx = canvas.getContext("2d")!;
    // 黑底
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 白色选区
    ctx.fillStyle = "white";
    ctx.fillRect(rx, ry, rw, rh);

    const url = canvas.toDataURL("image/png");
    setMaskUrl(url);
    onMaskChange?.(url, { x: rx, y: ry, width: rw, height: rh });
  }, [rect, naturalSize, scale, onMaskChange]);

  const downloadMask = useCallback(() => {
    if (!maskUrl) return;
    const a = document.createElement("a");
    a.href = maskUrl;
    a.download = "mask.png";
    a.click();
  }, [maskUrl]);

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-3">
          <div ref={containerRef} className="relative w-full">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="base"
              className="block max-h-[420px] w-full object-contain select-none"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                // 延迟一个 tick 以确保布局完成
                requestAnimationFrame(updateLayout);
              }}
            />

            {/* 覆盖层用于捕获拖拽并显示选区 */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              aria-label="矩形选区覆盖层"
            >
              {/* 选区矩形 */}
              {rect && (
                <div
                  className="absolute border-2 border-primary/80 bg-primary/10"
                  style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                />
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={resetSelection}>
              重置选区
            </Button>
            <Button type="button" onClick={exportMask} disabled={!rect || !naturalSize}>
              生成遮罩预览
            </Button>
            <Button type="button" variant="outline" onClick={downloadMask} disabled={!maskUrl}>
              下载遮罩 PNG
            </Button>
          </div>

          {/* 预览区域 */}
          {maskUrl && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-2">基图预览</p>
                <img src={imageSrc} alt="base preview" className="max-h-48 w-full object-contain rounded" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">遮罩预览（白=重绘区域，黑=保留）</p>
                <img src={maskUrl} alt="mask preview" className="max-h-48 w-full object-contain rounded bg-black" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

