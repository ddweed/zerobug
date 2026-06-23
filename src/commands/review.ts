import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { Command } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

function scoreToColor(score: number): number {
  if (score >= 8) return EMBED_COLORS.success;
  if (score >= 5) return EMBED_COLORS.warning;
  return EMBED_COLORS.error;
}

function scoreToEmoji(score: number): string {
  if (score >= 9) return '🏆';
  if (score >= 7) return '⭐';
  if (score >= 5) return '⚡';
  return '🔧';
}

async function execute(interaction: CommandInteraction<CacheType>): Promise<void> {
  const code = interaction.options.getString('code', true);
  const language = interaction.options.getString('language') || '';

  const userMessage = [
    language ? `Language: ${language}` : '',
    '## Code to Review',
    `\`\`\`\n${code}\n\`\`\``,
  ].filter(Boolean).join('\n');

  const analysis = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.review,
    userMessage
  );

  const score = analysis.score ?? 0;
  const color = scoreToColor(score);
  const emoji = scoreToEmoji(score);

  const embed = createBaseEmbed(`${emoji} Code Review — Score: ${score.toFixed(1)}/10`, color)
    .setDescription('**Overall Assessment**')
    .addFields(
      {
        name: '✅ Strengths',
        value: (analysis.strengths?.length
          ? analysis.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')
          : 'None identified'),
        inline: false,
      },
      {
        name: '⚠️ Weaknesses',
        value: (analysis.weaknesses?.length
          ? analysis.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')
          : 'None identified'),
        inline: false,
      },
      {
        name: '💡 Suggestions',
        value: (analysis.suggestions?.length
          ? analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
          : 'No suggestions'),
        inline: false,
      }
    );

  await sendDM(interaction, { embeds: [embed] });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Get an AI code review with score, strengths, and improvements')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Paste your code for review')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language (optional)')
        .setRequired(false)
    ),
  execute,
};

export default command;
