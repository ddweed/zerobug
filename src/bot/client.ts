import { Client, GatewayIntentBits, Partials, Collection, ChatInputCommandInteraction, CacheType, Message } from 'discord.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { Command, executeCommand } from '../commands/index.js';
import { createBaseEmbed, EMBED_COLORS, createErrorEmbed } from '../utils/embed.js';
import { sendDM } from '../utils/dm.js';
import { getUsageStats, saveDebugHistory } from '../database/models.js';
import { getContext, setContext } from '../utils/context.js';
import { generateSimpleResponse } from '../services/ai.js';

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

client.on('messageCreate', async (message: Message) => {
  if (message.guild || message.author.bot) return;
  if (message.author.id === client.user?.id) return;
  if (!message.reference?.messageId) return;

  const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
  if (!refMsg || refMsg.author.id !== client.user?.id) return;

  const ctx = getContext(message.author.id);
  if (!ctx) {
    await message.reply('Use a command like `/ask` first, then reply to follow up.');
    return;
  }

  const followUpPrompt = `Previous conversation context:
Command: ${ctx.command}
User's original request: ${ctx.userMessage}
Your previous response: ${ctx.response}

The user is replying to your previous response with:
${message.content}

Continue the conversation. Answer the user's follow-up question based on the context above.`;

  try {
    if (message.channel.isTextBased()) await message.channel.sendTyping();
    const answer = await generateSimpleResponse(ctx.systemPrompt, followUpPrompt);
    await message.reply(answer.length > 1900 ? answer.substring(0, 1900) + '...' : answer);

    setContext(message.author.id, {
      ...ctx,
      userMessage: followUpPrompt,
      response: answer,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error('Follow-up error', { user: message.author.id, error: error.message });
    await message.reply('Sorry, I ran into an error processing your follow-up. Please try again.');
  }
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
        embeds: [createBaseEmbed('🎉 Free Forever', EMBED_COLORS.success)
          .setDescription('ZeroBug is completely **free** to use! All features are available with no limits.\n\nJust use any command like `/fix`, `/review`, `/explain`, `/optimize`, `/generate`, or `/ask` to get started.')],
        ephemeral: true,
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
  const isDM = !interaction.guild;

  await interaction.reply({
    embeds: [createBaseEmbed('🤖 ZeroBug — AI Coding Assistant', EMBED_COLORS.primary)
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
      )],
    ephemeral: isDM ? false : true,
  });
}

async function handlePing(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const latency = Date.now() - interaction.createdTimestamp;
  const wsPing = interaction.client.ws.ping;

  await interaction.reply({
    embeds: [createBaseEmbed('🏓 Pong!', EMBED_COLORS.primary)
      .addFields(
        { name: '🤖 Bot Latency', value: `\`${latency}ms\``, inline: true },
        { name: '🌐 WebSocket', value: `\`${wsPing}ms\``, inline: true },
        { name: '📊 Uptime', value: `<t:${Math.floor((Date.now() - (interaction.client.readyTimestamp || Date.now())) / 1000)}:R>`, inline: true }
      )],
    ephemeral: true,
  });
}

async function handleUsage(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const stats = await getUsageStats(interaction.user.id);
  if (!stats) {
    await interaction.reply({ embeds: [createErrorEmbed('No Data', 'No usage data found.')], ephemeral: true });
    return;
  }

  await interaction.reply({
    embeds: [createBaseEmbed('📊 ZeroBug Usage', EMBED_COLORS.primary)
      .setDescription('You have **unlimited free access** to all ZeroBug features.')
      .addFields(
        { name: '📊 Today', value: `\`${stats.requestsToday}\` requests`, inline: true },
        { name: '📈 Total', value: `\`${stats.totalRequests}\` requests (all time)`, inline: true },
        { name: '🎉 Status', value: 'All commands are **free and unlimited** — no subscription needed!', inline: false }
      )],
    ephemeral: true,
  });
}

export { client };
