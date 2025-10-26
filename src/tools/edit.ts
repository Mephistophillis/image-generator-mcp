import {
  generateFilename,
  saveImageFromDataUri,
  ensureDirectoryExists,
} from '../utils/filename.js';
import { logger } from '../utils/logger.js';
import { OpenRouterClient } from '../services/openrouter.js';
import { validateInput, EditImageSchema } from '../utils/validation.js';

export async function editImageHandler(
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { image_url, edit_prompt, output_path, model } = validateInput(EditImageSchema, args);

    logger.info(`🎨 Starting image editing: ${edit_prompt}`);

    const client = new OpenRouterClient();
    const imageDataUri = await client.editImage(image_url, edit_prompt, model);

    const finalPath = output_path || generateFilename(`edited_${edit_prompt}`, 'edited');
    await ensureDirectoryExists(finalPath);

    const { size } = await saveImageFromDataUri(imageDataUri, finalPath);

    const result = {
      success: true,
      model: model || 'google/gemini-2.5-flash-image-preview',
      edit_prompt,
      image_url,
      file_path: finalPath,
      file_size_kb: Math.round((size / 1024) * 100) / 100,
    };

    logger.info(`✅ Image editing completed: ${finalPath}`);

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
      `❌ Image editing failed: ${error instanceof Error ? error.message : String(error)}`
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            edit_prompt: (args as { edit_prompt?: string })?.edit_prompt || 'unknown',
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
    };
  }
}
