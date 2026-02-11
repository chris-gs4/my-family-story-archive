// Document Generation Service
// Generates PDF, DOCX, and TXT files from narrative content

import { jsPDF } from 'jspdf';
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

// New interface for module-based book generation
interface ModuleChapterData {
  moduleNumber: number;
  title?: string;
  content: string;
  wordCount?: number;
  illustrationUrl?: string | null;
}

interface BookData {
  title: string;
  intervieweeName?: string;
  chapters: ModuleChapterData[];
  createdAt?: Date;
  projectCreatedAt?: Date;
}

interface DocumentGeneratorResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Generate a PDF document from a complete book (all approved module chapters)
 */
export async function generateBookPDF(data: BookData): Promise<DocumentGeneratorResult> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 72;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left', color: number[] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        let xPosition = margin;
        if (align === 'center') {
          const textWidth = doc.getTextWidth(line);
          xPosition = (pageWidth - textWidth) / 2;
        }

        doc.text(line, xPosition, yPosition);
        yPosition += fontSize * 1.5;
      });

      doc.setTextColor(0, 0, 0);
    };

    const addSpacing = (space: number) => {
      yPosition += space;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title Page
    addText(data.title, 32, true, 'center');
    addSpacing(40);

    if (data.intervieweeName) {
      addText(`The Story of ${data.intervieweeName}`, 18, false, 'center');
      addSpacing(20);
    }

    addText(`${data.chapters.length} ${data.chapters.length === 1 ? 'Chapter' : 'Chapters'}`, 14, false, 'center', [102, 102, 102]);
    addSpacing(10);

    if (data.createdAt) {
      const dateStr = new Date(data.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      addText(dateStr, 12, false, 'center', [102, 102, 102]);
    }

    // Table of Contents (new page)
    doc.addPage();
    yPosition = margin;

    addText('Table of Contents', 24, true, 'center');
    addSpacing(40);

    data.chapters.forEach((chapter, index) => {
      const chapterTitle = chapter.title || `Chapter ${chapter.moduleNumber}`;
      addText(`${index + 1}. ${chapterTitle}`, 12, false, 'left');
      addSpacing(5);
    });

    // Add chapters
    data.chapters.forEach((chapter, index) => {
      doc.addPage();
      yPosition = margin;

      const chapterTitle = chapter.title || `Chapter ${chapter.moduleNumber}`;

      // Chapter number
      addText(`Chapter ${index + 1}`, 14, false, 'left', [102, 102, 102]);
      addSpacing(10);

      // Chapter title
      addText(chapterTitle, 20, true, 'left');
      addSpacing(30);

      // Chapter content
      const paragraphs = chapter.content.split('\n\n');
      paragraphs.forEach((paragraph, pIndex) => {
        if (paragraph.trim()) {
          if (paragraph.trim().startsWith('#')) {
            addSpacing(20);
            const headingText = paragraph.trim().replace(/^#+\s/, '');
            addText(headingText, 16, true);
            addSpacing(10);
          } else {
            addText(paragraph.trim(), 12, false);
            if (pIndex < paragraphs.length - 1) {
              addSpacing(15);
            }
          }
        }
      });
    });

    // Add page numbers to all pages (except title page)
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`${i - 1}`, pageWidth / 2, pageHeight - 36, { align: 'center' });
    }

    // Set metadata
    doc.setProperties({
      title: data.title,
      author: data.intervieweeName || 'Family Story Archive',
      subject: 'Family Story - Complete Book',
      creator: 'Family Story Archive',
    });

    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfArrayBuffer);

    return {
      buffer,
      mimeType: 'application/pdf',
      filename: `${sanitizeFilename(data.title)}_complete-book.pdf`,
    };
  } catch (error) {
    throw new Error(`Failed to generate book PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a PDF document from a single module chapter
 */
export async function generateChapterPDF(
  chapterData: ModuleChapterData,
  intervieweeName?: string,
  projectTitle?: string
): Promise<DocumentGeneratorResult> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const chapterTitle = chapterData.title || `Chapter ${chapterData.moduleNumber}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 72;
    const maxWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left') => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          addPageNumber();
          // Reset font settings after page number
          doc.setFontSize(fontSize);
          if (isBold) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          doc.setTextColor(0, 0, 0);
        }

        let xPosition = margin;
        if (align === 'center') {
          const textWidth = doc.getTextWidth(line);
          xPosition = (pageWidth - textWidth) / 2;
        }

        doc.text(line, xPosition, yPosition);
        yPosition += fontSize * 1.5;
      });
    };

    // Helper function to add spacing
    const addSpacing = (space: number) => {
      yPosition += space;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        addPageNumber();
      }
    };

    // Helper function to add page numbers
    const addPageNumber = () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`${pageCount}`, pageWidth / 2, pageHeight - 36, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };

    // Title Page
    if (projectTitle) {
      doc.setTextColor(102, 102, 102);
      addText(projectTitle, 14, false, 'center');
      addSpacing(20);
      doc.setTextColor(0, 0, 0);
    }

    doc.setTextColor(153, 153, 153);
    addText(`Chapter ${chapterData.moduleNumber}`, 12, false, 'center');
    addSpacing(10);
    doc.setTextColor(0, 0, 0);

    addText(chapterTitle, 24, true, 'center');
    addSpacing(60);

    // Chapter content - use consistent 12pt font for all body text
    const paragraphs = chapterData.content.split('\n\n');
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        // Remove any markdown formatting and use consistent body text
        const cleanText = paragraph.trim().replace(/^#+\s/, '');
        addText(cleanText, 12, false);
        if (index < paragraphs.length - 1) {
          addSpacing(15);
        }
      }
    });

    // Add chapter illustration if available
    if (chapterData.illustrationUrl) {
      try {
        addSpacing(40);

        // Check if there's enough space on current page, otherwise add new page
        const imageHeight = 200;
        if (yPosition + imageHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          addPageNumber();
        }

        // Calculate image dimensions to fit nicely at the bottom
        const maxImageWidth = maxWidth * 0.6; // 60% of page width

        // Center the image horizontally
        const imageX = margin + (maxWidth - maxImageWidth) / 2;

        // Add the image - jsPDF will handle URL fetching in browser context
        doc.addImage(
          chapterData.illustrationUrl,
          'PNG', // Changed from JPEG to PNG as DALL-E returns PNG
          imageX,
          yPosition,
          maxImageWidth,
          imageHeight,
          undefined,
          'FAST'
        );

        yPosition += imageHeight + 20;
      } catch (imageError) {
        console.warn('Failed to add illustration to PDF:', imageError);
        // Continue without the image if there's an error
      }
    }

    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`${i}`, pageWidth / 2, pageHeight - 36, { align: 'center' });
    }

    // Set metadata
    doc.setProperties({
      title: chapterTitle,
      author: intervieweeName || 'Family Story Archive',
      subject: projectTitle ? `${projectTitle} - ${chapterTitle}` : chapterTitle,
    });

    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfArrayBuffer);

    return {
      buffer,
      mimeType: 'application/pdf',
      filename: `${sanitizeFilename(chapterTitle)}.pdf`,
    };
  } catch (error) {
    throw new Error(`Failed to generate chapter PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a PDF document from narrative (legacy support)
 */
export async function generatePDF(data: NarrativeData): Promise<DocumentGeneratorResult> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 72;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left', color: number[] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        let xPosition = margin;
        if (align === 'center') {
          const textWidth = doc.getTextWidth(line);
          xPosition = (pageWidth - textWidth) / 2;
        }

        doc.text(line, xPosition, yPosition);
        yPosition += fontSize * 1.5;
      });

      doc.setTextColor(0, 0, 0);
    };

    const addSpacing = (space: number) => {
      yPosition += space;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title Page
    addText(data.title, 28, true, 'center');
    addSpacing(40);

    if (data.intervieweeName) {
      addText(`The Story of ${data.intervieweeName}`, 16, false, 'center');
      addSpacing(20);
    }

    if (data.createdAt) {
      const dateStr = new Date(data.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      addText(dateStr, 12, false, 'center', [102, 102, 102]);
    }

    // New page
    doc.addPage();
    yPosition = margin;

    // Table of Contents (if chapters exist)
    if (data.structure?.chapters && data.structure.chapters.length > 0) {
      addText('Table of Contents', 20, true, 'center');
      addSpacing(20);

      data.structure.chapters.forEach((chapter) => {
        addText(`• ${chapter.title}`, 12, false);
        addSpacing(5);
      });

      doc.addPage();
      yPosition = margin;
    }

    // Process content - split by chapters if available
    const contentSections = splitContentByChapters(data.content, data.structure?.chapters || []);

    contentSections.forEach((section, index) => {
      if (index > 0) {
        doc.addPage();
        yPosition = margin;
      }

      if (section.title) {
        addText(section.title, 18, true);
        addSpacing(20);
      }

      // Add body text
      const paragraphs = section.content.split('\n\n');
      paragraphs.forEach((paragraph, pIndex) => {
        if (paragraph.trim()) {
          addText(paragraph.trim(), 12, false);
          if (pIndex < paragraphs.length - 1) {
            addSpacing(15);
          }
        }
      });
    });

    // Add page numbers to all pages (except title page)
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`Page ${i - 1}`, pageWidth / 2, pageHeight - 36, { align: 'center' });
    }

    // Set metadata
    doc.setProperties({
      title: data.title,
      author: data.intervieweeName || 'Family Story Archive',
      subject: 'Family Story',
    });

    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfArrayBuffer);

    return {
      buffer,
      mimeType: 'application/pdf',
      filename: `${sanitizeFilename(data.title)}.pdf`,
    };
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
export type { NarrativeData, DocumentGeneratorResult, ModuleChapterData, BookData };
