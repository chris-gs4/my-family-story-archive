import SwiftUI

struct RecordingSetupView: View {
    @Environment(AppState.self) private var appState
    let chapterIndex: Int
    @State private var showWriteBox = false
    @State private var typedEntry = ""
    @State private var suggestionPrompts: [String] = []
    @State private var isLoadingPrompts = false
    @State private var showProfile = false
    @State private var showChapterReview = false
    @State private var memoryToDelete: Memory? = nil
    @State private var showDeleteConfirmation = false
    @State private var micPulse = false
    @State private var showCaptureToast = false
    @State private var lastSeenMemoryCount: Int? = nil
    @State private var captureToastDismissTask: Task<Void, Never>? = nil
    @State private var toastDotPulse = false

    private var chapter: Chapter {
        guard chapterIndex >= 0, chapterIndex < appState.chapters.count else {
            return Chapter.allChapters[0]
        }
        return appState.chapters[chapterIndex]
    }

    private var displayableMemories: [Memory] {
        chapter.memories.filter { $0.state != .notStarted }
    }

    private var hasProcessingMemory: Bool {
        chapter.memories.contains(where: { $0.state == .processing })
    }

    var body: some View {
        ZStack {
            Color.mabelBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // MARK: - Top Bar
                topBar

                // MARK: - Scrollable Content
                //
                // Phase 1.8 layout: chapter badge + progress on top, then the recording UI
                // (hero mic + prompts + write) is ALWAYS visible, never replaced — even on a
                // 5/5 approved chapter, so the user can record a bonus memory. The memory
                // list sits below the mic, and chapter status (processing / failure / ready /
                // approved CTAs) appends at the bottom once the chapter has reached 5+.
                //
                // Phase 1.1 capture toast is attached as a top safe-area inset on this
                // ScrollView (see `.safeAreaInset(edge: .top)` below). `safeAreaInset` is
                // the iOS-15+ canonical pattern for "transient banner above scroll content":
                // it reserves vertical space for the toast inside the ScrollView's safe area
                // so the chapter badge moves down by exactly the inset height when the toast
                // is visible. Previously the toast was either an overlay (covering content)
                // or a VStack sibling (SwiftUI failed to reserve the sibling space cleanly
                // before the slide-from-top transition completed) — both produced overlap.
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        chapterBadge
                            .padding(.top, MabelSpacing.sectionGap)

                        ProgressBar(
                            progress: Double(chapter.completedMemoryCount) / Double(chapter.displayTargetCount),
                            height: 6
                        )
                        .padding(.bottom, MabelSpacing.xxxl)
                        .accessibilityLabel("Chapter progress: \(chapter.completedMemoryCount) of \(chapter.displayTargetCount)")

                        recordingUI

                        if !displayableMemories.isEmpty {
                            memoryList
                                .padding(.top, MabelSpacing.sectionGap)
                        }

                        // Phase 1.2: surface the processing banner at the top of the
                        // memory list whenever any memory is in flight, not only when
                        // 5/5 is reached. The chapterStatusSection's copy of this
                        // banner was removed to prevent double-rendering.
                        if hasProcessingMemory {
                            processingBanner
                                .padding(.top, MabelSpacing.elementGap)
                        }

                        if chapter.completedMemoryCount >= Chapter.memoriesPerChapter {
                            chapterStatusSection
                        }

                        Spacer().frame(height: MabelSpacing.bottomSafe)
                    }
                    .screenPadding()
                }
                .safeAreaInset(edge: .top, spacing: 0) {
                    if showCaptureToast {
                        capturedToast
                            .padding(.horizontal, MabelSpacing.screenPadH)
                            .padding(.vertical, MabelSpacing.tightGap)
                            .frame(maxWidth: .infinity)
                            .background(Color.mabelBackground)
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: RecordingDestination.self) { dest in
            RecordingView(chapterIndex: dest.chapterIndex, prompt: dest.prompt)
        }
        .sheet(isPresented: $showProfile) {
            ProfileView()
        }
        .sheet(isPresented: $showChapterReview) {
            ChapterReviewView(chapterIndex: chapterIndex)
        }
        .alert(
            "Delete memory?",
            isPresented: $showDeleteConfirmation,
            presenting: memoryToDelete
        ) { memory in
            Button("Delete", role: .destructive) {
                appState.deleteMemory(chapterIndex: chapterIndex, memoryID: memory.id)
                memoryToDelete = nil
            }
            Button("Cancel", role: .cancel) {
                memoryToDelete = nil
            }
        } message: { _ in
            if chapter.completedMemoryCount >= Chapter.memoriesPerChapter && chapter.generatedNarrative != nil {
                Text("This will remove the memory and invalidate your chapter narrative. You'll need to record a replacement and regenerate.")
            } else {
                Text("This will permanently remove this memory.")
            }
        }
        .task {
            if suggestionPrompts.isEmpty {
                await loadPrompts()
            }
        }
        .onAppear {
            if lastSeenMemoryCount == nil {
                lastSeenMemoryCount = chapter.memories.count
            }
        }
        .onChange(of: appState.chapters[chapterIndex].generatedNarrative) { oldValue, newValue in
            if oldValue == nil, newValue != nil, !appState.chapters[chapterIndex].isApproved {
                showChapterReview = true
            }
        }
        .onChange(of: chapter.memories.count) { _, newValue in
            guard let last = lastSeenMemoryCount else {
                lastSeenMemoryCount = newValue
                return
            }
            if newValue > last {
                triggerCaptureToast()
            }
            lastSeenMemoryCount = newValue
        }
    }

