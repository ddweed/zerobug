import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { Command, CommandResult } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { formatCodeBlock, truncateField } from '../utils/formatter.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<CommandResult | void> {
  const code = interaction.options.getString('code', true);

  const userMessage = `## Code to Optimize\n\`\`\`\n${code}\n\`\`\``;

  const analysis = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.optimize,
    userMessage
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
        value: truncateField(analysis.performanceGain || 'Optimization complete.'),
        inline: false,
      }
    );

  await sendDM(interaction, { embeds: [embed] });

  return {
    input: code,
    output: analysis.optimizedCode || analysis.performanceGain,
    systemPrompt: SYSTEM_PROMPTS.optimize,
    userMessage,
  };
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
