# Product Requirements Document (PRD)
## OpenRouter Image Generator MCP Server

**Version:** 1.0  
**Date:** October 26, 2025  
**Status:** Draft  
**Author:** Development Team  

---

## Executive Summary

This document outlines the requirements for developing a Model Context Protocol (MCP) server in TypeScript that enables AI assistants to generate and edit images using the OpenRouter API. The server will support the Nano Banana (Gemini 2.5 Flash Image) model and provide seamless integration with MCP-compatible clients like OpenCode, Claude Desktop, and Cursor.

### Key Objectives

1. Create a production-ready TypeScript MCP server for image generation
2. Provide simple installation via npm/npx
3. Support automatic file saving with user-friendly naming
4. Ensure fast response times through optimized output
5. Enable easy distribution through npm registry

---

## 1. Product Overview

### 1.1 Problem Statement

AI assistants currently lack native ability to generate images during conversations. Existing solutions require:
- Complex manual setup
- Multiple dependencies
- Platform-specific configurations
- Manual file handling

### 1.2 Solution

A lightweight, cross-platform MCP server that:
- Integrates with OpenRouter's image generation API
- Automatically handles image generation and storage
- Works with any MCP-compatible client
- Installs with a single command: `npx @username/package-name`

### 1.3 Target Users

**Primary Users:**
- Developers using AI coding assistants (OpenCode, Cursor)
- Content creators using Claude Desktop
- Technical writers needing quick image generation
- Designers prototyping with AI assistance

**User Personas:**

1. **Developer Dave**
   - Uses OpenCode for coding
   - Needs quick mockups and diagrams
   - Values speed and simplicity
   - Comfortable with npm/Node.js

2. **Content Creator Clara**
   - Uses Claude Desktop for writing
   - Needs blog post illustrations
   - Wants automatic file organization
   - Prefers GUI over command line

3. **Technical Writer Tom**
   - Needs documentation diagrams
   - Requires consistent naming
   - Values reliability over features
   - Works across multiple projects

---

## 2. Technical Requirements

### 2.1 Core Technologies

**Language & Runtime:**
- TypeScript 5.6+
- Node.js 18.0+ (LTS recommended)
- ES2022 module system

**Dependencies:**
```json
{
  "@modelcontextprotocol/sdk": "^1.0.4",
  "node-fetch": "^3.3.2"
}
```

**Development Tools:**
- TypeScript compiler
- MCP Inspector for testing
- npm for package management

### 2.2 Architecture

#### Component Diagram

```
┌─────────────────────────────────────┐
│   MCP Client (OpenCode/Claude)      │
│                                     │
└────────────┬────────────────────────┘
             │ JSON-RPC over stdio
             ▼
┌─────────────────────────────────────┐
│   MCP Server (TypeScript)            │
│  ┌──────────────────────────────┐   │
│  │  Tool Handlers               │   │
│  │  - generate_image()          │   │
│  │  - edit_image()              │   │
│  │  - list_models()             │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Utility Functions           │   │
│  │  - generateFilename()        │   │
│  │  - saveImageFromDataUri()    │   │
│  └──────────────────────────────┘   │
└────────────┬────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────┐
│   OpenRouter API                     │
│   (Gemini 2.5 Flash Image)          │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Local File System                  │
│   (Generated images)                 │
└─────────────────────────────────────┘
```

#### Data Flow

1. **User Request** → MCP Client sends tool call
2. **Tool Processing** → Server validates and extracts parameters
3. **API Call** → Server sends request to OpenRouter
4. **Image Generation** → OpenRouter processes with Nano Banana
5. **Response Parsing** → Server extracts image URL from response
6. **File Saving** → Server decodes base64 and writes to disk
7. **Metadata Return** → Server sends compact JSON response (no base64)
8. **Client Display** → Client shows file path and success message

### 2.3 System Requirements

**Server Requirements:**
- Node.js 18.0 or higher
- 50 MB free disk space for installation
- 100 MB+ free disk space for generated images
- Internet connection for API access

**Client Requirements:**
- Any MCP-compatible client:
  - OpenCode v1.0+
  - Claude Desktop (latest)
  - Cursor IDE (with MCP support)
