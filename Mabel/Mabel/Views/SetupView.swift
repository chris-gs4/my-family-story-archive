import SwiftUI

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if currentX + size.width > maxWidth, currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }

            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
            maxX = max(maxX, currentX - spacing)
        }

        return (CGSize(width: maxX, height: currentY + lineHeight), positions)
    }
}

struct SetupView: View {
    @Environment(AppState.self) private var appState
    @State private var displayName = ""
    @State private var selectedRelationship: String? = nil
    @State private var otherRelationship = ""
    @State private var selectedTopics: Set<String> = []
    @State private var skipTopics = false
    @FocusState private var isNameFocused: Bool
    @FocusState private var isOtherFocused: Bool

    private let relationships = ["Myself", "A Parent", "A Grandparent", "A Friend", "Other"]

    private let topics = [
        "Childhood", "Immigration", "Career", "Family",
        "War / Service", "Education", "Faith", "Love / Relationships",
        "Health / Overcoming Adversity"
    ]

    private let maxTopics = 5

    private var isFormValid: Bool {
        let hasName = !displayName.trimmingCharacters(in: .whitespaces).isEmpty
        let hasTopicsOrSkipped = !selectedTopics.isEmpty || skipTopics
        let hasRelationship = selectedRelationship != nil &&
            (selectedRelationship != "Other" || !otherRelationship.trimmingCharacters(in: .whitespaces).isEmpty)
        return hasName && hasTopicsOrSkipped && hasRelationship
    }

    private var helperText: String {
        if selectedRelationship == nil {
            return "Who is this story for?"
        }
        if selectedRelationship == "Other" && otherRelationship.trimmingCharacters(in: .whitespaces).isEmpty {
            return "Please describe who this story is for"
        }
        let name = displayName.trimmingCharacters(in: .whitespaces)
        if name.isEmpty {
            return "Please enter a name"
        } else if selectedTopics.isEmpty && !skipTopics {
            return "Select topics or tap \"Surprise me\""
        } else if !selectedTopics.isEmpty {
            return "\(selectedTopics.count)/\(maxTopics) topics selected"
        } else {
            return "Ready to start!"
        }
    }

    private var resolvedRelationship: String? {
        if selectedRelationship == "Other" {
            let trimmed = otherRelationship.trimmingCharacters(in: .whitespaces)
            return trimmed.isEmpty ? nil : trimmed
        }
        return selectedRelationship
    }

    private func toggleTopic(_ topic: String) {
        skipTopics = false
        if selectedTopics.contains(topic) {
            selectedTopics.remove(topic)
        } else if selectedTopics.count < maxTopics {
            selectedTopics.insert(topic)
        }
    }

