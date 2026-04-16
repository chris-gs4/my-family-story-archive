import SwiftUI

struct MascotGreetingHeader: View {
    let userName: String

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 {
            return "Good morning"
        } else if hour < 17 {
            return "Good afternoon"
        } else {
            return "Good evening"
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: MabelSpacing.elementGap) {
            Image("MabelMascot")
                .renderingMode(.original)
                .resizable()
                .scaledToFit()
                .frame(width: MabelSpacing.mascotGreeting, height: MabelSpacing.mascotGreeting)

            VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                // Mabel badge
                HStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .fill(Color.mabelGold.opacity(0.2))
                            .frame(width: MabelSpacing.mabelIconSize, height: MabelSpacing.mabelIconSize)
                        Text("\u{1F475}")
                            .font(.system(size: 14))
                    }
                    Text("Mabel")
                        .font(MabelTypography.badge())
                        .foregroundColor(.mabelSubtle)
                }

                Text("\(greeting), \(userName)!")
                    .headingStyle()
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)

                Text("Let's capture a memory")
                    .font(MabelTypography.subheading())
                    .foregroundColor(.mabelText)
            }
            .padding(.top, MabelSpacing.tightGap)

            Spacer(minLength: 0)
        }
    }
}

#Preview {
    MascotGreetingHeader(userName: "Margaret")
        .padding(24)
        .background(Color.mabelWarmBg)
}
