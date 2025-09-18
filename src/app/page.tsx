'use client';

import { ImageGenerationFormComponent } from '@/components/image-generation-form';
import { UnifiedImageDisplay } from '@/components/unified-image-display';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">PicPower AI</h1>
                <p className="text-sm text-muted-foreground">AI 图片生成工具</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/demo">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  滑窗对比演示
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">Powered by 即梦 API</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto w-full max-w-6xl space-y-10">
          {/* Generation Form */}
          <section className="animate-fade-in">
            <ImageGenerationFormComponent />
          </section>

          {/* Unified Image Display */}
          <section className="animate-slide-up">
            <UnifiedImageDisplay />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t glass mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span>© 2024 PicPower AI. 让创意无限可能。</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                使用指南
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                API 文档
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