- OpenRouter API key (free tier available)

### 2.4 API Integration

**OpenRouter API Endpoint:**
```
POST https://openrouter.ai/api/v1/chat/completions
```

**Request Format:**
```json
{
  "model": "google/gemini-2.5-flash-image-preview",
  "modalities": ["text", "image"],
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "Generate an image: sunset"}
      ]
    }
  ]
}
```

**Response Format:**
```json
{
  "choices": [
    {
      "message": {
        "images": [
          {
            "image_url": {
              "url": "data:image/png;base64,iVBORw0KGgo..."
            }
          }
        ]
      }
    }
  ],
  "model": "google/gemini-2.5-flash-image-preview"
}
```

---

## 3. Functional Requirements

### 3.1 Tool: generate_image

**Purpose:** Generate an image from text description and save to file.

**Input Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description of image to generate |
| `output_path` | string | No | Auto-generated | Path to save the image file |
| `model` | string | No | `google/gemini-2.5-flash-image-preview` | Model to use |

**Output:**
```typescript
{
  success: boolean;
  model?: string;
  prompt: string;
  file_path?: string;
  file_size_kb?: number;
  error?: string;
}
```

**Behavior:**
1. Validate prompt is non-empty
2. Send request to OpenRouter API
3. Parse image from response
4. Generate filename if not provided:
   - Format: `generated_<safe_prompt>_<timestamp>.png`
   - Example: `generated_sunset_2025-10-26T21-45-30.png`
5. Decode base64 to binary
6. Save to file system
7. Return metadata only (no base64 in response)

**Error Handling:**
- Missing API key → Return error message
- API timeout → Return HTTP error details
- Invalid response format → Return parsing error
- File write failure → Return filesystem error with path

**Performance Requirements:**
- API call: 3-10 seconds (dependent on OpenRouter)
- File save: <100ms
- Response serialization: <10ms
- Total time: 3-11 seconds

### 3.2 Tool: edit_image

**Purpose:** Edit an existing image based on instructions.

