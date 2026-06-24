import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { AIServiceResponse } from '../types/index.js';

const groq = new OpenAI({
  apiKey: config.GROQ_API_KEY,
  baseURL: config.GROQ_BASE_URL,
  timeout: 120000,
  maxRetries: 3,
});

export async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    model?: string;
    temperature?: number;
    responseFormat?: 'text' | 'json_object';
  }
): Promise<AIServiceResponse> {
  const model = options?.model || config.GROQ_MODEL;
  const maxTokens = options?.maxTokens || config.GROQ_MAX_TOKENS;
  const temperature = options?.temperature ?? 0.3;
  const responseFormat = options?.responseFormat;

  const startTime = Date.now();

  try {
    const completion = await groq.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: responseFormat === 'json_object'
        ? { type: 'json_object' }
        : undefined,
    });

    const duration = Date.now() - startTime;
    const choice = completion.choices[0];
    const content = choice?.message?.content || '';

    const usage = completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    logger.info('AI response generated', {
      model,
      duration: `${duration}ms`,
      tokens: usage.totalTokens,
    });

    return { content, usage, model };
  } catch (error: any) {
    logger.error('Groq API error', {
      error: error.message,
      model,
      status: error.status,
    });

    if (error.status === 429) {
      throw new Error('AI service is rate limited. Please try again in a moment.');
    }
    if (error.status === 401) {
      throw new Error('AI service authentication failed. Contact the bot administrator.');
    }

    throw new Error(`AI service error: ${error.message}`);
  }
}

export async function generateJsonResponse<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const response = await generateResponse(systemPrompt, userMessage, {
    responseFormat: 'json_object',
    temperature: 0.2,
  });

  if (!response.content) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  try {
    const parsed = JSON.parse(response.content) as T;
    return parsed;
  } catch {
    logger.error('Failed to parse AI JSON response', {
      content: response.content.substring(0, 200),
    });
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function generateSimpleResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await generateResponse(systemPrompt, userMessage, {
    temperature: 0.7,
    maxTokens: 1500,
  });
  return response.content;
}
