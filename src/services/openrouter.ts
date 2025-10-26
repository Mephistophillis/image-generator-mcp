import { logger } from '../utils/logger';

export interface OpenRouterImageResponse {
  choices: Array<{
    message: {
      images?: Array<{
        image_url: {
          url: string;
        };
      }>;
    };
  }>;
  model: string;
}

export interface OpenRouterRequest {
  model: string;
  modalities: ['text', 'image'];
  messages: Array<{
    role: 'user';
    content: Array<
      | {
          type: 'text';
          text: string;
        }
      | {
          type: 'image_url';
          image_url: {
            url: string;
          };
        }
    >;
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
  }

  async generateImage(
    prompt: string,
    model: string = 'google/gemini-2.5-flash-image-preview'
  ): Promise<string> {
    logger.info(`🎨 Generating image with model: ${model}`);
    logger.debug(`📝 Prompt: ${prompt}`);

    const request: OpenRouterRequest = {
      model,
      modalities: ['text', 'image'],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate an image: ${prompt}`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/openrouter-image-gen-mcp',
          'X-Title': 'OpenRouter Image Generator MCP',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = (await response.json()) as OpenRouterImageResponse;

      if (!data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        throw new Error('No image generated in response');
      }

      const imageUrl = data.choices[0].message.images[0].image_url.url;
      logger.info('✅ Image generated successfully');
      return imageUrl;
    } catch (error) {
      logger.error(
        `❌ Failed to generate image: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  async editImage(
    imageUrl: string,
    editPrompt: string,
    model: string = 'google/gemini-2.5-flash-image-preview'
  ): Promise<string> {
    logger.info(`🎨 Editing image with model: ${model}`);
    logger.debug(`📝 Edit prompt: ${editPrompt}`);

    const request: OpenRouterRequest = {
      model,
      modalities: ['text', 'image'],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: `Edit this image: ${editPrompt}`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/openrouter-image-gen-mcp',
          'X-Title': 'OpenRouter Image Generator MCP',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = (await response.json()) as OpenRouterImageResponse;

      if (!data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        throw new Error('No edited image generated in response');
      }

      const imageUrl = data.choices[0].message.images[0].image_url.url;
      logger.info('✅ Image edited successfully');
      return imageUrl;
    } catch (error) {
      logger.error(
        `❌ Failed to edit image: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }
}
