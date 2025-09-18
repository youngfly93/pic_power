// API功能测试
import { ImageGenerationAPI, DEFAULT_CONFIG, AVAILABLE_MODELS, AVAILABLE_SIZES } from '@/lib/api';

describe('API Configuration', () => {
  test('DEFAULT_CONFIG should have correct values', () => {
    expect(DEFAULT_CONFIG.model).toBe('doubao-seedream-4-0-250828');
    expect(DEFAULT_CONFIG.size).toBe('2K');
    expect(DEFAULT_CONFIG.maxImages).toBe(1);
    expect(DEFAULT_CONFIG.watermark).toBe(true);
    expect(DEFAULT_CONFIG.responseFormat).toBe('url');
  });

  test('AVAILABLE_MODELS should not be empty', () => {
    expect(AVAILABLE_MODELS).toHaveLength(1);
    expect(AVAILABLE_MODELS[0]).toHaveProperty('id');
    expect(AVAILABLE_MODELS[0]).toHaveProperty('name');
    expect(AVAILABLE_MODELS[0]).toHaveProperty('description');
  });

  test('AVAILABLE_SIZES should have correct structure', () => {
    expect(AVAILABLE_SIZES.length).toBeGreaterThan(3); // 现在有8个尺寸选项
    AVAILABLE_SIZES.forEach(size => {
      expect(size).toHaveProperty('id');
      expect(size).toHaveProperty('name');
      expect(size).toHaveProperty('description');
    });

    // 验证包含基本尺寸
    const sizeIds = AVAILABLE_SIZES.map(s => s.id);
    expect(sizeIds).toContain('1K');
    expect(sizeIds).toContain('2K');
    expect(sizeIds).toContain('4K');
    expect(sizeIds).toContain('adaptive');
  });
});

describe('ImageGenerationAPI', () => {
  test('generateImages method should exist', () => {
    expect(typeof ImageGenerationAPI.generateImages).toBe('function');
  });

  // 注意：这里不进行实际的API调用测试，因为需要真实的API密钥
  // 在实际项目中，您可能需要使用mock或测试环境的API
});
