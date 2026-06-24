import { supabase } from './connection.js';
import { UserData } from '../types/index.js';
import { logger } from '../utils/logger.js';

export async function findOrCreateUser(discordId: string): Promise<UserData> {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single();

  if (existing) return existing as unknown as UserData;

  const { data, error } = await supabase
    .from('users')
    .insert({ discord_id: discordId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: retry } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .single();
      if (retry) return retry as unknown as UserData;
    }
    logger.error('Failed to create user', { discordId, error: error.message });
    throw new Error('Failed to create user');
  }

  return data as unknown as UserData;
}

export async function getUser(discordId: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) {
    logger.error('Failed to get user', { discordId, error: error.message });
    return null;
  }

  return data as unknown as UserData;
}

export async function saveDebugHistory(
  discordId: string,
  command: string,
  inputCode: string | undefined,
  errorMessage: string | undefined,
  outputData: unknown
): Promise<void> {
  const user = await getUser(discordId);
  if (!user) return;

  const { error } = await supabase.from('debug_history').insert({
    user_id: (user as any).id,
    command,
    input_code: inputCode,
    error_message: errorMessage,
    output_data: JSON.stringify(outputData),
  });

  if (error) {
    logger.error('Failed to save debug history', { discordId, error: error.message });
  }
}

export async function getUsageStats(discordId: string): Promise<{
  totalRequests: number;
  requestsToday: number;
} | null> {
  const { data, error } = await supabase
    .from('users')
    .select('total_requests, requests_today')
    .eq('discord_id', discordId)
    .single();

  if (error || !data) return null;

  return {
    totalRequests: (data as any).total_requests,
    requestsToday: (data as any).requests_today,
  };
}
