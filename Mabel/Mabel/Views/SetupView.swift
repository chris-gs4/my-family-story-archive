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
    @Binding var setupData: SetupData
    let onStart: () -> Void

    var body: some View {
        ZStack {
            // BACKGROUND — fills entire screen
            MabelGradientBackground()

            // CONTENT — in ScrollView since this screen has a lot of content
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Wordmark IMAGE centered
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
                    .padding(.bottom, 24)

                    // Heading
                    Text("Whose Story Are We Telling?")
                        .font(.comfortaa(28, weight: .bold))
                        .foregroundColor(.mabelText)
                        .padding(.bottom, 32)

                    // Name field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Name")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        TextField("Enter their name", text: $setupData.name)
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

                    // Relationship — single-select
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Relationship")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        FlowLayout(spacing: 8) {
                            ForEach(SetupData.relationships, id: \.self) { relationship in
                                PillButton(
                                    title: relationship,
                                    isSelected: setupData.relationship == relationship
                                ) {
                                    setupData.relationship = relationship
                                }
                            }
                        }
                    }
                    .padding(.bottom, 32)

                    // Topics — multi-select (max 3)
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Topics")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        // "I'll figure it out" — subtle text link, NOT a pill
                        Button(action: {
                            setupData.isFreeJournaling.toggle()
                            if setupData.isFreeJournaling {
                                setupData.topics.removeAll()
                            }
                        }) {
                            Text("I'll figure it out as I go")
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle)
                                .underline(setupData.isFreeJournaling, color: .mabelSubtle)
                        }

                        if !setupData.isFreeJournaling {
                            FlowLayout(spacing: 8) {
                                ForEach(SetupData.topics, id: \.self) { topic in
                                    PillButton(
                                        title: topic,
                                        isSelected: setupData.topics.contains(topic)
                                    ) {
                                        if setupData.topics.contains(topic) {
                                            setupData.topics.remove(topic)
                                        } else if setupData.topics.count < 3 {
                                            setupData.topics.insert(topic)
                                        }
                                    }
                                }
                            }

                            if setupData.topics.count >= 3 {
                                Text("Maximum 3 topics selected")
                                    .font(.comfortaa(12, weight: .regular))
                                    .foregroundColor(.mabelSubtle)
                            }
                        }
                    }
                    .padding(.bottom, 32)

                    // CTA — disabled until name filled AND (1+ topic OR free journaling)
                    CTAButton(
                        title: "Let's Start",
                        isDisabled: !setupData.isComplete,
                        action: onStart
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
        SetupView(
            setupData: .constant(SetupData()),
            onStart: {}
        )
    }
}
