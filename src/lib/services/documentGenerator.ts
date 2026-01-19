// Document Generation Service
// Generates PDF, DOCX, and TXT files from narrative content

import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface NarrativeData {
  title: string;
  content: string;
  intervieweeName?: string;
  wordCount?: number;
  createdAt?: Date;
  structure?: {
    chapters: Array<{ title: string; startPage?: number }>;
  };
}

interface DocumentGeneratorResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Generate a PDF document from narrative
 */
export async function generatePDF(data: NarrativeData): Promise<DocumentGeneratorResult> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          mimeType: 'application/pdf',
          filename: `${sanitizeFilename(data.title)}.pdf`,
        });
      });
      doc.on('error', reject);

      // Add metadata
      doc.info.Title = data.title;
      doc.info.Author = data.intervieweeName || 'Family Story Archive';
      doc.info.Subject = 'Family Story';
      doc.info.CreationDate = data.createdAt || new Date();

      // Title Page
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .text(data.title, {
          align: 'center',
        });

      doc.moveDown(2);

      if (data.intervieweeName) {
        doc.fontSize(16)
          .font('Helvetica')
          .text(`The Story of ${data.intervieweeName}`, {
            align: 'center',
          });
        doc.moveDown(1);
      }

      if (data.createdAt) {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#666666')
          .text(new Date(data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }), {
            align: 'center',
          });
      }

      // Add page break
      doc.addPage();

      // Reset text color
      doc.fillColor('#000000');

      // Table of Contents (if chapters exist)
      if (data.structure?.chapters && data.structure.chapters.length > 0) {
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .text('Table of Contents', {
            underline: true,
          });

        doc.moveDown(1);

        data.structure.chapters.forEach((chapter) => {
          doc.fontSize(12)
            .font('Helvetica')
            .text(`• ${chapter.title}`, {
              indent: 20,
            });
          doc.moveDown(0.3);
        });

        doc.addPage();
      }

      // Process content - split by chapters if available
      const contentSections = splitContentByChapters(data.content, data.structure?.chapters || []);

      contentSections.forEach((section, index) => {
        if (index > 0) {
          doc.addPage();
        }

        if (section.title) {
          doc.fontSize(18)
            .font('Helvetica-Bold')
            .text(section.title, {
              align: 'left',
            });
          doc.moveDown(1);
        }

        // Add body text
        const paragraphs = section.content.split('\n\n');
        paragraphs.forEach((paragraph) => {
          if (paragraph.trim()) {
            doc.fontSize(12)
              .font('Helvetica')
              .text(paragraph.trim(), {
                align: 'justify',
                lineGap: 4,
              });
            doc.moveDown(1);
          }
        });
      });

      // Add footer with page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        // Skip page number on title page
        if (i === 0) continue;

        doc.fontSize(10)
          .font('Helvetica')
          .fillColor('#666666')
          .text(
            `Page ${i}`,
            72,
            doc.page.height - 50,
            {
              align: 'center',
              width: doc.page.width - 144,
            }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a DOCX document from narrative
 */
export async function generateDOCX(data: NarrativeData): Promise<DocumentGeneratorResult> {
  try {
    const sections: Paragraph[] = [];

    // Title
    sections.push(
      new Paragraph({
        text: data.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      })
    );

    // Subtitle with interviewee name
    if (data.intervieweeName) {
      sections.push(
        new Paragraph({
          text: `The Story of ${data.intervieweeName}`,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Date
    if (data.createdAt) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              color: '666666',
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 800,
          },
        })
      );
    }

    // Page break
    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );

    // Table of Contents
    if (data.structure?.chapters && data.structure.chapters.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Table of Contents',
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
          },
        })
      );

      data.structure.chapters.forEach((chapter) => {
        sections.push(
          new Paragraph({
            text: `• ${chapter.title}`,
            spacing: {
              after: 100,
            },
            indent: {
              left: 720,
            },
          })
        );
      });

      sections.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        })
      );
    }

    // Content sections
    const contentSections = splitContentByChapters(data.content, data.structure?.chapters || []);

    contentSections.forEach((section, index) => {
      if (index > 0) {
        sections.push(
          new Paragraph({
            text: '',
            pageBreakBefore: true,
          })
        );
      }

      // Chapter heading
      if (section.title) {
        sections.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 240,
            },
          })
        );
      }

      // Body paragraphs
      const paragraphs = section.content.split('\n\n');
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          sections.push(
            new Paragraph({
              text: paragraph.trim(),
              spacing: {
                after: 200,
                line: 360, // 1.5 line spacing
              },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      });
    });

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return {
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: `${sanitizeFilename(data.title)}.docx`,
    };
  } catch (error) {
    throw new Error(`Failed to generate DOCX: ${error}`);
  }
}

/**
 * Generate a plain text file from narrative
 */
export function generateTXT(data: NarrativeData): DocumentGeneratorResult {
  let content = '';

  // Title
  content += `${data.title}\n`;
  content += '='.repeat(data.title.length) + '\n\n';

  // Subtitle
  if (data.intervieweeName) {
    content += `The Story of ${data.intervieweeName}\n\n`;
  }

  // Date
  if (data.createdAt) {
    content += new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    content += '\n\n';
  }

  content += '-'.repeat(50) + '\n\n';

  // Table of Contents
  if (data.structure?.chapters && data.structure.chapters.length > 0) {
    content += 'TABLE OF CONTENTS\n\n';
    data.structure.chapters.forEach((chapter, index) => {
      content += `${index + 1}. ${chapter.title}\n`;
    });
    content += '\n' + '-'.repeat(50) + '\n\n';
  }

  // Content
  const contentSections = splitContentByChapters(data.content, data.structure?.chapters || []);

  contentSections.forEach((section, index) => {
    if (index > 0) {
      content += '\n\n' + '-'.repeat(50) + '\n\n';
    }

    if (section.title) {
      content += `${section.title.toUpperCase()}\n\n`;
    }

    content += section.content + '\n';
  });

  const buffer = Buffer.from(content, 'utf-8');

  return {
    buffer,
    mimeType: 'text/plain',
    filename: `${sanitizeFilename(data.title)}.txt`,
  };
}

/**
 * Helper function to split content by chapters
 */
function splitContentByChapters(
  content: string,
  chapters: Array<{ title: string; startPage?: number }>
): Array<{ title?: string; content: string }> {
  if (chapters.length === 0) {
    return [{ content }];
  }

  const sections: Array<{ title?: string; content: string }> = [];
  const lines = content.split('\n');
  let currentSection = { title: '', content: '' };
  let inChapter = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this line is a chapter heading
    const matchingChapter = chapters.find(
      (ch) => trimmedLine.toLowerCase() === ch.title.toLowerCase()
    );

    if (matchingChapter) {
      // Save previous section if it has content
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: matchingChapter.title,
        content: '',
      };
      inChapter = true;
    } else if (inChapter) {
      currentSection.content += line + '\n';
    } else {
      // Before first chapter
      currentSection.content += line + '\n';
    }
  }

  // Add the last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ content }];
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Export types
export type { NarrativeData, DocumentGeneratorResult };
