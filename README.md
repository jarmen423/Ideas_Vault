# 🚀 The Ideas Vault

**Live Demo:** [https://ideas-vault-eight.vercel.app](https://ideas-vault-eight.vercel.app)

## 💡 The Elevator Pitch
"Ideas Vault" is a personal, secure digital notebook that doesn't just store your startup ideas—it **validates** them. It acts like having a 24/7 Venture Capitalist analyst in your pocket who instantly researches the market potential of your random shower thoughts.

## ✨ Key Features

- **Capture & Validate**: Type out your idea, and the AI Agent (acting as a Senior VC Analyst) researches the concept in real-time.
- **Collaborative Discovery**: A multi-stage AI-guided conversation to refine ideas, assess founder-fit, and generate optimized research prompts.
- **Detailed Research Reports**:
    - **Readiness Score**: 0-100 viability rating.
    - **Market Size**: Estimated TAM (Total Addressable Market).
    - **Competitors**: Analysis of existing players.
    - **Action Plan**: The first 3 steps you should take to build it.
- **"Bring Your Own Key" AI**: You aren't locked into one AI provider. You can plug in your own OpenRouter/OpenAI/Grok keys to power the brain.
- **Secure Storage**: Uses Postgres (Supabase) so you own your data.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **AI Integration**: [OpenAI SDK](https://github.com/openai/openai-node) (compatible with OpenRouter)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- An API Key for an AI provider (OpenAI, OpenRouter, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ideas-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and AI API key.

4. **Database Setup**
   Run the SQL commands from `schema.sql` in your Supabase SQL Editor to set up tables and security policies.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
