# Database Setup Guide

This guide will help you set up PostgreSQL for the Family Story Archive project.

## Option 1: Local PostgreSQL (Development)

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE family_story_archive;
CREATE USER family_story_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE family_story_archive TO family_story_user;

# Exit psql
\q
```

### Update .env File

```env
DATABASE_URL="postgresql://family_story_user:your_secure_password@localhost:5432/family_story_archive"
```

### Run Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration files
# 2. Apply migrations to your database
# 3. Generate Prisma Client
```

## Option 2: Neon (Production - Serverless PostgreSQL)

Neon is recommended for production per the implementation plan.

### Steps:

1. **Sign up for Neon**
   - Go to [neon.tech](https://neon.tech)
   - Create a free account

2. **Create a Project**
   - Click "New Project"
   - Name: "family-story-archive"
   - Region: Choose closest to your users

3. **Get Connection String**
   - Copy the connection string from the Neon dashboard
   - It looks like: `postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb`

4. **Update .env File**
   ```env
   DATABASE_URL="your-neon-connection-string"
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

## Verify Setup

### Check Database Connection

```bash
npx prisma db pull
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Test your schema

## Database Schema Overview

The schema includes these main tables:

- **users** - User accounts (NextAuth.js)
- **projects** - Story projects
- **interviewees** - People being interviewed
- **interview_questions** - AI-generated questions
- **interview_sessions** - Audio recordings
- **transcriptions** - Audio transcripts
- **narratives** - Generated stories
- **audiobooks** - Voice-cloned audiobooks (Post-MVP)
- **jobs** - Background job queue
- **payments** - Stripe payments
- **audit_logs** - Activity tracking

## Common Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database with sample data
npx prisma db seed
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `brew services list` (macOS)
- Check if port 5432 is available: `lsof -i :5432`

### Migration Errors
- Check your DATABASE_URL is correct
- Ensure database user has proper permissions
- Try resetting: `npx prisma migrate reset`

### SSL Required (Production)
If using Neon or production database, add `?sslmode=require` to DATABASE_URL:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## Next Steps

After database setup:
1. Configure NextAuth.js for authentication
2. Create API routes for CRUD operations
3. Set up file storage (AWS S3)
4. Configure job queue (Inngest)

See `confabulator/implementation-plan.md` for the complete roadmap.