**Input Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_url` | string | Yes | - | URL or data URI of image to edit |
| `edit_prompt` | string | Yes | - | Instructions for editing |
| `output_path` | string | No | Auto-generated | Path to save edited image |
| `model` | string | No | Default model | Model to use |

**Output:** Same format as `generate_image`

**Behavior:**
1. Validate image_url format (http(s):// or data:)
2. Send edit request with image and instructions
3. Parse edited image from response
4. Generate filename with "edited_" prefix if not provided
5. Save edited image
6. Return metadata

**Supported Image Formats:**
- Input: JPEG, PNG, WebP, GIF
- Output: PNG (1024x1024)

### 3.3 Tool: list_available_models

**Purpose:** Return list of supported image generation models.

**Input Parameters:** None

**Output:**
```typescript
Array<{
  id: string;
  name: string;
  description: string;
  output_format: string;
  cost: string;
  default: boolean;
}>
```

**Behavior:**
- Return hardcoded list of supported models
- Mark default model
- Include pricing information

---

## 4. Non-Functional Requirements

### 4.1 Performance

**Response Time:**
- Server startup: <1 second
- Tool call processing: <50ms (excluding API)
- File I/O operations: <100ms
- Memory usage: <50MB idle, <200MB during generation

**Optimization Requirements:**
- Remove base64 data from responses (600KB → 0.3KB)
- Use streaming for large files
- Implement connection pooling for HTTP requests
- Cache model list in memory

### 4.2 Scalability

**Concurrency:**
- Support multiple sequential requests
- Queue requests to avoid API rate limits
- Handle 10+ images per minute

**Storage:**
- No built-in cleanup mechanism (user responsibility)
- Support unlimited file generation
- Warn if disk space <100MB

### 4.3 Reliability

**Error Recovery:**
- Graceful handling of API failures
- Retry logic with exponential backoff (3 retries)
- Detailed error messages in stderr
- Never crash on user input errors

**Monitoring:**
- Log all operations to stderr
- Include timestamps in logs
- Use emoji indicators for quick scanning:
  - 🎨 Image generation started
  - ✅ Success
  - ❌ Error
  - 📝 Info

**Uptime Requirements:**
- 99.9% availability (excluding API downtime)
- Graceful shutdown on SIGTERM/SIGINT
- No memory leaks during extended operation

### 4.4 Security

**API Key Handling:**
- NEVER log or expose API keys
- Read from environment variable only
- Validate key format before use
- Support key rotation without restart

**Input Validation:**
- Sanitize file paths (prevent directory traversal)
- Validate image URLs (no local file:// access)
- Limit prompt length (max 10,000 characters)
- Escape special characters in filenames

**Network Security:**
- Use HTTPS only for API calls
- Validate SSL certificates
- Implement request timeout (60 seconds)
- No proxy support (use system proxy)

### 4.5 Compatibility

**Platform Support:**
- macOS (Intel & Apple Silicon)
- Linux (x64, ARM64)
- Windows (x64)

**Node.js Versions:**
- Minimum: 18.0.0
- Recommended: 20.0.0 (LTS)
- Maximum tested: 22.0.0

**MCP Clients:**
- OpenCode 1.0+
- Claude Desktop (all versions with MCP)
- Cursor IDE (with MCP plugin)
- Any client supporting MCP protocol 1.0

### 4.6 Maintainability

**Code Quality:**
- 100% TypeScript (no `any` types)
- ESLint + Prettier configured
- Maximum function complexity: 10
- Maximum file length: 500 lines

**Testing Requirements:**
- Unit tests for all utility functions (80% coverage)
- Integration tests for tool handlers
- Manual testing with MCP Inspector
- Smoke test before each release

**Documentation:**
- JSDoc comments for all public functions
- README with quick start guide
- CHANGELOG for all releases
- API reference documentation

---

## 5. User Experience Requirements

### 5.1 Installation

**npm Installation:**
```bash
npm install -g @username/openrouter-image-gen-mcp
```

**npx Usage (Recommended):**
```bash
npx @username/openrouter-image-gen-mcp
```

**Time to First Use:**
- Installation: <30 seconds
- Configuration: <2 minutes
- First image: <15 seconds

### 5.2 Configuration

**OpenCode Configuration:**
```json
{
  "mcp": {
    "image-generator": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "@username/openrouter-image-gen-mcp"],
      "environment": {
        "OPENROUTER_API_KEY": "sk-or-v1-xxx"
      }
    }
  }
}
```

**Environment Variables:**
- `OPENROUTER_API_KEY` (required) - API key from OpenRouter
- `IMAGE_OUTPUT_DIR` (optional) - Default output directory
- `LOG_LEVEL` (optional) - Logging verbosity (info/debug)

### 5.3 Usage Examples

**Example 1: Simple Generation**
```
User: Generate an image: beautiful sunset over ocean

Response:
✅ Image generated and saved
📁 File: /home/user/generated_beautiful_sunset_2025-10-26T21-45-30.png
📏 Size: 245.67 KB
🎨 Model: google/gemini-2.5-flash-image-preview
```

**Example 2: Custom Path**
```
User: Generate a cat image and save as ./renders/cat.png

Response:
✅ Image saved to /home/user/project/renders/cat.png
📏 Size: 312.45 KB
```

**Example 3: Image Editing**
```
User: Edit sunset.png by adding flying birds

Response:
✅ Image edited successfully
📁 File: edited_adding_flying_birds_2025-10-26T21-50-15.png
📏 Size: 289.12 KB
```

### 5.4 Error Messages

**User-Friendly Errors:**

```typescript
// API Key Missing
{
  "error": "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
  "help": "Get your free API key at: https://openrouter.ai/keys"
}

// Network Error
{
  "error": "Failed to connect to OpenRouter API",
  "details": "Network timeout after 60 seconds",
  "suggestion": "Check your internet connection"
}

// Insufficient Balance
{
  "error": "OpenRouter API returned error: Insufficient credits",
  "help": "Add credits at: https://openrouter.ai/credits"
}

