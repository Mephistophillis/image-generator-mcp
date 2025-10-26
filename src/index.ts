#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { generateImageHandler } from './tools/generate';
import { editImageHandler } from './tools/edit';
import { listModelsHandler } from './tools/models';
import { logger } from './utils/logger';

const server = new Server(
  {
    name: 'openrouter-image-gen-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('📝 Listing available tools');

  return {
    tools: [
      {
        name: 'generate_image',
        description: "Generate an image from text description using OpenRouter's Nano Banana model",
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text description of image to generate',
            },
            output_path: {
              type: 'string',
              description: 'Path to save the image file (optional, auto-generated if not provided)',
            },
            model: {
              type: 'string',
              description: 'Model to use for generation (optional, defaults to Nano Banana)',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'edit_image',
        description: 'Edit an existing image based on instructions',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: {
              type: 'string',
              description: 'URL or data URI of image to edit',
            },
            edit_prompt: {
              type: 'string',
              description: 'Instructions for editing the image',
            },
            output_path: {
              type: 'string',
              description:
                'Path to save the edited image file (optional, auto-generated if not provided)',
            },
            model: {
              type: 'string',
              description: 'Model to use for editing (optional, defaults to Nano Banana)',
            },
          },
          required: ['image_url', 'edit_prompt'],
        },
      },
      {
        name: 'list_available_models',
        description: 'List supported image generation models',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_image':
        return await generateImageHandler(args);
      case 'edit_image':
        return await editImageHandler(args);
      case 'list_available_models':
        return await listModelsHandler(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`❌ Error in ${name}: ${error instanceof Error ? error.message : String(error)}`);
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
});

async function main() {
  logger.info('🚀 Starting OpenRouter Image Generator MCP Server');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('✅ Server started successfully');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('👋 Shutting down server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('👋 Shutting down server...');
  await server.close();
  process.exit(0);
});

main().catch(error => {
  logger.error(`❌ Failed to start server: ${error.message}`);
  process.exit(1);
});
