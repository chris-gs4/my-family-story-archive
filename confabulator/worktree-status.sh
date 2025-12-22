#!/bin/bash
#
# Git Worktree Status Script
# Project: Family Story Archive
# Generated: 2025-12-22T19:40:43.790Z
#
# Shows the status of all worktrees and their dependencies.
#

echo "📊 Worktree Status - Family Story Archive"
echo "="
echo ""

echo "📂 Active Worktrees:"
git worktree list
echo ""

echo "🔗 Dependency Summary:"
echo ""
echo "Epics:"
echo "  ✅ #1 - User Management (no dependencies)"
echo "  ⚠️  #4 - AI-Guided Interviews (depends on: #8)"
echo "  ✅ #7 - Transcription and Narrative Generation (no dependencies)"
echo "  ✅ #10 - Audiobook Creation (no dependencies)"
echo "  ⚠️  #13 - Technical Foundation (depends on: #5)"
echo ""
echo "Tasks:"
echo "  ⚠️  #2 - Implement User Registration (depends on: #5, #13)"
echo "  ⚠️  #3 - Implement User Login (depends on: #2)"
echo "  ✅ #5 - Develop Question Generation Algorithm (no dependencies)"
echo "  ✅ #6 - Implement Real-Time Question Adaptation (no dependencies)"
echo "  ⚠️  #8 - Integrate Whisper API for Transcription (depends on: #13, #5, #13)"
echo "  ⚠️  #9 - Develop Narrative Generation Module (depends on: #8)"
echo "  ✅ #11 - Integrate ElevenLabs for Voice Cloning (no dependencies)"
echo "  ⚠️  #12 - Develop Audiobook Sharing Feature (depends on: #5, #13)"
echo ""
echo "🔀 Recommended Merge Order:"
echo "  1. 📦 #1 - User Management"
echo "  2. 📝 #3 - Implement User Login"
echo "  3. 📦 #4 - AI-Guided Interviews"
echo "  4. 📝 #6 - Implement Real-Time Question Adaptation"
echo "  5. 📦 #7 - Transcription and Narrative Generation"
echo "  6. 📝 #9 - Develop Narrative Generation Module"
echo "  7. 📦 #10 - Audiobook Creation"
echo "  8. 📝 #11 - Integrate ElevenLabs for Voice Cloning"
echo "  9. 📝 #12 - Develop Audiobook Sharing Feature"
echo ""
echo "💡 Tips:"
echo "  - Work on tasks with no dependencies first"
echo "  - Merge branches in the order shown above"
echo "  - Check GitHub issues for detailed requirements"
echo ""