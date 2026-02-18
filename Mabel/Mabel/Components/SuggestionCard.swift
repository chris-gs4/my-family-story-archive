import SwiftUI

struct SuggestionCard: View {
    let prompt: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(prompt)
                    .font(.comfortaa(15, weight: .regular))
                    .foregroundColor(.mabelText)
                    .multilineTextAlignment(.leading)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.mabelSubtle)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.mabelSurface.opacity(0.95))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack(spacing: 8) {
        SuggestionCard(prompt: "What are your favorite family traditions?") {}
        SuggestionCard(prompt: "Describe your childhood home.") {}
        SuggestionCard(prompt: "Tell me about when you first met Grandma.") {}
    }
    .padding()
    .background(Color.mabelBackground)
}
