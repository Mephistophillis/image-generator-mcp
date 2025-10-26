import { generateFilename, saveImageFromDataUri, ensureDirectoryExists } from '../utils/filename';
import { logger } from '../utils/logger';
import { OpenRouterClient } from '../services/openrouter';
import { validateInput, GenerateImageSchema } from '../utils/validation';

export async function generateImageHandler(
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { prompt, output_path, model } = validateInput(GenerateImageSchema, args);

    logger.info(`🎨 Starting image generation: ${prompt}`);

    const client = new OpenRouterClient();
    const imageDataUri = await client.generateImage(prompt, model);

    const finalPath = output_path || generateFilename(prompt);
    await ensureDirectoryExists(finalPath);

    const { size } = await saveImageFromDataUri(imageDataUri, finalPath);

    const result = {
      success: true,
      model: model || 'google/gemini-2.5-flash-image-preview',
      prompt,
      file_path: finalPath,
      file_size_kb: Math.round((size / 1024) * 100) / 100,
    };

    logger.info(`✅ Image generation completed: ${finalPath}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  } catch (error) {
    logger.error(
      `❌ Image generation failed: ${error instanceof Error ? error.message : String(error)}`
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            prompt: (args as { prompt?: string })?.prompt || 'unknown',
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
    };
  }
}
