# Quick Start Guide

## 🚀 Starting Development

### Step 1: Start PostgreSQL
```bash
# PostgreSQL should auto-start, but if needed:
brew services start postgresql@15
```

### Step 2: Start Development Server
```bash
npm run dev
```
Opens at: http://localhost:3000

### Step 3: Start Inngest Dev Server (for job queue)
```bash
# In a separate terminal
npx inngest-cli@latest dev
```
Opens at: http://localhost:8288

### Optional: View Database
```bash
npx prisma studio
```
Opens at: http://localhost:5555

---

## 🧪 Testing the Workflow

### Demo Account Credentials
- **Email:** demo@mabel.com
- **Password:** demo123

### Complete Test Flow

1. **Sign In**
   - Go to http://localhost:3000/auth/signin
   - Login with demo account

2. **Select or Create Project**
   - View dashboard at http://localhost:3000/dashboard
   - Click on any project or create new one

3. **Add Interviewee Info**
   - Go to `/projects/[project-id]/setup`
   - Fill out the form with interviewee details
   - Select topics of interest
   - Click "Continue to Questions"

4. **Generate Questions**
   - On the questions page, click "Generate Interview Questions"
   - Watch real-time progress (takes ~10-15 seconds)
   - View AI-generated personalized questions

5. **Monitor Jobs** (Optional)
   - Open http://localhost:8288 (Inngest UI)
   - See job execution in real-time
   - View logs and step-by-step progress

---

## 🎯 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **App** | http://localhost:3000 | Main application |
| **Inngest** | http://localhost:8288 | Job queue UI |
| **Prisma Studio** | http://localhost:5555 | Database GUI |
| **API Docs** | http://localhost:3000/api/inngest | Inngest functions |

---

## 🛑 Stopping Development

To cleanly stop all services:

```bash
# Stop dev server (Ctrl+C in terminal)
# Stop Inngest (Ctrl+C in terminal)
# Stop Prisma Studio (Ctrl+C in terminal)

# PostgreSQL will keep running in background (that's fine)
# To stop PostgreSQL:
brew services stop postgresql@15
```

---

## 🔧 Useful Commands

### Database
```bash
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Re-seed demo data
npx prisma migrate dev   # Run new migrations
```

### Development
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run lint             # Check code quality
```

### Debugging
```bash
# View PostgreSQL status
brew services list | grep postgresql

# Check if ports are in use
lsof -i :3000            # Next.js
lsof -i :5555            # Prisma Studio
lsof -i :8288            # Inngest
```

---

## 📁 Important Files

### Configuration
- `.env` - Environment variables (database, API keys)
- `prisma/schema.prisma` - Database schema
- `src/lib/inngest/functions.ts` - Job definitions

### Mock Services
- `src/lib/services/mock/s3.ts` - Mock file storage
- `src/lib/services/mock/openai.ts` - Mock AI services
- `src/lib/services/config.ts` - Service configuration

### Pages
- `src/app/projects/[id]/setup/page.tsx` - Interviewee form
- `src/app/projects/[id]/questions/page.tsx` - Questions UI

---

## 🐛 Common Issues

### "Port already in use"
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Cannot connect to database"
```bash
# Restart PostgreSQL
brew services restart postgresql@15

# Check connection
psql mabel -c "SELECT 1;"
```

### "Inngest functions not found"
```bash
# Restart both dev server and Inngest
# Make sure both are running simultaneously
```

---

## 📝 Current State

**Database:**
- ✅ PostgreSQL running with 15 tables
- ✅ Demo user: demo@mabel.com
- ✅ 5 sample projects seeded

**Mock Services:**
- ✅ Mock S3 (no AWS needed)
- ✅ Mock OpenAI (no API key needed)
- ✅ Inngest configured (works locally)

**Features Ready:**
- ✅ Authentication system
- ✅ Project management
- ✅ Interviewee information form
- ✅ AI question generation workflow

**Next to Build:**
- ⏳ Audio upload interface
- ⏳ Transcription workflow
- ⏳ Narrative generation UI

---

## 💡 Tips

1. **Always start Inngest** when testing job-based features (question generation, transcription, narrative)
2. **Check Inngest UI** (http://localhost:8288) to debug job issues
3. **Use Prisma Studio** to inspect database state
4. **Demo data can be reset** with `npm run db:seed`

---

**Last Updated:** 2026-01-16
**Phase:** Phase 2 - AI Features & Processing (70% complete)
