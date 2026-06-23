import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const commands = [
  new SlashCommandBuilder()
    .setName('fix')
    .setDescription('Debug your code — identify bugs and get fixed code')
    .addStringOption(o => o.setName('code').setDescription('Paste your code snippet').setRequired(true))
    .addStringOption(o => o.setName('error').setDescription('Paste the error message (if any)'))
    .addStringOption(o => o.setName('expected').setDescription('What did you expect to happen?')),

  new SlashCommandBuilder()
    .setName('review')
    .setDescription('Get an AI code review with score, strengths, and improvements')
    .addStringOption(o => o.setName('code').setDescription('Paste your code for review').setRequired(true))
    .addStringOption(o => o.setName('language').setDescription('Programming language (optional)')),

  new SlashCommandBuilder()
    .setName('optimize')
    .setDescription('Optimize your code for better performance and readability')
    .addStringOption(o => o.setName('code').setDescription('Paste your code to optimize').setRequired(true)),

  new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Get a beginner-friendly explanation of any code')
    .addStringOption(o => o.setName('code').setDescription('Paste the code you want explained').setRequired(true)),

  new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generate production-ready code from a description')
    .addStringOption(o => o.setName('prompt').setDescription('Describe what you want to build').setRequired(true))
    .addStringOption(o => o.setName('language').setDescription('Language or framework (e.g., React, Python)'))
    .addStringOption(o => o.setName('details').setDescription('Additional requirements or specifications')),

  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask any coding question — ZeroBug is your AI mentor')
    .addStringOption(o => o.setName('question').setDescription('Your coding question').setRequired(true)),

  new SlashCommandBuilder()
    .setName('usage')
    .setDescription('Check your current usage and plan details'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and status'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn how to use ZeroBug commands'),
] as SlashCommandBuilder[];

async function deployCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  try {
    logger.info('Registering slash commands...');

    const commandData = commands.map(cmd => cmd.toJSON());

    if (config.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body: commandData }
      );
      logger.info(`Registered ${commandData.length} commands in guild ${config.DISCORD_GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(config.DISCORD_CLIENT_ID),
        { body: commandData }
      );
      logger.info(`Registered ${commandData.length} global commands`);
    }
  } catch (error: any) {
    logger.error('Failed to register commands', { error: error.message });
    process.exit(1);
  }
}

deployCommands();
