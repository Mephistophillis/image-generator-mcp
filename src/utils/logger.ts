export const logger = {
  info: (message: string): void => {
    console.error(`[${new Date().toISOString()}] ${message}`);
  },
  error: (message: string): void => {
    console.error(`[${new Date().toISOString()}] ${message}`);
  },
  debug: (message: string): void => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.error(`[${new Date().toISOString()}] ${message}`);
    }
  },
};
