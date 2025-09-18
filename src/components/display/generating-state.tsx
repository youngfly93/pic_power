"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface GeneratingStateProps {
  progress: number;
}

export function GeneratingState({ progress }: GeneratingStateProps) {
  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">AI 正在创作中...</h3>
            <p className="text-sm text-muted-foreground">
              正在运用先进的AI技术为您生成独特的图片
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% 完成
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

