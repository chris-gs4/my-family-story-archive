import SwiftUI

struct SuggestionCard: View {
    let prompt: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            SuggestionCardContent(prompt: prompt)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(prompt)
        .accessibilityHint("Double tap to start recording with this prompt")
    }
}

/// Non-interactive label version for use inside NavigationLink
struct SuggestionCardLabel: View {
    let prompt: String

    var body: some View {
        SuggestionCardContent(prompt: prompt)
            .accessibilityLabel(prompt)
            .accessibilityHint("Double tap to start recording with this prompt")
    }
}

/// Shared visual content for suggestion cards
private struct SuggestionCardContent: View {
    let prompt: String

    var body: some View {
        HStack {
            Text(prompt)
                .font(MabelTypography.body())
                .foregroundColor(.mabelText)
                .multilineTextAlignment(.leading)
            Spacer()
            Image(systemName: "chevron.right")
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
    }
}

#Preview {
    VStack(spacing: MabelSpacing.tightGap) {
        SuggestionCard(prompt: "What are your favorite family traditions?") {}
        SuggestionCard(prompt: "Describe your childhood home.") {}
        SuggestionCard(prompt: "Tell me about when you first met Grandma.") {}
    }
    .padding()
    .background(Color.mabelBackground)
}
