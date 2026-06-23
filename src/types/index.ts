export interface UserData {
  userId: string;
  requestsToday: number;
  lastRequestDate: string;
  totalRequests: number;
  createdAt: Date;
  guildId?: string;
}

export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AIServiceResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface CodeAnalysis {
  problem?: string;
  rootCause?: string;
  fixedCode?: string;
  explanation?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  oldCode?: string;
  optimizedCode?: string;
  performanceGain?: string;
  lineByLine?: string[];
  purpose?: string;
  folderStructure?: string;
}

export interface SlashCommand {
  data: unknown;
  execute: (interaction: unknown) => Promise<void>;
}

export interface EmbedColors {
  primary: number;
  success: number;
  error: number;
  warning: number;
  info: number;
}
