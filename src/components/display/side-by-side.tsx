"use client";

import React from "react";

interface SideBySideProps {
  beforeImage: string;
  afterImage: string;
}

export function SideBySide({ beforeImage, afterImage }: SideBySideProps) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 pb-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center">原图</h4>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted/10">
          <img src={beforeImage} alt="原图" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center">AI编辑后</h4>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted/10">
          <img src={afterImage} alt="编辑后" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

