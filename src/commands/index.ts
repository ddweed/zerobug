import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { logger } from '../utils/logger.js';
import { createErrorEmbed, createBaseEmbed, EMBED_COLORS } from '../utils/embed.js';
import { findOrCreateUser } from '../database/models.js';
import { sendDM } from '../utils/dm.js';

export type CommandHandler = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;

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

    await interaction.reply({
      embeds: [createBaseEmbed('📬 Processing', EMBED_COLORS.info)
        .setDescription('ZeroBug is working on your request. Check your **DMs** for the result.')],
      ephemeral: true,
    });

    await handler(interaction);
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
