import { ChatInputCommandInteraction, CacheType, MessagePayload, MessageCreateOptions } from 'discord.js';
import { logger } from './logger.js';
import { createBaseEmbed, EMBED_COLORS } from './embed.js';

export async function sendDM(
  interaction: ChatInputCommandInteraction<CacheType>,
  content: string | MessagePayload | MessageCreateOptions
): Promise<void> {
  if (!interaction.guild) {
    await interaction.editReply(content as any);
    return;
  }

  try {
    const dmChannel = await interaction.user.createDM();
    await dmChannel.send(content);
  } catch (error: any) {
    logger.error('Failed to send DM', { user: interaction.user.id, error: error.message });
    const errorEmbed = createBaseEmbed('❌ DM Failed', EMBED_COLORS.error)
      .setDescription('Could not send you a DM. Please enable DMs from server members in your privacy settings.');

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}
