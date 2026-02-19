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

    private let writingGoals = ["1x week", "2x week", "3x week", "I'll write when I want"]

    private var isFormValid: Bool {
        !displayName.trimmingCharacters(in: .whitespaces).isEmpty
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
                    .padding(.top, 16)
                    .padding(.bottom, 40)

                    // Name field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Tell us your name:")
                            .font(.comfortaa(16, weight: .bold))
                            .foregroundColor(.mabelText)

                        TextField("Your name", text: $displayName)
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelText)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.mabelSurface.opacity(0.9))
                            )
                    }
                    .padding(.bottom, 32)

                    // Writing goal
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Set a writing goal:")
                            .font(.comfortaa(16, weight: .bold))
                            .foregroundColor(.mabelText)

                        // 2x2 grid
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 8),
                            GridItem(.flexible(), spacing: 8)
                        ], spacing: 8) {
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
                    .padding(.bottom, 40)

                    // CTA
                    CTAButton(
                        title: "START RECORDING",
                        isDisabled: !isFormValid,
                        action: {
                            appState.completeOnboarding(
                                displayName: displayName.trimmingCharacters(in: .whitespaces),
                                writingGoal: selectedGoal ?? "1x week"
                            )
                        }
                    )

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
