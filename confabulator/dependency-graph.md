# Dependency Graph

```mermaid
graph TD

  1[[#1: User Management]]
  2[#2: Implement User Registration]
  3[#3: Implement User Login]
  4[[#4: AI-Guided Interviews]]
  5[#5: Develop Question Generation Algorithm]
  6[#6: Implement Real-Time Question Adaptation]
  7[[#7: Transcription and Narrative Generation]]
  8[#8: Integrate Whisper API for Transcription]
  9[#9: Develop Narrative Generation Module]
  10[[#10: Audiobook Creation]]
  11[#11: Integrate ElevenLabs for Voice Cloning]
  12[#12: Develop Audiobook Sharing Feature]
  13[[#13: Technical Foundation]]

  2 -->|Sequential task within epic| 3
  13 -->|Database before API| 8
  8 -->|API before UI| 4
  8 -->|API before UI| 9
  5 -->|Setup before features| 2
  5 -->|Setup before features| 8
  5 -->|Setup before features| 12
  5 -->|Setup before features| 13
  13 -->|Setup before features| 2
  13 -->|Setup before features| 8
  13 -->|Setup before features| 12

  classDef epicStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
  classDef taskStyle fill:#fff3e0,stroke:#e65100,stroke-width:1px
  class 1,4,7,10,13 epicStyle
  class 2,3,5,6,8,9,11,12 taskStyle
```

## Legend
- **Double box**: Epic
- **Single box**: Task
- **Arrow direction**: Dependency flow (A → B means B depends on A)

## About This Diagram

This diagram shows the dependencies between epics and tasks in your project. Use it to understand the order in which work should be completed and merged.

- **Epics** (double boxes) represent major features or components
- **Tasks** (single boxes) are specific implementation work items
- **Arrows** show dependencies (A → B means B depends on A completing first)

For parallel development using git worktrees, run:
```bash
./confabulator/setup-worktrees.sh
```
