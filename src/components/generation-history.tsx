'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  History, 
  Trash2, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { GenerationHistory as HistoryType } from '@/types/api';
import { cn } from '@/lib/utils';

interface GenerationHistoryProps {
  className?: string;
}

export function GenerationHistory({ className }: GenerationHistoryProps) {
  const { history, removeFromHistory, setPrompt, clearHistory, clearAllData } = useAppStore();
  const [selectedHistory, setSelectedHistory] = useState<HistoryType | null>(null);

  const getStatusIcon = (status: HistoryType['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: HistoryType['status']) => {
    switch (status) {
      case 'pending':
        return '生成中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
    }
  };

  const handleReusePrompt = (prompt: string) => {
    setPrompt(prompt);
    // 滚动到表单区域
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (history.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            生成历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">还没有生成历史</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          生成历史
          <Badge variant="secondary">{history.length}</Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAllData();
              // 清理localStorage
              try {
                localStorage.removeItem('pic-power-storage');
                window.location.reload();
              } catch (error) {
                console.error('清理存储失败:', error);
              }
            }}
            className="text-orange-600 hover:text-orange-700"
            title="清理所有数据和缓存"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            {/* 状态图标 */}
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(item.status)}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm line-clamp-2 flex-1">
                  {item.prompt}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.status === 'completed' && item.images.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedHistory(item)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFromHistory(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(item.status)}
                  </Badge>
                  {item.status === 'completed' && (
                    <span>{item.images.length} 张图片</span>
                  )}
                  <span>{item.createdAt.toLocaleString()}</span>
                </div>

                {item.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleReusePrompt(item.prompt)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    重新生成
                  </Button>
                )}
              </div>

              {item.status === 'failed' && item.error && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {item.error}
                </p>
              )}

              {/* 预览图片 */}
              {item.status === 'completed' && item.images.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {item.images
                    .filter(img => !!img.url)
                    .slice(0, 3)
                    .map((image, index) => (
                      <div
                        key={image.id}
                        className="relative w-12 h-12 rounded overflow-hidden border"
                      >
                        <Image
                          src={image.url}
                          alt={`预览 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                  ))}
                  {item.images.length > 3 && (
                    <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted text-xs">
                      +{item.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>

      {/* 历史详情对话框 */}
      <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {selectedHistory && (
            <>
              <DialogHeader>
                <DialogTitle>生成历史详情</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">提示词</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                    {selectedHistory.prompt}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">生成结果 ({selectedHistory.images.length} 张)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedHistory.images
                      .filter(img => !!img.url)
                      .map((image) => (
                        <div key={image.id} className="space-y-2">
                          <div className="relative aspect-square rounded-lg overflow-hidden border">
                            <Image
                              src={image.url}
                              alt={image.prompt}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div>{image.size} • {image.model.split('-')[1]}</div>
                            <div>{image.createdAt.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
