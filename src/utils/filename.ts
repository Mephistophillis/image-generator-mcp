import { logger } from './logger';

export function generateFilename(prompt: string, prefix: string = 'generated'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);

  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);

  return `${prefix}_${safePrompt}_${timestamp}.png`;
}

export function saveImageFromDataUri(dataUri: string, filePath: string): Promise<{ size: number }> {
  return new Promise<{ size: number }>((resolve, reject) => {
    try {
      const base64Data = dataUri.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid data URI format');
      }

      const buffer = Buffer.from(base64Data, 'base64');

      import('fs')
        .then(fs => {
          fs.writeFileSync(filePath, buffer);
          const size = buffer.length;
          logger.info(`💾 Image saved: ${filePath} (${(size / 1024).toFixed(2)} KB)`);
          resolve({ size });
        })
        .catch(reject);
    } catch (error) {
      logger.error(
        `❌ Failed to save image: ${error instanceof Error ? error.message : String(error)}`
      );
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export function ensureDirectoryExists(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));

    import('fs')
      .then(fs => {
        if (dir && !fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          logger.debug(`📁 Created directory: ${dir}`);
        }
        resolve();
      })
      .catch(reject);
  });
}
