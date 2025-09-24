import { NextRequest, NextResponse } from 'next/server';
import { ImageEditRequest, ImageGenerationResponse } from '@/types/api';

const API_BASE_URL = process.env.DOUBAO_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const API_KEY = process.env.DOUBAO_API_KEY as string;

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: { message: '服务端未配置 DOUBAO_API_KEY' } },
        { status: 500 }
      );
    }

    const body: ImageEditRequest = await request.json();

    const response = await fetch(`${API_BASE_URL}/images/edits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const isJson = contentType.includes('application/json');
    const parsed = isJson ? (() => { try { return JSON.parse(rawText); } catch { return null; } })() : null;

    if (!response.ok) {
      const p = parsed as (Partial<ImageGenerationResponse> & { error?: { message?: string }, message?: string }) | null;
      const message = p?.error?.message || p?.message || rawText || `HTTP error! status: ${response.status}`;
      return NextResponse.json(
        { error: { message, details: !isJson ? rawText.slice(0, 2000) : undefined } },
        { status: response.status }
      );
    }

    if (!parsed) {
      return NextResponse.json(
        { error: { message: '上游未返回JSON响应', details: rawText.slice(0, 2000) } },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed as ImageGenerationResponse);
  } catch (error) {
    console.error('Inpaint API Error:', error);
    return NextResponse.json(
      { error: { message: '局部重绘接口调用失败' } },
      { status: 500 }
    );
  }
}
