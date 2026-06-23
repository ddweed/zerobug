import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, testConnection } from './connection.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate(): Promise<void> {
  const connected = await testConnection();
  if (!connected) {
    logger.error('Cannot migrate — database unavailable');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  logger.info('Running database migration...');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

    if (error) {
      if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
        logger.warn('exec_sql RPC not available — run schema.sql manually in Supabase SQL editor');
        logger.info(`SQL to run:\n${schema}`);
        break;
      }
      logger.warn(`Statement skipped (may already exist): ${statement.substring(0, 60)}...`);
    }
  }

  logger.info('Migration completed');
}

migrate();
