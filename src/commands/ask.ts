import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { Command, CommandResult } from './index.js';
import { generateSimpleResponse } from '../services/ai.js';
import { SYSTEM_ASK_PROMPT } from '../config/prompts.js';
import { createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { sendDM } from '../utils/dm.js';

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<CommandResult | void> {
  const question = interaction.options.getString('question', true);

  const answer = await generateSimpleResponse(
    SYSTEM_ASK_PROMPT,
    question
  );

  const embed = createBaseEmbed('💬 ZeroBug AI', EMBED_COLORS.info)
    .setDescription(answer.length > 4000 ? answer.substring(0, 4000) + '...' : answer);

  await sendDM(interaction, { embeds: [embed] });

  return {
    input: question,
    output: answer,
    systemPrompt: SYSTEM_ASK_PROMPT,
    userMessage: question,
  };
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask any coding question — ZeroBug is your AI mentor')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your coding question')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute,
};

export default command;
