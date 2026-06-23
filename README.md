# ZeroBug 🤖

> **AI-powered Discord bot for developers — Fix bugs faster and write better code.**

ZeroBug is a modern, fast AI coding assistant that lives in your Discord server. It helps developers debug code, improve code quality, explain complex logic, optimize performance, and generate new code from natural language prompts.

## Features

| Command | Description |
|---------|-------------|
| `/fix` | Debug your code — identify bugs and get corrected code with explanations |
| `/review` | Get an AI code review with a score out of 10, strengths, weaknesses, and suggestions |
| `/optimize` | Optimize your code for better performance and readability with before/after comparison |
| `/explain` | Get a beginner-friendly line-by-line explanation of any code |
| `/generate` | Generate production-ready code from a description |
| `/ask` | Ask any coding question — ZeroBug is your AI mentor |
| `/usage` | Check your usage statistics |
| `/ping` | Check bot latency |
| `/help` | Show all available commands |

All commands are **completely free** with no limits.

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** discord.js v14
- **AI:** Groq (LLaMA 3.1 70B)
- **Database:** Supabase (PostgreSQL)
- **Cache:** Redis (via ioredis)
- **Logging:** Winston
- **Validation:** Zod

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (free tier works)
- Redis 7+
- Groq API key
- Discord Bot token

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/zerobug.git
cd zerobug

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migration
npm run db:migrate

# Register slash commands
npm run deploy:commands

# Start the bot
npm run dev
```

### Docker

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker-compose up -d

# Register slash commands
docker-compose exec zerobug npm run deploy:commands
```

## Environment Variables

See `.env.example` for all required configuration.

## Project Structure

```
src/
├── index.ts                  # Entry point
├── config/
│   ├── index.ts              # Config loader (Zod validated)
│   └── prompts.ts            # AI system prompts
├── bot/
│   ├── client.ts             # Discord client setup
│   └── deploy-commands.ts    # Slash command registration
├── commands/
│   ├── index.ts              # Command executor
│   ├── fix.ts                # /fix command
│   ├── review.ts             # /review command
│   ├── optimize.ts           # /optimize command
│   ├── explain.ts            # /explain command
│   ├── generate.ts           # /generate command
│   └── ask.ts                # /ask command
├── services/
│   └── ai.ts                 # Groq integration
├── database/
│   ├── schema.sql            # PostgreSQL schema
│   ├── connection.ts         # Database connection pool
│   └── models.ts             # Data access layer
├── utils/
│   ├── dm.ts                 # DM sending utility
│   ├── embed.ts              # Discord embed builders
│   ├── formatter.ts          # Code formatting utilities
│   └── logger.ts             # Winston logger
└── types/
    └── index.ts              # TypeScript type definitions
```

## API

A health check endpoint is available at `/health` on the configured port.

## License

MIT
