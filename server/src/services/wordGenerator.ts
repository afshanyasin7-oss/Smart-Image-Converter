import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';
import type { ContentBlock, TableData, ListData, FormData, GenerateRequest } from '../types/converter';

// Regex to detect Urdu/Arabic script characters
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Check if text contains Urdu characters
function containsUrdu(text: string): boolean {
  return URDU_REGEX.test(text);
}

// Font that supports Urdu script — Noto Naskh Arabic has excellent Urdu/Arabic coverage
const URDU_FONT = 'Noto Naskh Arabic';

// Convert content blocks to docx paragraphs/tables
function blocksToDocxElements(blocks: ContentBlock[]): Array<Paragraph | Table> {
  const elements: Array<Paragraph | Table> = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const text = String(block.content);
        const isRtl = containsUrdu(text);
        elements.push(
          new Paragraph({
            children: [new TextRun({
              text,
              size: 32, // 16pt for heading
              font: isRtl ? URDU_FONT : undefined,
              rightToLeft: isRtl,
            })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRtl,
          })
        );
        break;
      }

      case 'paragraph': {
        const text = String(block.content);
        const lines = text.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const isRtl = containsUrdu(line);
          elements.push(
            new Paragraph({
              children: [new TextRun({
                text: line,
                size: 22, // 11pt
                font: isRtl ? URDU_FONT : undefined,
                rightToLeft: isRtl,
              })],
              spacing: { after: 120 },
              alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
              bidirectional: isRtl,
            })
          );
        }
        elements.push(new Paragraph({ spacing: { after: 120 } })); // Extra spacing
        break;
      }

      case 'text': {
        const text = String(block.content);
        const isRtl = containsUrdu(text);
        elements.push(
          new Paragraph({
            children: [new TextRun({
              text,
              size: 22,
              font: isRtl ? URDU_FONT : undefined,
              rightToLeft: isRtl,
            })],
            spacing: { after: 120 },
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRtl,
          })
        );
        break;
      }

      case 'table': {
        const tableData = block.content as TableData;
        if (tableData.headers.length > 0 || tableData.rows.length > 0) {
          // Check if entire table has Urdu content
          const allTableText = [...tableData.headers, ...tableData.rows.flat()].join(' ');
          const isRtlTable = containsUrdu(allTableText);

          const rows: TableRow[] = [];

          // Standard border style for all cells — visible 1pt solid borders
          const cellBorders = {
            top: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
          };

          // Header row with bold text, larger font, light blue background, center alignment
          if (tableData.headers.length > 0) {
            rows.push(
              new TableRow({
                children: tableData.headers.map(
                  (header) => {
                    const isRtl = containsUrdu(header);
                    return new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({
                            text: header,
                            bold: true,
                            size: 24, // 12pt — slightly larger for headers
                            font: isRtl ? URDU_FONT : 'Calibri',
                            rightToLeft: isRtl,
                          })],
                          alignment: AlignmentType.CENTER,
                          bidirectional: isRtl,
                        }),
                      ],
                      shading: { fill: 'E8F0FE' }, // Light blue tint for header
                      borders: cellBorders,
                      margins: {
                        top: convertInchesToTwip(0.04),
                        bottom: convertInchesToTwip(0.04),
                        left: convertInchesToTwip(0.06),
                        right: convertInchesToTwip(0.06),
                      },
                    });
                  }
                ),
                tableHeader: true,
              })
            );
          }

          // Data rows with alternating background colors
          for (let rowIdx = 0; rowIdx < tableData.rows.length; rowIdx++) {
            const rowData = tableData.rows[rowIdx];
            const isOddRow = rowIdx % 2 === 1;
            const rowFill = isOddRow ? 'F5F5F5' : 'FFFFFF'; // Alternating white / light gray

            rows.push(
              new TableRow({
                children: rowData.map(
                  (cellText) => {
                    const isRtl = containsUrdu(cellText);
                    return new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({
                            text: cellText,
                            size: 22, // 11pt
                            font: isRtl ? URDU_FONT : 'Calibri',
                            rightToLeft: isRtl,
                          })],
                          alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                          bidirectional: isRtl,
                        }),
                      ],
                      shading: { fill: rowFill },
                      borders: cellBorders,
                      margins: {
                        top: convertInchesToTwip(0.03),
                        bottom: convertInchesToTwip(0.03),
                        left: convertInchesToTwip(0.06),
                        right: convertInchesToTwip(0.06),
                      },
                    });
                  }
                ),
              })
            );
          }

          if (rows.length > 0) {
            elements.push(
              new Table({
                rows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
            );
            elements.push(new Paragraph({ spacing: { after: 200 } })); // Spacing after table
          }
        }
        break;
      }

      case 'list': {
        const listData = block.content as ListData;
        listData.items.forEach((item, index) => {
          const prefix = listData.ordered ? `${index + 1}. ` : '• ';
          const isRtl = containsUrdu(item);
          elements.push(
            new Paragraph({
              children: [new TextRun({
                text: `${prefix}${item}`,
                size: 22,
                font: isRtl ? URDU_FONT : undefined,
                rightToLeft: isRtl,
              })],
              indent: { left: isRtl ? undefined : convertInchesToTwip(0.5), right: isRtl ? convertInchesToTwip(0.5) : undefined },
              spacing: { after: 60 },
              alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
              bidirectional: isRtl,
            })
          );
        });
        elements.push(new Paragraph({ spacing: { after: 120 } })); // Spacing after list
        break;
      }

      case 'form': {
        const formData = block.content as FormData;
        for (const entry of formData.entries) {
          const isRtlKey = containsUrdu(entry.key);
          const isRtlValue = containsUrdu(entry.value);
          const isRtl = isRtlKey || isRtlValue;
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${entry.key}: `,
                  bold: true,
                  size: 22,
                  font: isRtlKey ? URDU_FONT : undefined,
                  rightToLeft: isRtlKey,
                }),
                new TextRun({
                  text: entry.value,
                  size: 22,
                  font: isRtlValue ? URDU_FONT : undefined,
                  rightToLeft: isRtlValue,
                }),
              ],
              spacing: { after: 60 },
              alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
              bidirectional: isRtl,
            })
          );
        }
        elements.push(new Paragraph({ spacing: { after: 120 } })); // Spacing after form
        break;
      }
    }
  }

  return elements;
}

export async function generateWord(data: GenerateRequest): Promise<Buffer> {
  const { content, options } = data;
  const sections: Array<{ properties?: object; children: Array<Paragraph | Table> }> = [];

  if (content.length === 0) {
    sections.push({
      children: [
        new Paragraph({
          text: 'No content extracted',
          alignment: AlignmentType.CENTER,
        }),
      ],
    });
  } else if (content.length === 1) {
    // Single image - one section
    const item = content[0];
    const children = blocksToDocxElements(item.blocks);

    // Add title if provided
    if (options?.title) {
      children.unshift(
        new Paragraph({
          text: options.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    sections.push({ children });
  } else {
    // Multiple images - add page breaks between them
    const allChildren: Array<Paragraph | Table> = [];

    // Optional title
    if (options?.title) {
      allChildren.push(
        new Paragraph({
          text: options.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    content.forEach((item, index) => {
      // Add image name as heading
      allChildren.push(
        new Paragraph({
          text: item.originalName,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: index > 0 ? 400 : 200, after: 200 },
        })
      );

      // Add content blocks
      const elements = blocksToDocxElements(item.blocks);
      allChildren.push(...elements);

      // Add page break except for last item
      if (index < content.length - 1) {
        allChildren.push(
          new Paragraph({
            children: [new TextRun({ break: 1 })],
            pageBreakBefore: true,
          })
        );
      }
    });

    sections.push({ children: allChildren });
  }

  const doc = new Document({
    creator: 'Smart Image Converter',
    title: options?.title || 'Extracted Content',
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
