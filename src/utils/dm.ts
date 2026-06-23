import { CommandInteraction, CacheType, MessagePayload, MessageCreateOptions } from 'discord.js';
import { logger } from './logger.js';
import { createBaseEmbed, EMBED_COLORS } from './embed.js';

export async function sendDM(
  interaction: CommandInteraction<CacheType>,
  content: string | MessagePayload | MessageCreateOptions
): Promise<void> {
  try {
    const dmChannel = await interaction.user.createDM();
    await dmChannel.send(content);
  } catch (error: any) {
    logger.error('Failed to send DM', { user: interaction.user.id, error: error.message });
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        embeds: [createBaseEmbed('❌ DM Failed', EMBED_COLORS.error)
          .setDescription('Could not send you a DM. Please enable DMs from server members in your privacy settings.')],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [createBaseEmbed('❌ DM Failed', EMBED_COLORS.error)
          .setDescription('Could not send you a DM. Please enable DMs from server members in your privacy settings.')],
        ephemeral: true,
      });
    }
  }
}
