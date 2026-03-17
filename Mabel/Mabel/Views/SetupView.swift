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
    @State private var selectedGoal: String? = nil
    @State private var selectedTopics: Set<String> = []
    @State private var skipTopics = false
    @FocusState private var isNameFocused: Bool
    @FocusState private var isOtherFocused: Bool

    private let relationships = ["Myself", "A Parent", "A Grandparent", "A Friend", "Other"]

    private let writingGoals = ["1x week", "2x week", "3x week", "No goal for now"]

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
            return "Select topics or tap \"I'll figure it out\""
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
            MabelGradientBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Wordmark centered
                    HStack {
                        Spacer()
                        Image("MabelWordmark")
                            .renderingMode(.original)
                            .resizable()
                            .scaledToFit()
                            .frame(height: 24)
                        Spacer()
                    }
                    .padding(.top, 24)
                    .padding(.bottom, 40)

                    // Heading
                    Text("Whose Story Are\nWe Telling?")
                        .font(.comfortaa(28, weight: .bold))
                        .foregroundColor(.mabelText)
                        .padding(.bottom, 32)

                    // 1. Relationship (no label — the heading serves as context)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("I'm capturing the story of...")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 12),
                            GridItem(.flexible(), spacing: 12)
                        ], spacing: 12) {
                            ForEach(relationships, id: \.self) { relationship in
                                PillButton(
                                    title: relationship,
                                    isSelected: selectedRelationship == relationship
                                ) {
                                    selectedRelationship = relationship
                                }
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
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(Color.white)
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .strokeBorder(isOtherFocused ? Color.mabelTeal : Color.mabelTeal.opacity(0.3), lineWidth: 3)
                                )
                                .shadow(color: isOtherFocused ? Color.mabelTeal.opacity(0.3) : .clear, radius: 10, x: 0, y: 0)
                                .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 3)
                                .animation(.easeInOut(duration: 0.2), value: isOtherFocused)
                                .padding(.top, 4)
                        }
                    }
                    .padding(.bottom, 32)

                    // 2. Name field
                    VStack(alignment: .leading, spacing: 12) {
                        Text("What's their name?")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        Text("Enter your name, or the name of the person whose story you're capturing.")
                            .font(.comfortaa(13, weight: .regular))
                            .foregroundColor(.mabelSubtle)

                        TextField("Enter a name", text: $displayName)
                            .font(.comfortaa(17, weight: .regular))
                            .foregroundColor(.mabelText)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.words)
                            .focused($isNameFocused)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(Color.white)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .strokeBorder(isNameFocused ? Color.mabelTeal : Color.mabelTeal.opacity(0.3), lineWidth: 3)
                            )
                            .shadow(color: isNameFocused ? Color.mabelTeal.opacity(0.3) : .clear, radius: 10, x: 0, y: 0)
                            .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 3)
                            .animation(.easeInOut(duration: 0.2), value: isNameFocused)
                    }
                    .padding(.bottom, 32)

                    // 3. Writing goal
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Set a writing goal:")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 12),
                            GridItem(.flexible(), spacing: 12)
                        ], spacing: 12) {
                            ForEach(writingGoals, id: \.self) { goal in
                                PillButton(
                                    title: goal,
                                    isSelected: selectedGoal == goal
                                ) {
                                    selectedGoal = goal
                                }
                            }
                        }
                    }
                    .padding(.bottom, 32)

                    // 4. Topics of interest
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Topics of interest:")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        Text("(pick up to \(maxTopics))")
                            .font(.comfortaa(13, weight: .medium))
                            .foregroundColor(.mabelText.opacity(0.75))
                    }
                    .padding(.bottom, 8)

                    // Skip link
                    Button(action: {
                        skipTopics = true
                        selectedTopics.removeAll()
                    }) {
                        Text("I'll figure it out as I go")
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(skipTopics ? .mabelTeal : .mabelSubtle)
                            .underline()
                    }
                    .padding(.bottom, 12)

                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12)
                    ], spacing: 12) {
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
                        }
                    }
                    .padding(.bottom, 40)

                    // CTA
                    CTAButton(
                        title: "Let's Start",
                        isDisabled: !isFormValid,
                        action: {
                            appState.completeOnboarding(
                                displayName: displayName.trimmingCharacters(in: .whitespaces),
                                writingGoal: selectedGoal ?? "No goal for now",
                                topicsOfInterest: Array(selectedTopics),
                                relationship: resolvedRelationship
                            )
                        }
                    )

                    // Helper text
                    Text(helperText)
                        .font(.comfortaa(13, weight: .medium))
                        .foregroundColor(.mabelSubtle)
                        .frame(maxWidth: .infinity)
                        .multilineTextAlignment(.center)
                        .padding(.top, 12)

                    Spacer()
                        .frame(height: 40)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarHidden(true)
    }
}

#Preview {
    NavigationStack {
        SetupView()
            .environment(AppState())
    }
}
