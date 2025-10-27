# OpenRouter Image Generator MCP Server

[![npm version](https://badge.fury.io/js/openrouter-image-gen-mcp.svg)](https://badge.fury.io/js/openrouter-image-gen-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-1.0+-green.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that enables AI assistants to generate and edit images using OpenRouter's Nano Banana (Gemini 2.5 Flash Image) model.

## ✨ Features

- 🎨 **Image Generation** - Create images from text descriptions
- ✏️ **Image Editing** - Edit existing images with instructions
- 📁 **Automatic File Saving** - Smart filename generation and organization
- 🚀 **Fast & Lightweight** - Optimized for quick responses
- 🔧 **Easy Setup** - Install with a single command
- 🛡️ **Type Safe** - Built with TypeScript and strict validation

## 🚀 Quick Start

### 1. Install

```bash
# Global installation
npm install -g openrouter-image-gen-mcp

# Or use with npx (recommended)
npx openrouter-image-gen-mcp
```

### 2. Get OpenRouter API Key

Get your free API key at [https://openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Configure OpenCode

Add to your OpenCode configuration:

```json
{
  "mcp": {
    "image-generator": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "openrouter-image-gen-mcp"],
      "environment": {
        "OPENROUTER_API_KEY": "sk-or-v1-your-api-key-here"
      }
    }
  }
}
```

### 4. Start Generating Images!

```
User: Generate an image: beautiful sunset over ocean

✅ Image generated and saved
📁 File: /home/user/generated_beautiful_sunset_2025-10-26T21-45-30.png
📏 Size: 245.67 KB
🎨 Model: google/gemini-2.5-flash-image-preview
```

## 📖 Usage Examples

### Basic Image Generation

```bash
# Simple prompt
Generate an image: cute cat sitting on a windowsill

# Custom output path
Generate a landscape image and save as ./renders/mountain.png
```

### Image Editing

```bash
# Edit existing image
Edit sunset.png by adding flying birds

# Edit with custom output
Edit portrait.jpg with sunglasses and save as ./edited/cool_person.png
```

### List Available Models

```bash
List available image generation models
```

## 🛠️ Available Tools

### `generate_image`

Generate an image from text description.

**Parameters:**

- `prompt` (required): Text description of image to generate
- `output_path` (optional): Path to save the image file
- `model` (optional): Model to use for generation

**Response:**

```json
{
  "success": true,
  "model": "google/gemini-2.5-flash-image-preview",
  "prompt": "beautiful sunset",
  "file_path": "/path/to/generated_image.png",
  "file_size_kb": 245.67
}
```

### `edit_image`

Edit an existing image based on instructions.

**Parameters:**

- `image_url` (required): URL or data URI of image to edit
- `edit_prompt` (required): Instructions for editing the image
- `output_path` (optional): Path to save the edited image
- `model` (optional): Model to use for editing

### `list_available_models`

List supported image generation models with details.

## 🔧 Configuration

### Environment Variables

- `OPENROUTER_API_KEY` (required): Your OpenRouter API key
- `IMAGE_OUTPUT_DIR` (optional): Default output directory for images
- `LOG_LEVEL` (optional): Logging verbosity (`info` or `debug`)

### Supported Models

| Model                                   | Description                              | Cost         | Default |
| --------------------------------------- | ---------------------------------------- | ------------ | ------- |
| `google/gemini-2.5-flash-image-preview` | Nano Banana - Fast, efficient generation | $0.001/image | ✅      |
| `google/gemini-2.0-flash-exp`           | Latest experimental model                | $0.002/image | ❌      |

## 🏗️ Development

### Project Structure

```
src/
├── index.ts              # Main entry point
├── server.ts             # MCP server setup
├── tools/
│   ├── generate.ts       # generate_image handler
│   ├── edit.ts           # edit_image handler
│   └── models.ts         # list_models handler
├── services/
│   └── openrouter.ts     # OpenRouter API client
└── utils/
    ├── filename.ts       # Filename generation
    ├── logger.ts         # Logging utilities
    └── validation.ts     # Input validation
```

### Building

```bash
# Build the project
npm run build

# Watch for changes
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Testing with MCP Inspector

```bash
# Start the inspector
npm run inspect

# Test tool calls in the inspector interface
```

## 📝 Error Handling

The server provides detailed error messages for common issues:

```json
{
  "error": "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
  "help": "Get your free API key at: https://openrouter.ai/keys"
}
```

Common errors:

- Missing API key
- Network connectivity issues
- Invalid image formats
- Insufficient API credits
- File system permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - For the protocol specification
- [OpenRouter](https://openrouter.ai/) - For providing the API gateway
- [Gemini](https://ai.google.dev/gemini-api/docs/image-generation) - For the image generation model

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/Mephistophillis/image-generator-mcp/issues)

---

**Made with ❤️ for the AI community**
