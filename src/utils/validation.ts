import { z } from 'zod';

export const GenerateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(10000, 'Prompt too long'),
  output_path: z.string().optional(),
  model: z.string().optional(),
});

export const EditImageSchema = z.object({
  image_url: z.string().url('Invalid image URL'),
  edit_prompt: z.string().min(1, 'Edit prompt cannot be empty').max(10000, 'Edit prompt too long'),
  output_path: z.string().optional(),
  model: z.string().optional(),
});

export const ListModelsSchema = z.object({});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'data:'
    );
  } catch {
    return false;
  }
}
