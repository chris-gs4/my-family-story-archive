import UIKit

struct PDFExportService {

    static func generateBookPDF(
        title: String,
        authorName: String,
        chapters: [Chapter]
    ) -> URL? {
        let approvedChapters = chapters.filter { $0.isApproved && $0.generatedNarrative != nil }
        guard !approvedChapters.isEmpty else { return nil }

        let pageWidth: CGFloat = 612   // US Letter
        let pageHeight: CGFloat = 792
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
        let margin: CGFloat = 72       // 1-inch margins

        let textRect = CGRect(
            x: margin,
            y: margin,
            width: pageWidth - margin * 2,
            height: pageHeight - margin * 2
        )

        let titleFont = UIFont(name: "Comfortaa-Bold", size: 32) ?? UIFont.boldSystemFont(ofSize: 32)
        let subtitleFont = UIFont(name: "Comfortaa-Regular", size: 18) ?? UIFont.systemFont(ofSize: 18)
        let chapterTitleFont = UIFont(name: "Comfortaa-Bold", size: 24) ?? UIFont.boldSystemFont(ofSize: 24)
        let bodyFont = UIFont(name: "Comfortaa-Regular", size: 12) ?? UIFont.systemFont(ofSize: 12)

        let textColor = UIColor(red: 0.176, green: 0.125, blue: 0.098, alpha: 1.0) // mabelText
        let subtleColor = UIColor(red: 0.478, green: 0.443, blue: 0.408, alpha: 1.0) // mabelSubtle

        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

        let data = renderer.pdfData { context in
            // -- Cover Page --
            context.beginPage()

            let coverTitleAttrs: [NSAttributedString.Key: Any] = [
                .font: titleFont,
                .foregroundColor: textColor,
                .paragraphStyle: centeredParagraphStyle()
            ]

            let coverSubtitleAttrs: [NSAttributedString.Key: Any] = [
                .font: subtitleFont,
                .foregroundColor: subtleColor,
                .paragraphStyle: centeredParagraphStyle()
            ]

            let bookTitle = title as NSString
            let coverTitleRect = CGRect(
                x: margin,
                y: pageHeight * 0.35,
                width: pageWidth - margin * 2,
                height: 80
            )
            bookTitle.draw(in: coverTitleRect, withAttributes: coverTitleAttrs)

            let byLine = "by \(authorName)" as NSString
            let byLineRect = CGRect(
                x: margin,
                y: pageHeight * 0.35 + 60,
                width: pageWidth - margin * 2,
                height: 40
            )
            byLine.draw(in: byLineRect, withAttributes: coverSubtitleAttrs)

            let tagline = "Written with Mabel" as NSString
            let taglineRect = CGRect(
                x: margin,
                y: pageHeight * 0.75,
                width: pageWidth - margin * 2,
                height: 30
            )
            tagline.draw(in: taglineRect, withAttributes: coverSubtitleAttrs)

            // -- Chapter Pages --
            for chapter in approvedChapters {
                guard let narrative = chapter.generatedNarrative else { continue }

                context.beginPage()

                // Chapter title
                let chapterHeading = "Chapter \(chapter.id) – \(chapter.title)" as NSString
                let headingAttrs: [NSAttributedString.Key: Any] = [
                    .font: chapterTitleFont,
                    .foregroundColor: textColor
                ]

                let headingSize = chapterHeading.boundingRect(
                    with: CGSize(width: textRect.width, height: .greatestFiniteMagnitude),
                    options: [.usesLineFragmentOrigin],
                    attributes: headingAttrs,
                    context: nil
                )
                let headingRect = CGRect(
                    x: margin,
                    y: margin,
                    width: textRect.width,
                    height: headingSize.height
                )
                chapterHeading.draw(in: headingRect, withAttributes: headingAttrs)

                // Body text — paginated
                let bodyAttrs: [NSAttributedString.Key: Any] = [
                    .font: bodyFont,
                    .foregroundColor: textColor,
                    .paragraphStyle: bodyParagraphStyle()
                ]

                let bodyString = NSAttributedString(string: narrative, attributes: bodyAttrs)
                let frameSetter = CTFramesetterCreateWithAttributedString(bodyString)

                var currentRange = CFRange(location: 0, length: 0)
                var yOffset = headingRect.maxY + 20
                var isFirstPage = true

                while currentRange.location < bodyString.length {
                    let availableHeight: CGFloat
                    if isFirstPage {
                        availableHeight = pageHeight - margin - yOffset
                    } else {
                        context.beginPage()
                        yOffset = margin
                        availableHeight = textRect.height
                    }

                    let framePath = CGPath(
                        rect: CGRect(x: margin, y: 0, width: textRect.width, height: availableHeight),
                        transform: nil
                    )

                    // CoreText uses flipped coordinates, so we transform
                    let ctContext = context.cgContext
                    ctContext.saveGState()
                    ctContext.textMatrix = .identity
                    ctContext.translateBy(x: 0, y: yOffset + availableHeight)
                    ctContext.scaleBy(x: 1.0, y: -1.0)

                    let frame = CTFramesetterCreateFrame(frameSetter, currentRange, framePath, nil)
                    CTFrameDraw(frame, ctContext)

                    ctContext.restoreGState()

                    let visibleRange = CTFrameGetVisibleStringRange(frame)
                    currentRange = CFRange(
                        location: visibleRange.location + visibleRange.length,
                        length: 0
                    )

                    isFirstPage = false
                }
            }
        }

        // Write to temp file
        let fileName = "\(authorName)'s Book.pdf"
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        do {
            try data.write(to: tempURL)
            return tempURL
        } catch {
            print("Failed to write PDF: \(error)")
            return nil
        }
    }

    // MARK: - Helpers

    private static func centeredParagraphStyle() -> NSParagraphStyle {
        let style = NSMutableParagraphStyle()
        style.alignment = .center
        return style
    }

    private static func bodyParagraphStyle() -> NSParagraphStyle {
        let style = NSMutableParagraphStyle()
        style.lineSpacing = 6
        style.paragraphSpacing = 12
        return style
    }
}
