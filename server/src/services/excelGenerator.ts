import ExcelJS from 'exceljs';
import type { ContentBlock, TableData, ListData, FormData, GenerateRequest } from '../types/converter';

// Regex to detect Urdu/Arabic script characters
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Check if text contains Urdu characters
function containsUrdu(text: string): boolean {
  return URDU_REGEX.test(text);
}

// Font that supports Urdu script — Noto Naskh Arabic has excellent Urdu/Arabic coverage
const URDU_FONT = 'Noto Naskh Arabic';

// Add content block to worksheet
async function addBlocksToWorksheet(
  worksheet: ExcelJS.Worksheet,
  blocks: ContentBlock[],
  startRow: number = 1
): Promise<number> {
  let currentRow = startRow;
  let hasRtlContent = false;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const text = String(block.content);
        const isRtl = containsUrdu(text);
        if (isRtl) hasRtlContent = true;
        const cell = worksheet.getCell(currentRow, 1);
        cell.value = text;
        cell.font = { bold: true, size: 14, name: isRtl ? URDU_FONT : undefined };
        cell.alignment = { horizontal: isRtl ? 'right' : 'left', readingOrder: isRtl ? 'rtl' : 'ltr' };
        currentRow += 2; // Extra spacing after heading
        break;
      }

      case 'paragraph':
      case 'text': {
        const text = String(block.content);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const isRtl = containsUrdu(line);
            if (isRtl) hasRtlContent = true;
            const cell = worksheet.getCell(currentRow, 1);
            cell.value = line;
            cell.font = { size: 11, name: isRtl ? URDU_FONT : undefined };
            cell.alignment = { wrapText: true, vertical: 'top', horizontal: isRtl ? 'right' : 'left', readingOrder: isRtl ? 'rtl' : 'ltr' };
            currentRow++;
          }
        }
        currentRow++; // Spacing between paragraphs
        break;
      }

      case 'table': {
        const tableData = block.content as TableData;
        if (tableData.headers.length > 0 || tableData.rows.length > 0) {
          // Standard thin border for all cells
          const thinBorder: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Track max content length per column for auto-sizing
          const colWidths: number[] = [];

          // Add headers with bold font, light blue fill, centered text, increased row height
          if (tableData.headers.length > 0) {
            const headerRow = worksheet.getRow(currentRow);
            headerRow.height = 28; // Increased row height for headers
            tableData.headers.forEach((header, colIndex) => {
              const isRtl = containsUrdu(header);
              if (isRtl) hasRtlContent = true;
              const cell = headerRow.getCell(colIndex + 1);
              cell.value = header;
              cell.font = { bold: true, size: 12, name: isRtl ? URDU_FONT : 'Calibri' };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD6E4F0' }, // Light blue fill for headers
              };
              cell.border = thinBorder;
              cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
                readingOrder: isRtl ? 'rtl' : 'ltr',
              };
              // Track column width
              const len = header.length;
              colWidths[colIndex] = Math.max(colWidths[colIndex] || 0, len);
            });
            currentRow++;
          }

          // Add data rows with alternating fill colors
          for (let rowIdx = 0; rowIdx < tableData.rows.length; rowIdx++) {
            const rowData = tableData.rows[rowIdx];
            const row = worksheet.getRow(currentRow);
            const isOddRow = rowIdx % 2 === 1;
            const fillColor = isOddRow ? 'FFF5F5F5' : 'FFFFFFFF'; // Alternating white / light gray

            rowData.forEach((cellValue, colIndex) => {
              const isRtl = containsUrdu(cellValue);
              if (isRtl) hasRtlContent = true;
              const cell = row.getCell(colIndex + 1);
              cell.value = cellValue;
              cell.font = { size: 11, name: isRtl ? URDU_FONT : 'Calibri' };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: fillColor },
              };
              cell.border = thinBorder;
              cell.alignment = {
                horizontal: isRtl ? 'right' : 'left',
                vertical: 'middle',
                wrapText: true,
                readingOrder: isRtl ? 'rtl' : 'ltr',
              };
              // Track column width
              const len = cellValue.length;
              colWidths[colIndex] = Math.max(colWidths[colIndex] || 0, len);
            });
            currentRow++;
          }

          // Auto-calculate and set column widths (min 10, max 40)
          colWidths.forEach((len, idx) => {
            const col = worksheet.getColumn(idx + 1);
            // Approximate: each character ~ 1.2 width units, with padding
            const calculatedWidth = Math.min(40, Math.max(10, Math.ceil(len * 1.3) + 2));
            if (!col.width || calculatedWidth > col.width) {
              col.width = calculatedWidth;
            }
          });

          currentRow++; // Spacing after table
        }
        break;
      }

      case 'list': {
        const listData = block.content as ListData;
        listData.items.forEach((item, index) => {
          const prefix = listData.ordered ? `${index + 1}. ` : '• ';
          const isRtl = containsUrdu(item);
          if (isRtl) hasRtlContent = true;
          const cell = worksheet.getCell(currentRow, 1);
          cell.value = `${prefix}${item}`;
          cell.font = { size: 11, name: isRtl ? URDU_FONT : undefined };
          cell.alignment = { horizontal: isRtl ? 'right' : 'left', readingOrder: isRtl ? 'rtl' : 'ltr', indent: 1 };
          currentRow++;
        });
        currentRow++; // Spacing after list
        break;
      }

      case 'form': {
        const formData = block.content as FormData;
        for (const entry of formData.entries) {
          const isRtlKey = containsUrdu(entry.key);
          const isRtlValue = containsUrdu(entry.value);
          if (isRtlKey || isRtlValue) hasRtlContent = true;

          const keyCell = worksheet.getCell(currentRow, 1);
          keyCell.value = entry.key;
          keyCell.font = { bold: true, size: 11, name: isRtlKey ? URDU_FONT : undefined };
          keyCell.alignment = { horizontal: isRtlKey ? 'right' : 'left', readingOrder: isRtlKey ? 'rtl' : 'ltr' };

          const valueCell = worksheet.getCell(currentRow, 2);
          valueCell.value = entry.value;
          valueCell.font = { size: 11, name: isRtlValue ? URDU_FONT : undefined };
          valueCell.alignment = { horizontal: isRtlValue ? 'right' : 'left', readingOrder: isRtlValue ? 'rtl' : 'ltr' };

          currentRow++;
        }
        currentRow++; // Spacing after form
        break;
      }
    }
  }

  // If any RTL content was found, set the worksheet views to RTL mode
  if (hasRtlContent) {
    worksheet.views = [{ state: 'frozen', ySplit: 0, rightToLeft: true }];
  }

  return currentRow;
}

