import { generateFilename } from '../../src/utils/filename';
import { validateInput, GenerateImageSchema, EditImageSchema } from '../../src/utils/validation';

describe('Utility Functions', () => {
  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const prompt = 'beautiful sunset';
      const filename = generateFilename(prompt);

      expect(filename).toMatch(
        /^generated_beautiful_sunset_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/
      );
    });

    it('should handle long prompts by truncating', () => {
      const longPrompt = 'a'.repeat(100);
      const filename = generateFilename(longPrompt);

      expect(filename.length).toBeLessThan(100);
      expect(filename).toContain('generated_');
      expect(filename).toContain('.png');
    });

    it('should handle special characters', () => {
      const prompt = 'sunset @#$%^&*()';
      const filename = generateFilename(prompt);

      expect(filename).toMatch(/^generated_sunset__\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should use custom prefix', () => {
      const prompt = 'cat';
      const filename = generateFilename(prompt, 'edited');

      expect(filename).toMatch(/^edited_cat_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });
  });

  describe('generateFilename special character handling', () => {
    it('should replace special characters with underscores', () => {
      const result = generateFilename('file@name#test');
      expect(result).toMatch(/^generated_filenametest_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should handle multiple consecutive special characters', () => {
      const result = generateFilename('file@@@##test');
      expect(result).toMatch(/^generated_filetest_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should handle leading and trailing special characters', () => {
      const result = generateFilename('@filename@');
      expect(result).toMatch(/^generated_filename_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should convert to lowercase', () => {
      const result = generateFilename('FileName');
      expect(result).toMatch(/^generated_filename_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
    });
  });

  describe('Input Validation', () => {
    describe('GenerateImageSchema', () => {
      it('should validate valid input', () => {
        const input = { prompt: 'test prompt' };
        const result = validateInput(GenerateImageSchema, input);

        expect(result).toEqual(input);
      });

      it('should reject empty prompt', () => {
        const input = { prompt: '' };

        expect(() => validateInput(GenerateImageSchema, input)).toThrow();
      });

      it('should reject missing prompt', () => {
        const input = {};

        expect(() => validateInput(GenerateImageSchema, input)).toThrow();
      });

      it('should accept optional fields', () => {
        const input = {
          prompt: 'test',
          output_path: '/path/to/image.png',
          model: 'custom-model',
        };
        const result = validateInput(GenerateImageSchema, input);

        expect(result).toEqual(input);
      });
    });

    describe('EditImageSchema', () => {
      it('should validate valid input', () => {
        const input = {
          image_url: 'https://example.com/image.jpg',
          edit_prompt: 'add sunglasses',
        };
        const result = validateInput(EditImageSchema, input);

        expect(result).toEqual(input);
      });

      it('should reject invalid URL', () => {
        const input = {
          image_url: 'not-a-url',
          edit_prompt: 'add sunglasses',
        };

        expect(() => validateInput(EditImageSchema, input)).toThrow();
      });

      it('should reject empty edit prompt', () => {
        const input = {
          image_url: 'https://example.com/image.jpg',
          edit_prompt: '',
        };

        expect(() => validateInput(EditImageSchema, input)).toThrow();
      });
    });
  });
});
