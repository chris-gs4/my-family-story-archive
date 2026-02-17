import SwiftUI

struct SuggestionCard: View {
    let prompt: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(prompt)
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelText)
                    .multilineTextAlignment(.leading)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.mabelSubtle)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.mabelSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(Color.mabelSubtle.opacity(0.2), lineWidth: 1)
            )
        }
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