// Invalid Image Format
{
  "error": "Unsupported image format: image/svg+xml",
  "supported": ["image/jpeg", "image/png", "image/webp"]
}
```

---

## 6. Development Requirements

### 6.1 Project Structure

```
openrouter-image-gen-mcp/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/
│   │   ├── generate.ts       # generate_image handler
│   │   ├── edit.ts           # edit_image handler
│   │   └── models.ts         # list_models handler
│   ├── services/
│   │   ├── openrouter.ts     # OpenRouter API client
│   │   └── filesystem.ts     # File operations
│   └── utils/
│       ├── filename.ts       # Filename generation
│       ├── logger.ts         # Logging utilities
│       └── validation.ts     # Input validation
├── dist/                     # Compiled JavaScript
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── README.md
├── CHANGELOG.md
├── LICENSE
└── .gitignore
```

### 6.2 Build Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "inspect": "npx @modelcontextprotocol/inspector dist/index.js",
    "prepare": "npm run build",
    "prepublishOnly": "npm test && npm run lint"
  }
}
```

### 6.3 Development Workflow

**Phase 1: Core Implementation (Week 1)**
- Day 1-2: Project setup, basic MCP server
- Day 3-4: OpenRouter API integration
- Day 5: File system operations
- Day 6-7: Testing and debugging

**Phase 2: Feature Complete (Week 2)**
- Day 1-2: Image editing functionality
- Day 3: Error handling improvements
- Day 4-5: Documentation
- Day 6-7: Integration testing

**Phase 3: Release Preparation (Week 3)**
- Day 1-2: Package optimization
- Day 3: npm publishing setup
- Day 4-5: User testing and feedback
- Day 6-7: Final polish and release

### 6.4 Testing Strategy

**Unit Tests:**
- Filename generation logic
- Data URI parsing
- Input validation
- Error message formatting

**Integration Tests:**
- Complete tool execution flow
- API mocking for consistent results
- File system operations
- MCP protocol compliance

**Manual Testing:**
- MCP Inspector testing
- OpenCode integration
- Claude Desktop integration
- Cross-platform verification

**Test Coverage Goals:**
- Overall: 80%+
- Utility functions: 100%
- Tool handlers: 90%+
- Error paths: 100%

---

## 7. Distribution Requirements

### 7.1 npm Package

**Package Name:** `@username/openrouter-image-gen-mcp`

**Version Strategy:** Semantic Versioning (SemVer)
- Major: Breaking changes to API or behavior
- Minor: New features, backward compatible
- Patch: Bug fixes

**npm Keywords:**
```json
[
  "mcp",
  "model-context-protocol",
  "openrouter",
  "image-generation",
  "nano-banana",
  "gemini",
  "ai",
  "typescript"
]
```

**Package Size Requirements:**
- Source: <100 KB
- Compiled: <200 KB
- Total (with dependencies): <5 MB

### 7.2 MCP Registry

**server.json Configuration:**
```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
  "name": "io.github.username/openrouter-image-gen",
  "title": "OpenRouter Image Generator",
  "description": "Generate and edit images using OpenRouter's Nano Banana model",
  "version": "1.0.0",
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@username/openrouter-image-gen-mcp",
      "version": "1.0.0",
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["@username/openrouter-image-gen-mcp"],
        "environment": {
          "OPENROUTER_API_KEY": "${OPENROUTER_API_KEY}"
        }
      }
    }
  ],
  "tools": [
    {
      "name": "generate_image",
      "description": "Generate an image from text description"
    },
    {
      "name": "edit_image",
      "description": "Edit an existing image with instructions"
    },
    {
      "name": "list_available_models",
      "description": "List supported image generation models"
    }
  ]
}
```

### 7.3 Documentation

**README.md Structure:**
1. Hero section with badges
2. Quick start (3 steps max)
3. Features list
4. Installation methods
5. Configuration examples
6. Usage examples
7. API reference
8. Troubleshooting
9. Contributing guidelines
10. License

**Required Badges:**
- npm version
- npm downloads
- License
- TypeScript
- MCP Protocol version

