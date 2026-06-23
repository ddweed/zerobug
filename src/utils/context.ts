interface ConversationContext {
  command: string;
  systemPrompt: string;
  userMessage: string;
  response: string;
  timestamp: number;
}

const contexts = new Map<string, ConversationContext>();

const EXPIRY_MS = 30 * 60 * 1000;

export function setContext(userId: string, ctx: ConversationContext): void {
  contexts.set(userId, ctx);
}

export function getContext(userId: string): ConversationContext | undefined {
  const ctx = contexts.get(userId);
  if (!ctx) return undefined;
  if (Date.now() - ctx.timestamp > EXPIRY_MS) {
    contexts.delete(userId);
    return undefined;
  }
  return ctx;
}

export function clearContext(userId: string): void {
  contexts.delete(userId);
}
