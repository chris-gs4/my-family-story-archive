import SwiftUI

struct PromptCard: View {
    let title: String
    let description: String
    let emoji: String
    let action: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Today's Prompt:")
                    .font(.comfortaa(16, weight: .bold))
                    .foregroundColor(.mabelTeal)
                Spacer()
                Text(emoji)
                    .font(.system(size: 28))
            }

            Text(title)
                .font(.comfortaa(22, weight: .bold))
                .foregroundColor(.mabelText)

            Text(description)
                .font(.comfortaa(16, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .lineSpacing(4)

            CTAButton(title: "Start Recording", action: action)
                .padding(.top, 4)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.mabelSurface)
        )
        .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
    }
}

#Preview {
    PromptCard(
        title: "A comforting childhood taste",
        description: "What food brings back warm feelings for you?",
        emoji: "\u{1F36A}"
    ) {}
    .padding(24)
    .background(Color.mabelWarmBg)
}
