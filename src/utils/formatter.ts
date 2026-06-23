import hljs from 'highlight.js';

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  go: 'go',
  cs: 'csharp',
  cpp: 'cpp',
  java: 'java',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  sh: 'bash',
  bash: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  sql: 'sql',
  html: 'html',
  css: 'css',
};

export function detectLanguage(code: string, hint?: string): string {
  if (hint && LANGUAGE_ALIASES[hint.toLowerCase()]) {
    return LANGUAGE_ALIASES[hint.toLowerCase()];
  }

  try {
    const result = hljs.highlightAuto(code);
    return result.language || 'plaintext';
  } catch {
    return 'plaintext';
  }
}

const DISCORD_CODE_BLOCK_LIMIT = 3900;

export function formatCodeBlock(code: string, hint?: string): string {
  const lang = detectLanguage(code, hint);
  const maxContent = DISCORD_CODE_BLOCK_LIMIT - lang.length - 6;

  let content = code;
  if (content.length > maxContent) {
    content = content.slice(0, maxContent - 50) + '\n\n// ... truncated (code too long)';
  }

  return `\`\`\`${lang}\n${content}\n\`\`\``;
}

export function truncateCode(code: string, maxLength: number = 3900): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength - 100) + '\n\n// ... truncated (code too long)';
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\([`*_{}[\]()#+\-.!|])/g, '$1')
    .replace(/[`*_{}[\]()#+\-.!|]/g, '\\$&');
}
