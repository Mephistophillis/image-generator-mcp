import { logger } from '../utils/logger';
import { validateInput, ListModelsSchema } from '../utils/validation';

export function listModelsHandler(args: unknown): {
  content: Array<{ type: string; text: string }>;
} {
  try {
    validateInput(ListModelsSchema, args);

    logger.info('📋 Listing available models');

    const models = [
      {
        id: 'google/gemini-2.5-flash-image-preview',
        name: 'Nano Banana (Gemini 2.5 Flash Image)',
        description: 'Fast, efficient image generation with good quality',
        output_format: 'PNG',
        cost: '$0.001 per image',
        default: true,
      },
      {
        id: 'google/gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash Experimental',
        description: 'Latest experimental model with enhanced capabilities',
        output_format: 'PNG',
        cost: '$0.002 per image',
        default: false,
      },
    ];

    const result = {
      success: true,
      models,
    };

    logger.info(`✅ Listed ${models.length} available models`);

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
      `❌ Failed to list models: ${error instanceof Error ? error.message : String(error)}`
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
    };
  }
}