**CHANGELOG.md Format:**
```markdown
# Changelog

## [1.0.0] - 2025-10-26

### Added
- Initial release
- Image generation via OpenRouter
- Automatic file saving
- Support for Nano Banana model

### Changed
- (none)

### Fixed
- (none)
```

---

## 8. Success Metrics

### 8.1 Technical Metrics

**Performance:**
- Server startup time: <1 second
- Response time (excluding API): <150ms
- Memory usage: <50MB idle
- Package size: <200KB compiled

**Quality:**
- Test coverage: >80%
- Zero critical bugs in production
- TypeScript strict mode enabled
- No `any` types in production code

### 8.2 User Metrics

**Adoption:**
- 100+ npm downloads in first month
- 10+ stars on GitHub
- 5+ positive user reviews
- Listed in MCP Registry

**Usage:**
- 500+ image generations in first month
- <5% error rate (excluding API errors)
- Average session: 3+ images generated
- 80%+ success rate on first try

### 8.3 Developer Experience

**Time Metrics:**
- Time to install: <30 seconds
- Time to first success: <5 minutes
- Time to understand API: <10 minutes

**Support Metrics:**
- Issue resolution time: <48 hours
- Documentation completeness: 100%
- Example coverage: 100% of features

---

## 9. Risk Analysis

### 9.1 Technical Risks

**Risk 1: OpenRouter API Changes**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Version pinning, API abstraction layer, monitoring

**Risk 2: MCP Protocol Changes**
- **Impact:** High
- **Probability:** Low
- **Mitigation:** Use official SDK, follow changelog

**Risk 3: Node.js Compatibility**
- **Impact:** Medium
- **Probability:** Low
- **Mitigation:** Target LTS versions, test on multiple versions

**Risk 4: File System Permissions**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:** Clear error messages, permission checking

### 9.2 Business Risks

**Risk 1: API Costs**
- **Impact:** Medium
- **Probability:** High
- **Mitigation:** Clear pricing documentation, usage monitoring

**Risk 2: Competition**
- **Impact:** Low
- **Probability:** High
- **Mitigation:** Focus on ease of use, fast iteration

**Risk 3: Limited Adoption**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:** Strong documentation, community engagement

---

## 10. Future Enhancements

### 10.1 Version 1.1 (Q1 2026)

**Planned Features:**
- Batch image generation
- Custom output dimensions
- Image format selection (PNG/JPEG/WebP)
- Progress callbacks for long operations
- Automatic retry on transient errors

### 10.2 Version 1.2 (Q2 2026)

**Planned Features:**
- Image compression options
- Metadata embedding (EXIF)
- Template system for consistent styling
- Multi-model comparison mode
- Cost estimation before generation

### 10.3 Version 2.0 (Q3 2026)

**Potential Breaking Changes:**
- Support for additional APIs (DALL-E, Midjourney)
- Plugin architecture for extensibility
- Database storage option
- Web UI for configuration
- Cloud deployment support

---

## 11. Appendices

### 11.1 Glossary

- **MCP (Model Context Protocol):** Protocol for connecting AI assistants to external tools
- **OpenRouter:** API gateway for multiple AI models
- **Nano Banana:** Nickname for Gemini 2.5 Flash Image model
- **Data URI:** Inline representation of file data in URL format
- **stdio:** Standard input/output communication method
- **JSON-RPC:** Remote procedure call protocol encoded in JSON

### 11.2 References

1. [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
2. [OpenRouter API Documentation](https://openrouter.ai/docs)
3. [Gemini 2.5 Flash Image Model](https://ai.google.dev/gemini-api/docs/image-generation)
4. [TypeScript Handbook](https://www.typescriptlang.org/docs/)
5. [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

### 11.3 Contact Information

- **Project Lead:** [Name]
- **Technical Lead:** [Name]
- **Repository:** https://github.com/username/openrouter-image-gen-mcp
- **Support Email:** support@example.com
- **Discord:** [Community Link]

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Technical Lead | | | |
| Engineering Manager | | | |

---

**Document Control:**
- **Created:** October 26, 2025
- **Last Modified:** October 26, 2025
- **Version:** 1.0
- **Next Review:** November 26, 2025
