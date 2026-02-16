#!/bin/bash
#
# Git Worktree Setup Script
# Project: Mabel
# Repository: https://github.com/chris-squeff/my-family-story-archive
# Generated: 2025-12-22T19:40:43.790Z
#
# This script creates separate git worktrees for each task and epic,
# enabling parallel development without branch conflicts.
#

set -e  # Exit on error

echo "🌳 Setting up git worktrees for parallel development..."
echo ""

# ================================================
# EPICS
# ================================================

# Epic #1: User Management
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #1..."
git worktree add ../epic-1-worktree -b epic/1-user-management 2>/dev/null || echo "  Worktree already exists"

# Epic #4: AI-Guided Interviews
# ⚠️  Dependencies: #8
echo "Creating worktree for Epic #4..."
git worktree add ../epic-4-worktree -b epic/4-ai-guided-interviews 2>/dev/null || echo "  Worktree already exists"

# Epic #7: Transcription and Narrative Generation
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #7..."
git worktree add ../epic-7-worktree -b epic/7-transcription-and-narrative-generation 2>/dev/null || echo "  Worktree already exists"

# Epic #10: Audiobook Creation
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #10..."
git worktree add ../epic-10-worktree -b epic/10-audiobook-creation 2>/dev/null || echo "  Worktree already exists"

# Epic #13: Technical Foundation
# ⚠️  Dependencies: #5
echo "Creating worktree for Epic #13..."
git worktree add ../epic-13-worktree -b epic/13-technical-foundation 2>/dev/null || echo "  Worktree already exists"

# ================================================
# TASKS
# ================================================

# Task #2: Implement User Registration
# ⚠️  Dependencies: #5, #13
echo "Creating worktree for Task #2..."
git worktree add ../task-2-worktree -b task/2-implement-user-registration 2>/dev/null || echo "  Worktree already exists"

# Task #3: Implement User Login
# ⚠️  Dependencies: #2
echo "Creating worktree for Task #3..."
git worktree add ../task-3-worktree -b task/3-implement-user-login 2>/dev/null || echo "  Worktree already exists"

# Task #5: Develop Question Generation Algorithm
echo "Creating worktree for Task #5..."
git worktree add ../task-5-worktree -b task/5-develop-question-generation-algorithm 2>/dev/null || echo "  Worktree already exists"

# Task #6: Implement Real-Time Question Adaptation
echo "Creating worktree for Task #6..."
git worktree add ../task-6-worktree -b task/6-implement-real-time-question-adaptation 2>/dev/null || echo "  Worktree already exists"

# Task #8: Integrate Whisper API for Transcription
# ⚠️  Dependencies: #13, #5, #13
echo "Creating worktree for Task #8..."
git worktree add ../task-8-worktree -b task/8-integrate-whisper-api-for-transcription 2>/dev/null || echo "  Worktree already exists"

# Task #9: Develop Narrative Generation Module
# ⚠️  Dependencies: #8
echo "Creating worktree for Task #9..."
git worktree add ../task-9-worktree -b task/9-develop-narrative-generation-module 2>/dev/null || echo "  Worktree already exists"

# Task #11: Integrate ElevenLabs for Voice Cloning
echo "Creating worktree for Task #11..."
git worktree add ../task-11-worktree -b task/11-integrate-elevenlabs-for-voice-cloning 2>/dev/null || echo "  Worktree already exists"

# Task #12: Develop Audiobook Sharing Feature
# ⚠️  Dependencies: #5, #13
echo "Creating worktree for Task #12..."
git worktree add ../task-12-worktree -b task/12-develop-audiobook-sharing-feature 2>/dev/null || echo "  Worktree already exists"

echo ""
echo "✅ Worktree setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. View all worktrees: git worktree list"
echo "2. Check dependencies: ./confabulator/worktree-status.sh"
echo "3. Start working: cd <worktree-directory>"
echo ""
echo "🔀 Recommended merge order (dependencies first):"
echo "  1. #1 - User Management"
echo "  2. #3 - Implement User Login"
echo "  3. #4 - AI-Guided Interviews"
echo "  4. #6 - Implement Real-Time Question Adaptation"
echo "  5. #7 - Transcription and Narrative Generation"
echo "  6. #9 - Develop Narrative Generation Module"
echo "  7. #10 - Audiobook Creation"
echo "  8. #11 - Integrate ElevenLabs for Voice Cloning"
echo "  9. #12 - Develop Audiobook Sharing Feature"
echo ""
echo "To cleanup all worktrees: ./confabulator/cleanup-worktrees.sh"
