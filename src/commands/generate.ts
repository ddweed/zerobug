import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { Command } from './index.js';
import { generateJsonResponse } from '../services/ai.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { formatCodeBlock } from '../utils/formatter.js';
import { sendDM } from '../utils/dm.js';
import { CodeAnalysis } from '../types/index.js';

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const prompt = interaction.options.getString('prompt', true);
  const language = interaction.options.getString('language') || '';
  const details = interaction.options.getString('details') || '';

  const userMessage = [
    `## Request: ${prompt}`,
    language ? `Language/Framework: ${language}` : '',
    details ? `Additional Details: ${details}` : '',
    '\nGenerate production-quality, complete, working code.',
  ].filter(Boolean).join('\n');

  const result = await generateJsonResponse<CodeAnalysis>(
    SYSTEM_PROMPTS.generate,
    userMessage
  );

  const embed = createBaseEmbed('🛠️ Code Generation', EMBED_COLORS.primary)
    .setDescription(result.explanation || `Generated code for: **${prompt}**`)
    .addFields(
      {
        name: '📁 Structure',
        value: result.folderStructure || 'Single file',
        inline: false,
      },
      {
        name: '💻 Generated Code',
        value: formatCodeBlock(result.fixedCode || ''),
        inline: false,
      }
    );

  if (result.suggestions?.length) {
    embed.addFields({
      name: '💡 Tips',
      value: result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      inline: false,
    });
  }

  await sendDM(interaction, { embeds: [embed] });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generate production-ready code from a description')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Describe what you want to build')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Language or framework (e.g., React, Python, Node.js)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('details')
        .setDescription('Additional requirements or specifications')
        .setRequired(false)
    ) as SlashCommandBuilder,
  execute,
};

export default command;
