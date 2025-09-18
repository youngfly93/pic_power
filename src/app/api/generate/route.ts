import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationRequest, ImageGenerationResponse } from '@/types/api';

const API_BASE_URL = process.env.DOUBAO_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const API_KEY = process.env.DOUBAO_API_KEY as string;

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: { message: '服务器配置缺少 DOUBAO_API_KEY' } },
        { status: 500 }
      );
    }

    const body: ImageGenerationRequest = await request.json();

    const response = await fetch(`${API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || { message: `HTTP error! status: ${response.status}` } },
        { status: response.status }
      );
    }

    const data: ImageGenerationResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