export async function generateExcel(data: GenerateRequest): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart Image Converter';
  workbook.created = new Date();

  const { content, options } = data;

  if (content.length === 0) {
    // Create empty sheet if no content
    const worksheet = workbook.addWorksheet('Empty');
    worksheet.getCell(1, 1).value = 'No content extracted';
  } else if (content.length === 1) {
    // Single image - use one sheet
    const item = content[0];
    const sheetName = item.originalName.replace(/\.[^.]+$/, '').substring(0, 31); // Excel limit
    const worksheet = workbook.addWorksheet(sheetName);

    // Set column widths
    worksheet.getColumn(1).width = 50;
    worksheet.getColumn(2).width = 30;

    await addBlocksToWorksheet(worksheet, item.blocks);
  } else {
    // Multiple images - create separate sheets or combined
    // First, try a summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.getColumn(1).width = 10;
    summarySheet.getColumn(2).width = 40;
    summarySheet.getColumn(3).width = 20;

    const headerRow = summarySheet.getRow(1);
    ['Order', 'Image Name', 'Content Blocks'].forEach((header, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
    });

    content.forEach((item, index) => {
      const row = summarySheet.getRow(index + 2);
      row.getCell(1).value = index + 1;
      row.getCell(2).value = item.originalName;
      row.getCell(3).value = item.blocks.length;
    });

    // Then individual sheets for each image
    for (const item of content) {
      let sheetName = item.originalName.replace(/\.[^.]+$/, '').substring(0, 31);
      // Ensure unique sheet names
      let counter = 1;
      while (workbook.getWorksheet(sheetName)) {
        sheetName = `${sheetName.substring(0, 28)}_${counter++}`;
      }

      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.getColumn(1).width = 50;
      worksheet.getColumn(2).width = 30;

      await addBlocksToWorksheet(worksheet, item.blocks);
    }
  }

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