    // MARK: - Captured Toast (Phase 1.1 / polished in 1.1.5)
    //
    // Dark capsule, white text, animated gold dot. The pulsing dot encodes
    // "still processing" without words; the dark fill maximises figure-ground
    // contrast against the white screen so the toast registers pre-attentively.
    //
    // Shown for ~4s after a new memory is added. 4s (rather than 2.5s) accounts
    // for the navigation pop animation — when the user records via
    // RecordingView, the toast triggers while RecordingSetupView is still
    // pushed-down in the stack, so it needs to outlast the dismiss transition
    // and still be visible when the user lands back here.
    private var capturedToast: some View {
        HStack(spacing: MabelSpacing.md) {
            toastPulsingDot

            Text("Memory captured")
                .font(MabelTypography.badge())
                .foregroundColor(.white)
            + Text("  ·  ")
                .font(MabelTypography.helper())
                .foregroundColor(.white.opacity(0.5))
            + Text("Writing it up…")
                .font(MabelTypography.helper())
                .foregroundColor(.white.opacity(0.85))

            Spacer(minLength: 0)
        }
        .padding(.horizontal, MabelSpacing.lg)
        .padding(.vertical, MabelSpacing.md)
        .background(
            Capsule()
                .fill(Color.mabelText)
        )
        .mabelCardShadow()
        .accessibilityLabel("Memory captured. Mabel is writing it up.")
    }

