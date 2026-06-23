import { Client, GatewayIntentBits, Partials, Collection, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { Command, executeCommand } from '../commands/index.js';
import { createBaseEmbed, EMBED_COLORS, createErrorEmbed } from '../utils/embed.js';
import { sendDM } from '../utils/dm.js';
import { getUsageStats } from '../database/models.js';

import fixCommand from '../commands/fix.js';
import reviewCommand from '../commands/review.js';
import optimizeCommand from '../commands/optimize.js';
import explainCommand from '../commands/explain.js';
import generateCommand from '../commands/generate.js';
import askCommand from '../commands/ask.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const commands = new Collection<string, Command>();
commands.set('fix', fixCommand);
commands.set('review', reviewCommand);
commands.set('optimize', optimizeCommand);
commands.set('explain', explainCommand);
commands.set('generate', generateCommand);
commands.set('ask', askCommand);

client.once('ready', () => {
  logger.info(`🤖 ZeroBug is online as ${client.user?.tag}`);
  logger.info(`🌐 Serving ${client.guilds.cache.size} guilds`);
  client.user?.setActivity('/help | ZeroBug AI', { type: 3 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction;

  const command = commands.get(cmd.commandName);

  if (command) {
    await executeCommand(cmd, command.execute);
    return;
  }

  switch (cmd.commandName) {
    case 'help':
      await handleHelp(cmd);
      break;
    case 'ping':
      await handlePing(cmd);
      break;
    case 'usage':
      await handleUsage(cmd);
      break;
    case 'subscribe':
      await cmd.reply({
        embeds: [createBaseEmbed('📬 Check your DMs', EMBED_COLORS.info)
          .setDescription("I sent the subscription info via DM.")],
        ephemeral: true,
      });
      await sendDM(cmd, {
        embeds: [createBaseEmbed('🎉 Free Forever', EMBED_COLORS.success)
          .setDescription('ZeroBug is completely **free** to use! All features are available with no limits.\n\nJust use any command like `/fix`, `/review`, `/explain`, `/optimize`, `/generate`, or `/ask` to get started.')],
      });
      break;
    default:
      await cmd.reply({
        embeds: [createErrorEmbed('Unknown Command', 'That command does not exist. Use `/help` to see available commands.')],
        ephemeral: true,
      });
  }
});

async function handleHelp(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  await interaction.reply({
    embeds: [createBaseEmbed('📬 Check your DMs', EMBED_COLORS.info)
      .setDescription('I sent the help guide via DM.')],
    ephemeral: true,
  });

  const embed = createBaseEmbed('🤖 ZeroBug — AI Coding Assistant', EMBED_COLORS.primary)
    .setDescription('**Fix bugs faster. Write better code.**\nZeroBug is your AI-powered debugging companion.')
    .addFields(
      { name: '🐛 `/fix`', value: 'Debug your code — identify bugs and get fixed code', inline: false },
      { name: '⭐ `/review`', value: 'Get an AI code review with score & suggestions', inline: false },
      { name: '⚡ `/optimize`', value: 'Optimize code for performance & readability', inline: false },
      { name: '📖 `/explain`', value: 'Get a beginner-friendly code explanation', inline: false },
      { name: '🛠️ `/generate`', value: 'Generate production-ready code from a prompt', inline: false },
      { name: '💬 `/ask`', value: 'Ask any coding question to your AI mentor', inline: false },
      { name: '📊 `/usage`', value: 'Check your daily usage and plan', inline: false },
      { name: '🏓 `/ping`', value: 'Check bot latency', inline: false }
    );

  await sendDM(interaction, { embeds: [embed] });
}

async function handlePing(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  await interaction.reply({
    embeds: [createBaseEmbed('📬 Check your DMs', EMBED_COLORS.info)
      .setDescription('I sent my ping details via DM.')],
    ephemeral: true,
  });

  const latency = Date.now() - interaction.createdTimestamp;
  const wsPing = interaction.client.ws.ping;

  const embed = createBaseEmbed('🏓 Pong!', EMBED_COLORS.primary)
    .addFields(
      { name: '🤖 Bot Latency', value: `\`${latency}ms\``, inline: true },
      { name: '🌐 WebSocket', value: `\`${wsPing}ms\``, inline: true },
      { name: '📊 Uptime', value: `<t:${Math.floor((Date.now() - (interaction.client.readyTimestamp || Date.now())) / 1000)}:R>`, inline: true }
    );

  await sendDM(interaction, { embeds: [embed] });
}

async function handleUsage(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const stats = await getUsageStats(interaction.user.id);
  if (!stats) {
    await interaction.reply({ embeds: [createErrorEmbed('No Data', 'No usage data found.')], ephemeral: true });
    return;
  }

  const embed = createBaseEmbed('📊 ZeroBug Usage', EMBED_COLORS.primary)
    .setDescription('You have **unlimited free access** to all ZeroBug features.')
    .addFields(
      { name: '📊 Today', value: `\`${stats.requestsToday}\` requests`, inline: true },
      { name: '📈 Total', value: `\`${stats.totalRequests}\` requests (all time)`, inline: true },
      { name: '🎉 Status', value: 'All commands are **free and unlimited** — no subscription needed!', inline: false }
    );

  await interaction.reply({
    embeds: [createBaseEmbed('📬 Check your DMs', EMBED_COLORS.info)
      .setDescription('I sent your usage stats via DM.')],
    ephemeral: true,
  });

  await sendDM(interaction, { embeds: [embed] });
}

export { client };
