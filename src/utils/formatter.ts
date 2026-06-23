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

export function truncateCode(code: string, maxLength: number = 3900): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength - 100) + '\n\n// ... truncated (code too long)';
}

export function formatDiff(oldCode: string, newCode: string): string {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  const lines: string[] = [];
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[i] ?? '';

    if (oldLine !== newLine) {
      if (oldLine) lines.push(`- ${oldLine}`);
      if (newLine) lines.push(`+ ${newLine}`);
    } else {
      lines.push(`  ${oldLine}`);
    }
  }

  return lines.join('\n');
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\([`*_{}[\]()#+\-.!|])/g, '$1')
    .replace(/[`*_{}[\]()#+\-.!|]/g, '\\$&');
}
