# Mabel

AI-powered platform for preserving family stories through guided interviews and narrative generation. Build your family's story one chapter at a time with AI that learns from each module.

## 🌟 Overview

Mabel uses a breakthrough **module-based approach** to help you capture family stories without overwhelm. Instead of facing one massive interview, you complete bite-sized modules that become chapters in a beautiful book. Our context-learning AI analyzes previous answers to ask increasingly relevant follow-up questions, creating richer, more connected narratives.

**Key Innovation:**
- 📚 **Module-by-module story building** - Complete chapters at your own pace
- 🤖 **Context-learning AI** - Questions get smarter with each module
- ✍️ **Text-first approach** - No recording equipment needed
- 📖 **Professional narratives** - AI transforms Q&A into polished chapters

## 🚀 Features

- ✅ **AI-Guided Question Generation** - Personalized questions based on interviewee profile
- ✅ **One-at-a-time Question Interface** - Focus without overwhelm
- ✅ **Auto-save Responses** - Never lose your progress
- ✅ **Chapter Generation** - AI converts Q&A into narrative chapters
- ✅ **Chapter Regeneration** - Refine with specific feedback
- ✅ **Module Progress Tracking** - See completion status at a glance
- ✅ **Secure Authentication** - Protected user accounts
- ⏳ **PDF Export** - Download chapters and complete books (coming soon)
- ⏳ **Audio Transcription** - Whisper API integration (Phase 2)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth.js

**Infrastructure:**
- Vercel (Hosting)
- Inngest (Background Jobs)
- AWS S3 (File Storage)
- OpenAI GPT-4 (AI Features)

**Payments & Services:**
- Stripe (Payments)
- Resend (Email)
- Sentry (Error Tracking)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL (local) or Neon account
- OpenAI API key
- AWS S3 bucket
- Inngest account

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chris-squeff/my-family-story-archive.git
   cd my-family-story-archive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `OPENAI_API_KEY` - From OpenAI platform
   - `AWS_*` - S3 bucket credentials
   - `INNGEST_*` - From Inngest dashboard

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📖 Documentation

Detailed documentation is available in the `/confabulator` directory:

| Document | Description |
|----------|-------------|
| [PRD.md](./confabulator/PRD.md) | Product requirements and feature specifications |
| [implementation-plan.md](./confabulator/implementation-plan.md) | Technical architecture and development roadmap |
| [project-vision.md](./confabulator/project-vision.md) | Vision statement and long-term goals |
| [wireframes.md](./confabulator/wireframes.md) | UI/UX designs and user flows |
| [PR-FAQ.md](./confabulator/PR-FAQ.md) | Press release and frequently asked questions |

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Prisma commands
npx prisma studio          # Database GUI
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create migrations
npx prisma db push         # Push schema (development)
```

## 🗂️ Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   └── projects/          # Project workflow pages
│   ├── components/            # React components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Database client
│   │   ├── inngest/          # Background job definitions
│   │   └── services/         # Business logic services
│   └── types/                # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── confabulator/              # Project documentation
└── public/                    # Static assets
```

## 🏗️ Architecture

### Module-Based Workflow

```
User creates project
  ↓
Module 1: Foundation questions → Generate Chapter 1
  ↓
Module 2: AI analyzes Module 1 responses → Smarter questions → Chapter 2
  ↓
Module 3: AI references Modules 1 & 2 → Even better questions → Chapter 3
  ↓
Continue building...
  ↓
Compile all chapters into complete book
```

### Background Jobs (Inngest)

- `generateModuleQuestionsJob` - Creates AI-powered questions
- `generateModuleChapterJob` - Converts Q&A to narrative
- `transcribeAudioJob` - Transcribes audio files (Phase 2)
- `generateNarrativeJob` - Legacy workflow support

## 🔐 Environment Variables

See `.env.example` for a complete list. Required variables:

- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- `OPENAI_API_KEY` - AI features
- `AWS_*` - File storage
- `INNGEST_*` - Background jobs

## 🚢 Deployment

This project is optimized for Vercel:

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

Database migrations run automatically via Prisma.

## 📊 Current Status

**MVP Phase: ~60% Complete**

✅ Completed:
- User authentication (NextAuth.js)
- Module-based architecture
- Question generation (mock AI)
- One-at-a-time question flow
- Chapter generation (mock AI)
- Chapter review and approval
- Database schema and migrations
- Background job infrastructure

🚧 In Progress:
- Real OpenAI API integration
- PDF export functionality
- Email notifications

⏳ Planned:
- Audio transcription (Whisper API)
- Standard text-to-speech audiobooks
- Voice cloning (ElevenLabs)
- Payment integration (Stripe)

## 🤝 Contributing

This is a private repository. For access or collaboration inquiries, please contact the repository owner.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with [Confabulator](https://vibecodelisboa.com/confabulator) - AI-powered project planning and documentation tool.

---

**Mabel** — Your Stories, Written with Care.
