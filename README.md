# Executive OS — المنظومة التنفيذية الموحدة

A unified executive operating system designed to streamline decision-making and strategic planning for modern organizations. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Overview

Executive OS is an intelligent platform that integrates with AI-powered insights and real-time communication to help executives manage their operations efficiently. The system provides a dark-themed, professional interface for executive-level dashboard and analytics.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Anthropic API key
- Telegram bot credentials (optional, for notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd executive-os
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```

4. Add your environment variables:
```
APIKEY=your-anthropic-api-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
TELEGRAM_CHAT_ID=your-telegram-chat-id-here
```

### Running Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building

Create a production build:
```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

The easiest way to deploy Executive OS is using Vercel.

1. Push your code to GitHub:
```bash
git push origin main
```

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add environment variables in Vercel dashboard:
   - `APIKEY`: Your Anthropic API key
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `TELEGRAM_CHAT_ID`: Your Telegram chat ID

4. Click Deploy

For more details, see [Vercel documentation](https://vercel.com/docs/frameworks/nextjs).

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `APIKEY` | Your Anthropic API key for AI features |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for sending messages |

## Project Structure

```
executive-os/
├── app/                    # Next.js app directory
├── components/            # React components
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── next.config.js        # Next.js configuration
└── README.md             # This file
```

## Technologies

- **Framework**: Next.js 14.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic SDK
- **Font**: Cairo (Arabic-optimized)
- **Theme**: Dark mode by default with class-based switching

## Features

- Professional dark-themed UI optimized for executive dashboards
- AI-powered insights using Anthropic Claude
- Telegram integration for real-time notifications
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- Production-ready deployment configuration

## License

Private project.
