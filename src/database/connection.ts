import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import ws from 'ws';

let supabase: SupabaseClient;

try {
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    realtime: {
      transport: ws,
    },
  });
  logger.info('Supabase client initialized');
} catch (error: any) {
  logger.error('Failed to initialize Supabase client', { error: error.message });
  throw error;
}

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      logger.error('Supabase connection test failed', { error: error.message });
      return false;
    }
    logger.info('Supabase connection established');
    return true;
  } catch (error: any) {
    logger.error('Supabase connection error', { error: error.message });
    return false;
  }
}

export { supabase };