    var body: some View {
        ZStack {
            // White→sage gradient matching Welcome screen
            LinearGradient(
                colors: [.mabelBackground, .mabelBackgroundGradientEnd],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea(.all, edges: .all)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Lockup — icon + wordmark, centered
                    MabelWordmarkLockup()
                        .frame(maxWidth: .infinity)
                        .padding(.top, MabelSpacing.topSafe)
                        .padding(.bottom, MabelSpacing.xxxl)

                    // Heading — Nunito ExtraBold, centered
                    Text("Whose Story Are\nWe Telling?")
                        .headingStyle()
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, MabelSpacing.tightGap)

                    // Subtitle — matching Welcome screen pattern
                    Text("Your answers help Mabel ask better questions.")
                        .font(MabelTypography.body())
                        .foregroundColor(.mabelText.opacity(0.80))
                        .lineSpacing(16 * 0.6)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, MabelSpacing.sectionGap)

                    // 1. Relationship — full-width stacked pills
                    setupRelationshipSection

                    // 2. Name field
                    setupNameSection

                    // 3. Topics of interest
                    setupTopicsSection

                    // CTA
                    CTAButton(
                        title: "Let's Start",
                        isDisabled: !isFormValid,
                        action: {
                            appState.completeOnboarding(
                                displayName: displayName.trimmingCharacters(in: .whitespaces),
                                writingGoal: "No goal for now",
                                topicsOfInterest: Array(selectedTopics),
                                relationship: resolvedRelationship
                            )
                        }
                    )

                    // Helper text
                    Text(helperText)
                        .font(MabelTypography.helper())
                        .foregroundColor(.mabelSubtle)
                        .frame(maxWidth: .infinity)
                        .multilineTextAlignment(.center)
                        .padding(.top, MabelSpacing.md)

                    Spacer()
                        .frame(height: MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    // MARK: - Relationship Section

    private var setupRelationshipSection: some View {
        VStack(alignment: .leading, spacing: MabelSpacing.md) {
            Text("I'm capturing the story of...")
                .font(MabelTypography.subheading())
                .foregroundColor(.mabelText)

            // Full-width stacked pills (Stoic-style)
            VStack(spacing: MabelSpacing.md) {
                ForEach(relationships, id: \.self) { relationship in
                    PillButton(
                        title: relationship,
                        isSelected: selectedRelationship == relationship
                    ) {
                        selectedRelationship = relationship
                    }
                    .accessibilityHint("Select \(relationship) as the storyteller")
                }
            }

            // Other — text input
            if selectedRelationship == "Other" {
                TextField("e.g. My uncle, a mentor, a neighbour...", text: $otherRelationship)
                    .font(.comfortaa(15, weight: .regular))
                    .foregroundColor(.mabelText)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.sentences)
                    .focused($isOtherFocused)
                    .padding(.horizontal, MabelSpacing.inputPadH)
                    .padding(.vertical, MabelSpacing.inputPadV)
                    .background(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                            .fill(Color.white)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                            .strokeBorder(
                                isOtherFocused ? Color.mabelPrimary : Color.mabelPrimary.opacity(0.3),
                                lineWidth: MabelSpacing.borderButton
                            )
                    )
                    .mabelInputShadow(focused: isOtherFocused)
                    .animation(MabelAnimation.focusTransition, value: isOtherFocused)
                    .padding(.top, MabelSpacing.xs)
                    .accessibilityLabel("Other relationship")
                    .accessibilityHint("Describe who this story is for")
            }
        }
        .padding(.bottom, MabelSpacing.sectionGap)
    }

    // MARK: - Name Section

    private var setupNameSection: some View {
        VStack(alignment: .leading, spacing: MabelSpacing.md) {
            Text("What's their name?")
                .font(MabelTypography.subheading())
                .foregroundColor(.mabelText)

            Text("Enter your name, or the person whose story we're telling.")
                .font(MabelTypography.helper())
                .foregroundColor(.mabelSubtle)
                .lineLimit(1)
                .minimumScaleFactor(0.85)

            TextField("Enter a name", text: $displayName)
                .font(.comfortaa(17, weight: .regular))
                .foregroundColor(.mabelText)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.words)
                .focused($isNameFocused)
                .padding(.horizontal, MabelSpacing.inputPadH)
                .padding(.vertical, MabelSpacing.inputPadV)
                .background(
                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                        .fill(Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                        .strokeBorder(
                            isNameFocused ? Color.mabelPrimary : Color.mabelPrimary.opacity(0.3),
                            lineWidth: MabelSpacing.borderButton
                        )
                )
                .mabelInputShadow(focused: isNameFocused)
                .animation(MabelAnimation.focusTransition, value: isNameFocused)
                .accessibilityLabel("Name")
                .accessibilityHint("Enter the name of the person whose story you're capturing")
        }
        .padding(.bottom, MabelSpacing.sectionGap)
    }

    // MARK: - Topics Section

    private var setupTopicsSection: some View {
        VStack(alignment: .leading, spacing: MabelSpacing.md) {
            HStack(alignment: .firstTextBaseline) {
                Text("Topics of interest")
                    .font(MabelTypography.subheading())
                    .foregroundColor(.mabelText)

                Text("(pick up to \(maxTopics))")
                    .font(MabelTypography.helper())
                    .foregroundColor(.mabelSubtle)
            }

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: MabelSpacing.md),
                GridItem(.flexible(), spacing: MabelSpacing.md)
            ], spacing: MabelSpacing.md) {
                ForEach(topics, id: \.self) { topic in
                    let isSelected = selectedTopics.contains(topic)
                    let atLimit = selectedTopics.count >= maxTopics && !isSelected
                    PillButton(
                        title: topic,
                        isSelected: isSelected,
                        isDisabled: atLimit || skipTopics
                    ) {
                        toggleTopic(topic)
                    }
                    .accessibilityHint(isSelected ? "Selected. Tap to deselect" : "Tap to select")
                }

                // "Surprise me" inside the grid — same size as every other pill
                PillButton(
                    title: "Surprise me",
                    isSelected: skipTopics
                ) {
                    skipTopics.toggle()
                    if skipTopics {
                        selectedTopics.removeAll()
                    }
                }
                .accessibilityHint("Let Mabel choose topics for you")
            }
        }
        .padding(.bottom, MabelSpacing.xxxl)
    }
}

#Preview {
    NavigationStack {
        SetupView()
            .environment(AppState())
    }
}
