import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { logger } from '../utils/logger.js';
import { createErrorEmbed, createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { findOrCreateUser, saveDebugHistory } from '../database/models.js';
import { sendDM } from '../utils/dm.js';
import { setContext } from '../utils/context.js';

export interface CommandResult {
  input?: string;
  error?: string;
  output?: string;
  systemPrompt?: string;
  userMessage?: string;
}

export type CommandHandler = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<CommandResult | void>;

export interface Command {
  data: SlashCommandBuilder;
  execute: CommandHandler;
}

export async function executeCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
  handler: CommandHandler
): Promise<void> {
  try {
    await findOrCreateUser(interaction.user.id);
    const isDM = !interaction.guild;

    await interaction.reply({
      embeds: [createBaseEmbed('📬 Processing', EMBED_COLORS.info)
        .setDescription('ZeroBug is working on your request.')],
      ephemeral: true,
    });

    await interaction.editReply({
      embeds: [createBaseEmbed('⏳ Analyzing', EMBED_COLORS.info)
        .setDescription('Running AI analysis...')],
    });

    const result = (await handler(interaction)) || {};

    if (result.output) {
      saveDebugHistory(interaction.user.id, interaction.commandName, result.input, result.error, result.output).catch(() => {});
    }

    if (result.systemPrompt && result.userMessage && result.output) {
      setContext(interaction.user.id, {
        command: interaction.commandName,
        systemPrompt: result.systemPrompt,
        userMessage: result.userMessage,
        response: result.output,
        timestamp: Date.now(),
      });
    }

    if (interaction.guild) {
      await interaction.editReply({
        embeds: [createBaseEmbed('✅ Complete', EMBED_COLORS.success)
          .setDescription('Check your **DMs** for the result.')],
      });
    }
  } catch (error: any) {
    logger.error('Command execution error', {
      command: interaction.commandName,
      user: interaction.user.id,
      error: error.message,
    });

    const errorEmbed = createErrorEmbed(
      '❌ Error',
      error?.message || 'An unexpected error occurred. Please try again later.'
    );

    try {
      await sendDM(interaction, { embeds: [errorEmbed] });
    } catch {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  }
}
