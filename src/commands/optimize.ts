import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { Command } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { formatCodeBlock } from '../utils/formatter.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const code = interaction.options.getString('code', true);

  const analysis = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.optimize,
    `## Code to Optimize\n\`\`\`\n${code}\n\`\`\``
  );

  const embed = createBaseEmbed('⚡ Code Optimization', EMBED_COLORS.primary)
    .setDescription('**Before → After**')
    .addFields(
      {
        name: '📦 Original Code',
        value: formatCodeBlock(analysis.oldCode || code),
        inline: false,
      },
      {
        name: '🚀 Optimized Code',
        value: formatCodeBlock(analysis.optimizedCode || ''),
        inline: false,
      },
      {
        name: '📈 Performance Gain',
        value: analysis.performanceGain || 'Optimization complete.',
        inline: false,
      }
    );

  await sendDM(interaction, { embeds: [embed] });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('optimize')
    .setDescription('Optimize your code for better performance and readability')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Paste your code to optimize')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute,
};

export default command;
