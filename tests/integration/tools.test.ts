import { generateImageHandler } from '../../src/tools/generate';
import { editImageHandler } from '../../src/tools/edit';
import { listModelsHandler } from '../../src/tools/models';

// Mock the OpenRouter client
jest.mock('../../src/services/openrouter', () => ({
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    generateImage: jest
      .fn()
      .mockResolvedValue(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ),
    editImage: jest
      .fn()
      .mockResolvedValue(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ),
  })),
}));

// Mock file system operations
jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

describe('Tool Handlers Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImageHandler', () => {
    it('should generate image successfully', async () => {
      const args = {
        prompt: 'beautiful sunset',
        output_path: './test-output.png',
      };

      const result = await generateImageHandler(args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.prompt).toBe('beautiful sunset');
      expect(response.file_path).toBe('./test-output.png');
      expect(response.file_size_kb).toBeGreaterThan(0);
    });

    it('should handle missing API key', async () => {
      // Mock environment without API key
      const originalEnv = process.env.OPENROUTER_API_KEY;
      delete process.env.OPENROUTER_API_KEY;

      const args = { prompt: 'test' };
      const result = await generateImageHandler(args);

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('OPENROUTER_API_KEY');

      // Restore environment
      process.env.OPENROUTER_API_KEY = originalEnv;
    });

    it('should validate input', async () => {
      const args = {}; // Missing required prompt

      const result = await generateImageHandler(args);

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Validation error');
    });
  });

  describe('editImageHandler', () => {
    it('should edit image successfully', async () => {
      const args = {
        image_url: 'https://example.com/image.jpg',
        edit_prompt: 'add sunglasses',
        output_path: './edited-image.png',
      };

      const result = await editImageHandler(args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.edit_prompt).toBe('add sunglasses');
      expect(response.image_url).toBe('https://example.com/image.jpg');
      expect(response.file_path).toBe('./edited-image.png');
    });

    it('should validate image URL', async () => {
      const args = {
        image_url: 'invalid-url',
        edit_prompt: 'add sunglasses',
      };

      const result = await editImageHandler(args);

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Validation error');
    });
  });

  describe('listModelsHandler', () => {
    it('should list available models', () => {
      const args = {};
      const result = listModelsHandler(args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.models).toBeInstanceOf(Array);
      expect(response.models.length).toBeGreaterThan(0);

      // Check default model is marked
      const defaultModel = response.models.find((m: any) => m.default);
      expect(defaultModel).toBeTruthy();
      expect(defaultModel.id).toBe('google/gemini-2.5-flash-image-preview');
    });

    it('should include required model fields', () => {
      const args = {};
      const result = listModelsHandler(args);

      const response = JSON.parse(result.content[0].text);
      const model = response.models[0];

      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('description');
      expect(model).toHaveProperty('output_format');
      expect(model).toHaveProperty('cost');
      expect(model).toHaveProperty('default');
    });
  });
});
