import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { Command } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { truncateCode } from '../utils/formatter.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

async function execute(interaction: CommandInteraction<CacheType>): Promise<void> {
  const code = interaction.options.getString('code', true);
  const error = interaction.options.getString('error') || 'No error message provided';
  const expected = interaction.options.getString('expected') || '';

  const userMessage = [
    `## Code`,
    `\`\`\`\n${code}\n\`\`\``,
    `## Error Message`,
    `\`\`\`\n${error}\n\`\`\``,
    expected ? `## Expected Result\n${expected}` : '',
  ].filter(Boolean).join('\n');

  const analysis = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.fix,
    userMessage
  );

  const embed = createBaseEmbed('🐛 Bug Fix Analysis', EMBED_COLORS.primary)
    .setDescription('**Problem Found**\n' + (analysis.problem || 'No problem detected'))
    .addFields(
      { name: '🔍 Root Cause', value: analysis.rootCause || 'Unknown', inline: false },
      { name: '✅ Fixed Code', value: `\`\`\`\n${truncateCode(analysis.fixedCode || '')}\n\`\`\``, inline: false },
      { name: '📖 Explanation', value: analysis.explanation || 'No explanation provided', inline: false }
    );

  await sendDM(interaction, { embeds: [embed] });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('fix')
    .setDescription('Debug your code — identify bugs and get fixed code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Paste your code snippet')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('error')
        .setDescription('Paste the error message (if any)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('expected')
        .setDescription('What did you expect to happen?')
        .setRequired(false)
    ),
  execute,
};

export default command;
