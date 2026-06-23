import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { client } from './bot/client.js';
import { testConnection } from './database/connection.js';
import express from 'express';

async function main(): Promise<void> {
  logger.info('🤖 ZeroBug AI — Initializing...');

  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('Database unavailable — some features will be degraded');
  }

  const app = express();
  app.use(express.json());

  app.get(['/', '/health'], (_req, res) => {
    res.json({
      status: 'healthy',
      version: config.BOT_VERSION,
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });

  app.listen(config.PORT, () => {
    logger.info(`Health check server running on port ${config.PORT}`);
  });

  try {
    await client.login(config.DISCORD_TOKEN);
    logger.info('Bot logged in successfully');
  } catch (error: any) {
    logger.error('Failed to login', { error: error.message });
    process.exit(1);
  }
}

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled rejection', { error: error.message, stack: error.stack });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  client.destroy();
  process.exit(0);
});

main();