    private var toastPulsingDot: some View {
        ZStack {
            Circle()
                .fill(Color.mabelAccent.opacity(0.35))
                .frame(width: 16, height: 16)
                .scaleEffect(toastDotPulse ? 1.0 : 0.6)
                .opacity(toastDotPulse ? 0.0 : 0.9)
            Circle()
                .fill(Color.mabelAccent)
                .frame(width: 8, height: 8)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: false)) {
                toastDotPulse = true
            }
        }
        .onDisappear {
            toastDotPulse = false
        }
    }

    private func triggerCaptureToast() {
        captureToastDismissTask?.cancel()
        withAnimation(.easeOut(duration: 0.3)) {
            showCaptureToast = true
        }
        captureToastDismissTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 4_000_000_000)
            guard !Task.isCancelled else { return }
            withAnimation(.easeOut(duration: 0.3)) {
                showCaptureToast = false
            }
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Button(action: {
                if !appState.navigationPath.isEmpty {
                    appState.navigationPath.removeLast()
                }
            }) {
                HStack(spacing: MabelSpacing.tightGap) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.mabelPrimary)
                    MabelWordmarkLockup()
                }
                .frame(height: 44)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Go back")
            Spacer()
            ProfileButton { showProfile = true }
        }
        .padding(.horizontal, MabelSpacing.screenPadH)
        .padding(.top, MabelSpacing.tightGap)
        .padding(.bottom, MabelSpacing.tightGap)
    }

    // MARK: - Chapter Badge

    private var chapterBadge: some View {
        VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
            HStack(spacing: MabelSpacing.tightGap) {
                Text("CH. \(chapter.id)")
                    .font(MabelTypography.badge())
                    .foregroundColor(.mabelPrimary)
                    .padding(.horizontal, MabelSpacing.md)
                    .padding(.vertical, MabelSpacing.xs)
                    .background(Capsule().fill(Color.mabelPrimaryLight))

                Text(chapter.title)
                    .font(MabelTypography.subheading())
                    .foregroundColor(.mabelText)

                Spacer()

                if chapter.isApproved {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.mabelPrimary)
                }

                Text("\(chapter.completedMemoryCount)/\(chapter.displayTargetCount)")
                    .font(MabelTypography.badge())
                    .foregroundColor(.mabelPrimary)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Chapter \(chapter.id), \(chapter.title). \(chapter.completedMemoryCount) of \(chapter.displayTargetCount) memories recorded\(chapter.isApproved ? ". Chapter approved." : "")")
        }
        .padding(.bottom, MabelSpacing.tightGap)
    }

    // MARK: - Memory List

    private var memoryList: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("YOUR MEMORIES")
                .sectionLabelStyle()
                .padding(.bottom, MabelSpacing.pillPadV)

            VStack(spacing: MabelSpacing.tightGap) {
                ForEach(Array(displayableMemories.enumerated()), id: \.element.id) { index, memory in
                    MemoryCard(
                        memory: memory,
                        index: index,
                        onDelete: {
                            memoryToDelete = memory
                            showDeleteConfirmation = true
                        },
                        onRetry: {
                            appState.retryMemory(chapterIndex: chapterIndex, memoryID: memory.id)
                        }
                    )
                }
            }
            .padding(.bottom, MabelSpacing.sectionGap)
        }
    }

    // MARK: - Processing Banner (Phase 1.2)
    //
    // Visible whenever any memory is in `.processing`. Sits above the chapter
    // status section so the user always has a top-of-list signal that work is
    // in flight — not just when 5/5 is reached. Per-card spinners in
    // `MemoryCard` handle the row-level signal; this banner handles the
    // chapter-level one.

    private var processingBanner: some View {
        HStack(spacing: MabelSpacing.pillPadV) {
            ProgressView()
                .tint(.mabelPrimary)
            Text("Processing your memories...")
                .font(MabelTypography.helper())
                .foregroundColor(.mabelSubtle)
        }
        .padding(MabelSpacing.inputPadV)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusBadge)
                .fill(Color.mabelSurface.opacity(0.9))
        )
        .accessibilityLabel("Mabel is processing your memories.")
    }

    // MARK: - Chapter Status Section
    //
    // Phase 1.8: this is no longer a full-screen replacement for the recording UI.
    // It's an appendage that sits below the memory list when the chapter has reached
    // 5+ memories, showing processing/failure banners + ready-to-review/approved CTAs.

    private var chapterStatusSection: some View {
        VStack(spacing: MabelSpacing.cardPaddingContent) {
            // Phase 1.2: the processing banner now lives above the memory list
            // (rendered from `body` whenever `hasProcessingMemory` is true), so
            // it's not duplicated here.

            if let failedMemory = chapter.memories.first(where: { $0.state == .failed }) {
                HStack(spacing: MabelSpacing.pillPadV) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.mabelBurgundy)
                    VStack(alignment: .leading, spacing: MabelSpacing.xs) {
                        Text("Processing failed")
                            .font(MabelTypography.helper())
                            .fontWeight(.bold)
                            .foregroundColor(.mabelText)
                        Text(failedMemory.errorMessage ?? "An error occurred.")
                            .font(MabelTypography.smallLabel())
                            .foregroundColor(.mabelSubtle)
                    }
                }
                .padding(MabelSpacing.inputPadV)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusBadge)
                        .fill(Color.mabelBurgundy.opacity(0.08))
                )
            }

            if chapter.isApproved {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.mabelPrimary)
                    .padding(.top, MabelSpacing.cardPaddingContent)
                Text("Chapter approved!")
                    .headingStyle()
                Text("This chapter is finalized and ready for your book.")
                    .helperStyle()
                    .multilineTextAlignment(.center)
                CTAButton(title: "VIEW IN MY STORIES") {
                    appState.navigationPath = NavigationPath()
                    appState.selectedTab = 1
                }
            } else if chapter.generatedNarrative != nil {
                Image(systemName: "doc.text.magnifyingglass")
                    .font(.system(size: 48))
                    .foregroundColor(.mabelPrimary)
                    .padding(.top, MabelSpacing.cardPaddingContent)
                Text("Your chapter is ready!")
                    .headingStyle()
                Text("Review your generated narrative. You can approve it or request changes.")
                    .helperStyle()
                    .multilineTextAlignment(.center)
                CTAButton(title: "REVIEW CHAPTER") {
                    showChapterReview = true
                }
            } else {
                Image(systemName: "text.badge.star")
                    .font(.system(size: 48))
                    .foregroundColor(.mabelPrimary)
                    .padding(.top, MabelSpacing.cardPaddingContent)
                Text("All memories recorded!")
                    .headingStyle()
                Text("Your stories are being woven into a chapter narrative. This may take a moment.")
                    .helperStyle()
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.top, MabelSpacing.elementGap)
    }

    // MARK: - Recording UI (Focused Flow)

    private var recordingUI: some View {
        VStack(spacing: 0) {
            // Hero heading — tight line spacing
            Text("What story would\nyou like to tell?")
                .font(MabelTypography.heading())
                .foregroundColor(.mabelText)
                .lineSpacing(-2)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .padding(.bottom, MabelSpacing.tightGap)

            Text("Tap the mic and start speaking.")
                .helperStyle()
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .padding(.bottom, MabelSpacing.sectionGap)

            // Hero mic button — larger 100pt
            NavigationLink(value: RecordingDestination(chapterIndex: chapterIndex, prompt: nil)) {
                ZStack {
                    Circle()
                        .fill(Color.mabelPrimary.opacity(0.08))
                        .frame(width: 140, height: 140)
                        .scaleEffect(micPulse ? MabelAnimation.micPulseScale : 1.0)
                        .opacity(micPulse ? MabelAnimation.micPulseOpacity : 1.0)
                    Circle()
                        .fill(Color.mabelPrimary)
                        .frame(width: 100, height: 100)
                        .shadow(color: .mabelPrimary.opacity(0.3), radius: 14, x: 0, y: 6)
                    Image(systemName: "mic.fill")
                        .font(.system(size: 36))
                        .foregroundColor(.white)
                }
                .accessibilityLabel("Record a memory")
                .accessibilityHint("Double tap to start recording")
                .onAppear {
                    withAnimation(MabelAnimation.micPulse) {
                        micPulse = true
                    }
                }
            }
            .buttonStyle(.plain)
            .padding(.bottom, MabelSpacing.xxxl)

            // Divider — "or pick a prompt"
            HStack(spacing: MabelSpacing.md) {
                Rectangle().fill(Color.mabelBorderWarm).frame(height: 1)
                Text("or pick a prompt")
                    .font(MabelTypography.smallLabel())
                    .foregroundColor(.mabelSubtle)
                    .layoutPriority(1)
                Rectangle().fill(Color.mabelBorderWarm).frame(height: 1)
            }
            .padding(.bottom, MabelSpacing.elementGap)

            // Suggestion cards — high contrast with shadows
            Group {
                if isLoadingPrompts {
                    HStack(spacing: MabelSpacing.pillPadV) {
                        ProgressView()
                            .tint(.mabelPrimary)
                        Text("Generating prompts...")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, MabelSpacing.cardPaddingContent)
                } else {
                    VStack(spacing: MabelSpacing.md) {
                        ForEach(suggestionPrompts, id: \.self) { prompt in
                            NavigationLink(value: RecordingDestination(chapterIndex: chapterIndex, prompt: prompt)) {
                                SuggestionCardLabel(prompt: prompt)
                                    .mabelCardShadow()
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(.bottom, MabelSpacing.sectionGap)

            // Write here — card style with icon circle
            Button(action: { showWriteBox.toggle() }) {
                HStack(spacing: MabelSpacing.md) {
                    Image(systemName: "pencil.line")
                        .font(.system(size: 14))
                        .foregroundColor(.mabelPrimary)
                        .frame(width: 36, height: 36)
                        .background(Circle().fill(Color.mabelPrimaryLight))

                    VStack(alignment: .leading, spacing: MabelSpacing.xs) {
                        Text("Write instead")
                            .font(MabelTypography.body())
                            .foregroundColor(.mabelText)
                        Text("Type your memory if you prefer writing")
                            .font(MabelTypography.smallLabel())
                            .foregroundColor(.mabelSubtle)
                    }
                    Spacer()
                    Image(systemName: showWriteBox ? "chevron.down" : "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.mabelSubtle)
                }
                .padding(MabelSpacing.cardPaddingGeneral)
                .background(
                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusSuggestion)
                        .fill(Color.mabelSurface)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusSuggestion)
                        .strokeBorder(Color.mabelBorderWarm, lineWidth: MabelSpacing.borderCard)
                )
                .mabelCardShadow()
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Write a memory instead")
            .padding(.bottom, MabelSpacing.md)

            if showWriteBox {
                TextEditor(text: $typedEntry)
                    .font(MabelTypography.body())
                    .foregroundColor(.mabelText)
                    .scrollContentBackground(.hidden)
                    .padding(MabelSpacing.cardPaddingGeneral)
                    .frame(minHeight: 160)
                    .background(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusSuggestion)
                            .fill(Color.mabelSurface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusSuggestion)
                            .strokeBorder(Color.mabelBorderWarm, lineWidth: MabelSpacing.borderCard)
                    )
                    .accessibilityLabel("Type your memory here")
                    .padding(.bottom, MabelSpacing.md)

                if !typedEntry.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    CTAButton(title: "SAVE WRITTEN MEMORY") {
                        saveTypedMemory()
                    }
                    .padding(.bottom, MabelSpacing.md)
                }
            }
        }
    }

    // MARK: - Data Methods

    private func loadPrompts() async {
        isLoadingPrompts = true

        let previousMemories = appState.chapters
            .flatMap { $0.memories }
            .compactMap { $0.narrativeText ?? $0.transcript }

        do {
            let aiPrompts = try await OpenAIService.shared.generatePrompts(
                chapterTitle: chapter.title,
                chapterTopic: chapter.topic,
                userName: appState.userProfile?.displayName ?? "Narrator",
                previousMemories: previousMemories,
                count: 3
            )
            if !aiPrompts.isEmpty {
                suggestionPrompts = aiPrompts
            } else {
                suggestionPrompts = ChapterPrompts.getPrompts(for: chapter.id, count: 3)
            }
        } catch {
            print("AI prompts failed, using static: \(error.localizedDescription)")
            suggestionPrompts = ChapterPrompts.getPrompts(for: chapter.id, count: 3)
        }

        isLoadingPrompts = false
    }

    private func saveTypedMemory() {
        let trimmed = typedEntry.trimmingCharacters(in: .whitespacesAndNewlines)
        let memory = Memory(
            promptUsed: nil,
            state: .submitted,
            typedEntry: trimmed,
            createdAt: Date()
        )
        appState.addMemory(chapterIndex: chapterIndex, memory: memory)

        let memoryID = memory.id
        Task {
            await StoryProcessingService.shared.processTypedMemory(
                memoryID: memoryID,
                chapterIndex: chapterIndex,
                text: trimmed,
                chapter: chapter,
                userName: appState.userProfile?.displayName ?? "Narrator",
                appState: appState
            )
        }

        typedEntry = ""
        showWriteBox = false
    }
}

// Navigation destination for recording
struct RecordingDestination: Hashable {
    let chapterIndex: Int
    let prompt: String?
}

#Preview {
    NavigationStack {
        RecordingSetupView(chapterIndex: 0)
            .environment(AppState())
    }
}
