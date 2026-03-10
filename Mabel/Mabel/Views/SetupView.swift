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
    @State private var selectedGoal: String? = nil
    @State private var selectedTopics: Set<String> = []
    @FocusState private var isNameFocused: Bool

    private let writingGoals = ["1x week", "2x week", "3x week", "I'll write when I want"]

    private let topics = [
        "Childhood", "Immigration", "Career", "Family",
        "War / Service", "Education", "Faith", "Love & Relationships",
        "Life Challenges", "Whatever comes to mind"
    ]

    private let maxTopics = 5

    private var isFormValid: Bool {
        !displayName.trimmingCharacters(in: .whitespaces).isEmpty && !selectedTopics.isEmpty
    }

    private var helperText: String {
        let name = displayName.trimmingCharacters(in: .whitespaces)
        if name.isEmpty {
            return "Please enter your name"
        } else if selectedTopics.isEmpty {
            return "Please select at least one topic"
        } else {
            return "\(selectedTopics.count)/\(maxTopics) topics selected"
        }
    }

    private func toggleTopic(_ topic: String) {
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
                    // Wordmark centered — 24pt below status bar
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
                    .padding(.bottom, 32)

                    // Name field
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Tell me your name:")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        TextField("Your name", text: $displayName)
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

                    // Writing goal
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

                    // Topics of interest
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Topics of interest:")
                            .font(.comfortaa(17, weight: .semiBold))
                            .foregroundColor(.mabelText)

                        Text("(pick up to \(maxTopics))")
                            .font(.comfortaa(13, weight: .medium))
                            .foregroundColor(.mabelText.opacity(0.75))
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
                                isDisabled: atLimit
                            ) {
                                toggleTopic(topic)
                            }
                        }
                    }
                    .padding(.bottom, 40)

                    // CTA
                    CTAButton(
                        title: "START RECORDING",
                        isDisabled: !isFormValid,
                        action: {
                            appState.completeOnboarding(
                                displayName: displayName.trimmingCharacters(in: .whitespaces),
                                writingGoal: selectedGoal ?? "I'll write when I want",
                                topicsOfInterest: Array(selectedTopics)
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
