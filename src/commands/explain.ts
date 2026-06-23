import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { Command } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

async function execute(interaction: CommandInteraction<CacheType>): Promise<void> {
  const code = interaction.options.getString('code', true);

  const analysis = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.explain,
    `## Code to Explain\n\`\`\`\n${code}\n\`\`\``
  );

  const embed = createBaseEmbed('📖 Code Explanation', EMBED_COLORS.info)
    .setDescription(analysis.purpose || 'Code analysis')
    .addFields(
      {
        name: '🔍 Line-by-Line Breakdown',
        value: analysis.lineByLine?.length
          ? analysis.lineByLine.map((l, i) => `**${i + 1}.** ${l}`).join('\n')
          : 'Breakdown unavailable',
        inline: false,
      },
      {
        name: '📖 Full Explanation',
        value: analysis.explanation || 'No explanation available',
        inline: false,
      }
    );

  await sendDM(interaction, { embeds: [embed] });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Get a beginner-friendly explanation of any code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Paste the code you want explained')
        .setRequired(true)
    ),
  execute,
};

export default command;
