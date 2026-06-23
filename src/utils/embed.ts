import { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config/index.js';

export const EMBED_COLORS = {
  primary: 0x00ff88,
  success: 0x00ff88,
  error: 0xff3355,
  warning: 0xffaa00,
  info: 0x3399ff,
  dark: 0x0a0a0f,
  accent: 0x00ffcc,
};

export function createBaseEmbed(title: string, color: number = EMBED_COLORS.primary): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp()
    .setFooter({
      text: `ZeroBug v${config.BOT_VERSION} • /help for commands`,
      iconURL: 'https://i.imgur.com/3YQ8Z0p.png',
    });
}

export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(title, EMBED_COLORS.success)
    .setDescription(description);
}

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return createBaseEmbed(title, EMBED_COLORS.error)
    .setDescription(description);
}

export function createCodeEmbed(
  title: string,
  code: string,
  language: string = 'js',
  color: number = EMBED_COLORS.primary
): EmbedBuilder {
  const truncated = code.length > 3800 ? code.substring(0, 3800) + '\n\n```\n// ... truncated' : code;
  return createBaseEmbed(title, color)
    .setDescription(`\`\`\`${language}\n${truncated}\n\`\`\``);
}

export function createAnalysisEmbed(
  title: string,
  sections: Array<{ name: string; value: string; inline?: boolean }>,
  color: number = EMBED_COLORS.primary
): EmbedBuilder {
  const embed = createBaseEmbed(title, color);
  for (const section of sections) {
    embed.addFields({ name: section.name, value: section.value, inline: section.inline ?? false });
  }
  return embed;
}

export function addCodeButton(row: ActionRowBuilder<ButtonBuilder>, label: string, customId: string): ActionRowBuilder<ButtonBuilder> {
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Secondary)
  );
  return row;
}

export function createActionRow(...buttons: Array<{ label: string; customId: string; style?: ButtonStyle }>): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  for (const btn of buttons) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(btn.customId)
        .setLabel(btn.label)
        .setStyle(btn.style ?? ButtonStyle.Secondary)
    );
  }
  return row;
}
