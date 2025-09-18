"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardContent className="p-12">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-4 bg-muted/20 rounded-full">
            <Wand2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">开始您的AI创作之旅</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              在上方输入您的创意描述，或上传参考图片，让AI为您创造独特的艺术作品
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

