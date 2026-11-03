import { useRef, useState, useCallback, useEffect } from 'react';
import { FileImage, Table as TableIcon, List, Type, AlignLeft, Eye, EyeOff, AlertTriangle, Undo2, Redo2, Keyboard } from 'lucide-react';
import { Card, Button, Alert } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { ImageExtractionResult, ContentBlock, TableData, ListData, FormData } from '@/types/converter';

// Regex to detect Urdu/Arabic script characters
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Helper to check if text contains Urdu characters
function containsUrdu(text: string): boolean {
  return URDU_REGEX.test(text);
}

interface ContentPreviewProps {
  results: ImageExtractionResult[];
  onUpdateBlock: (resultIndex: number, blockIndex: number, content: ContentBlock['content']) => void;
  className?: string;
}

// Common Urdu characters that are often misrecognized - for character palette
const URDU_CHAR_PALETTE = [
  { char: 'ک', name: 'kaf', shortcut: '1' },
  { char: 'گ', name: 'gaf', shortcut: '2' },
  { char: 'ہ', name: 'gol heh', shortcut: '3' },
  { char: 'ھ', name: 'doachashmee heh', shortcut: '4' },
  { char: 'ی', name: 'choti ye', shortcut: '5' },
  { char: 'ے', name: 'bari ye', shortcut: '6' },
  { char: 'ں', name: 'noon ghunna', shortcut: '7' },
  { char: 'ڑ', name: 'rre', shortcut: '8' },
  { char: 'ڈ', name: 'ddal', shortcut: '9' },
  { char: 'ژ', name: 'zhe', shortcut: '0' },
];

// Undo/Redo history interface
interface EditHistory {
  data: TableData;
  timestamp: number;
}

// Render and edit table content
function TableEditor({
  data,
  onChange,
}: {
  data: TableData;
  onChange: (data: TableData) => void;
}) {
  const isComposing = useRef(false);
  const [showRawText, setShowRawText] = useState(false);
  const [showCharPalette, setShowCharPalette] = useState(false);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<EditHistory[]>([{ data, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateHeader = (index: number, value: string) => {
    if (isComposing.current) return;
    const newHeaders = [...data.headers];
    newHeaders[index] = value;
    const newData = { ...data, headers: newHeaders };
    addToHistory(newData);
    onChange(newData);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (isComposing.current) return;
    const newRows = data.rows.map((row, i) =>
      i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row
    );
    const newData = { ...data, rows: newRows };
    addToHistory(newData);
    onChange(newData);
  };

  // Add to undo history
  const addToHistory = useCallback((newData: TableData) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ data: newData, timestamp: Date.now() });
      // Limit history size
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].data);
    }
  }, [historyIndex, history, onChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].data);
    }
  }, [historyIndex, history, onChange]);

  // Insert character at cursor position
  const insertCharacter = useCallback((char: string) => {
    if (focusedCell === null) return;
    const { row, col } = focusedCell;

    if (row === -1) {
      // Header
      const currentValue = data.headers[col];
      const newValue = currentValue + char;
      updateHeader(col, newValue);
    } else {
      // Data cell
      const currentValue = data.rows[row][col];
      const newValue = currentValue + char;
      updateCell(row, col, newValue);
    }
  }, [focusedCell, data, updateHeader, updateCell]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Ctrl+1 through Ctrl+0 for Urdu character shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key >= '0' && e.key <= '9') {
        const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
        if (index < URDU_CHAR_PALETTE.length) {
          e.preventDefault();
          insertCharacter(URDU_CHAR_PALETTE[index].char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, insertCharacter]);

  // Check if entire table contains Urdu content
  const allText = [...data.headers, ...data.rows.flat()].join(' ');
  const isRtlTable = containsUrdu(allText);

  // Calculate overall confidence
  const cellConfidences = data.cellConfidence?.flat() || [];
  const avgConfidence = cellConfidences.length > 0
    ? cellConfidences.reduce((sum, c) => sum + c, 0) / cellConfidences.length
    : 100;
  const lowConfidenceCount = cellConfidences.filter(c => c < 50).length;
  const needsReview = avgConfidence < 60 || lowConfidenceCount > 0;

  // Generate raw OCR text representation from table data
  const rawOcrText = [
    data.headers.join('\t'),
    ...data.rows.map(row => row.join('\t')),
  ].join('\n');

  // Low confidence threshold for highlighting unclear cells
  const LOW_CONFIDENCE_THRESHOLD = 50;

  return (
    <div
      className="space-y-4"
      data-icod-id="src_components_contentpreview_tsx_4ea3">
      {/* Warning banner for low confidence */}
      {needsReview && (
        <Alert variant="warning" data-icod-id="src_components_contentpreview_tsx_227d">
          <div
            className="flex items-start gap-2"
            data-icod-id="src_components_contentpreview_tsx_70e7">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              data-icod-id="src_components_contentpreview_tsx_338a" />
            <div data-icod-id="src_components_contentpreview_tsx_4cea">
              <p
                className="font-medium"
                data-icod-id="src_components_contentpreview_tsx_6f66">Low confidence — please review</p>
              <p
                className="text-sm font-urdu"
                dir="rtl"
                data-icod-id="src_components_contentpreview_tsx_af92">
                کم اعتماد - براہ کرم جائزہ لیں
              </p>
              <p
                className="mt-1 text-xs opacity-80"
                data-icod-id="src_components_contentpreview_tsx_42f1">
                {lowConfidenceCount} cell{lowConfidenceCount !== 1 ? 's' : ''} with confidence below {LOW_CONFIDENCE_THRESHOLD}%
              </p>
            </div>
          </div>
        </Alert>
      )}
      {/* Toolbar with undo/redo and character palette toggle */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.04] pb-4"
        data-icod-id="src_components_contentpreview_tsx_d66d">
        <div
          className="flex items-center gap-1"
          data-icod-id="src_components_contentpreview_tsx_0b20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            data-icod-id="src_components_contentpreview_tsx_2a21">
            <Undo2
              className="mr-1.5 h-3.5 w-3.5"
              data-icod-id="src_components_contentpreview_tsx_f7e1" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            data-icod-id="src_components_contentpreview_tsx_19a7">
            <Redo2
              className="mr-1.5 h-3.5 w-3.5"
              data-icod-id="src_components_contentpreview_tsx_a922" />
            Redo
          </Button>
        </div>

        <div
          className="flex items-center gap-1"
          data-icod-id="src_components_contentpreview_tsx_0f2f">
          {isRtlTable && (
            <Button
              variant={showCharPalette ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowCharPalette(!showCharPalette)}
              title="Show Urdu character palette"
              data-icod-id="src_components_contentpreview_tsx_105b">
              <Keyboard
                className="mr-1.5 h-3.5 w-3.5"
                data-icod-id="src_components_contentpreview_tsx_1149" />
              Character Palette
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawText(!showRawText)}
            data-icod-id="src_components_contentpreview_tsx_480e">
            {showRawText ? (
              <>
                <EyeOff
                  className="mr-1.5 h-3.5 w-3.5"
                  data-icod-id="src_components_contentpreview_tsx_ca2c" />
                Hide Raw OCR
              </>
            ) : (
              <>
                <Eye
                  className="mr-1.5 h-3.5 w-3.5"
                  data-icod-id="src_components_contentpreview_tsx_b671" />
                Show Raw OCR
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Urdu Character Palette */}
      {showCharPalette && isRtlTable && (
        <Card className="p-4" data-icod-id="src_components_contentpreview_tsx_5eee">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            data-icod-id="src_components_contentpreview_tsx_35ec">
            Urdu Characters (or press Ctrl+number)
          </p>
          <div
            className="flex flex-wrap gap-2"
            data-icod-id="src_components_contentpreview_tsx_13e7">
            {URDU_CHAR_PALETTE.map(({ char, name, shortcut }) => (
              <button
                key={char}
                type="button"
                onClick={() => insertCharacter(char)}
                className={cn(
                  'flex h-11 min-w-[3.5rem] flex-col items-center justify-center rounded-lg border border-black/[0.06] bg-white px-2 shadow-ambient',
                  'hover:border-primary/30 hover:bg-accent transition-all duration-300',
                  'font-urdu text-lg'
                )}
                title={`Insert ${name} (Ctrl+${shortcut})`}
                data-icod-id={`src_components_contentpreview_tsx_157b_${char}`}>
                <span dir="rtl" data-icod-id={`src_components_contentpreview_tsx_9640_${char}`}>{char}</span>
                <span
                  className="text-[10px] text-muted-foreground"
                  data-icod-id={`src_components_contentpreview_tsx_e894_${char}`}>Ctrl+{shortcut}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      {/* Raw OCR Text display */}
      {showRawText && (
        <div
          className="rounded-lg border border-black/[0.06] bg-muted/30 p-4"
          data-icod-id="src_components_contentpreview_tsx_5bc5">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            data-icod-id="src_components_contentpreview_tsx_f3a1">
            Raw OCR Output
          </p>
          <pre
            className={cn(
              'whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground',
              isRtlTable && 'font-urdu text-right text-base'
            )}
            dir={isRtlTable ? 'rtl' : undefined}
            lang={isRtlTable ? 'ur' : undefined}
            data-icod-id="src_components_contentpreview_tsx_fd1c">
            {rawOcrText}
          </pre>
        </div>
      )}
      <div
        className="overflow-x-auto rounded-lg border border-black/[0.06]"
        dir={isRtlTable ? 'rtl' : undefined}
        lang={isRtlTable ? 'ur' : undefined}
        data-icod-id="src_components_contentpreview_tsx_22d1">
        <table
          className={cn(
            'w-full border-collapse text-sm',
            isRtlTable && 'font-urdu text-base'
          )}
          data-icod-id="src_components_contentpreview_tsx_52e9">
          <thead data-icod-id="src_components_contentpreview_tsx_543c">
            <tr
              className="border-b border-black/[0.08] bg-muted/40"
              data-icod-id="src_components_contentpreview_tsx_852c">
              {/* Row number gutter header */}
              <th
                className="w-10 border-r border-black/[0.06] px-2 py-3 text-center text-xs font-medium text-muted-foreground"
                data-icod-id="src_components_contentpreview_tsx_0398">
                #
              </th>
              {data.headers.map((header, i) => {
                const isRtl = containsUrdu(header) || isRtlTable;
                return (
                  <th
                    key={i}
                    className="border-r border-black/[0.06] px-3 py-3 text-left font-medium text-foreground last:border-r-0"
                    dir={isRtl ? 'rtl' : undefined}
                    lang={isRtl ? 'ur' : undefined}
                    data-icod-id={`src_components_contentpreview_tsx_d420_${i}`}>
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      onFocus={() => setFocusedCell({ row: -1, col: i })}
                      onCompositionStart={() => { isComposing.current = true; }}
                      onCompositionEnd={(e) => {
                        isComposing.current = false;
                        const target = e.target as HTMLInputElement;
                        updateHeader(i, target.value);
                      }}
                      dir={isRtl ? 'rtl' : undefined}
                      lang={isRtl ? 'ur' : undefined}
                      inputMode="text"
                      className={cn(inputClass(), 'w-full border-0 bg-transparent p-0 text-left font-medium focus:ring-0', isRtl && 'text-right font-urdu text-base')}
                      data-icod-id={`src_components_contentpreview_tsx_3e91_${i}`} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody data-icod-id="src_components_contentpreview_tsx_30a7">
            {data.rows.map((row, rowIndex) => {
              return (
                <tr
                  key={rowIndex}
                  className="border-b border-black/[0.04] transition-colors last:border-b-0 hover:bg-muted/20"
                  data-icod-id={`src_components_contentpreview_tsx_862b_${rowIndex}`}>
                  {/* Row number gutter */}
                  <td
                    className="border-r border-black/[0.06] px-2 py-2.5 text-center text-xs tabular-nums text-muted-foreground"
                    data-icod-id={`src_components_contentpreview_tsx_ba7c_${rowIndex}`}>
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, colIndex) => {
                    const isRtl = containsUrdu(cell) || isRtlTable;
                    // Check if this cell has low confidence
                    const cellConf = data.cellConfidence?.[rowIndex]?.[colIndex];
                    const isLowConfidence = cellConf !== undefined && cellConf < LOW_CONFIDENCE_THRESHOLD;
                    const isVeryLowConfidence = cellConf !== undefined && cellConf < 30;
                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          'border-r border-black/[0.06] px-3 py-2.5 last:border-r-0',
                          isLowConfidence && 'bg-warning/[0.08]',
                          isVeryLowConfidence && 'bg-destructive/[0.08]'
                        )}
                        dir={isRtl ? 'rtl' : undefined}
                        lang={isRtl ? 'ur' : undefined}
                        title={isLowConfidence ? `Low confidence (${cellConf?.toFixed(0)}%) — please verify` : undefined}
                        data-icod-id={`src_components_contentpreview_tsx_32c4_${rowIndex}_${colIndex}`}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                          onCompositionStart={() => { isComposing.current = true; }}
                          onCompositionEnd={(e) => {
                            isComposing.current = false;
                            const target = e.target as HTMLInputElement;
                            updateCell(rowIndex, colIndex, target.value);
                          }}
                          dir={isRtl ? 'rtl' : undefined}
                          lang={isRtl ? 'ur' : undefined}
                          inputMode="text"
                          className={cn(
                            inputClass(),
                            'w-full border-0 bg-transparent p-0 focus:ring-0',
                            isRtl && 'text-right font-urdu text-base',
                            isLowConfidence && 'bg-transparent'
                          )}
                          data-icod-id={`src_components_contentpreview_tsx_680d_${rowIndex}_${colIndex}`} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Confidence summary footer */}
      {data.cellConfidence && (
        <div
          className="flex items-center justify-between border-t border-black/[0.04] pt-4 text-xs text-muted-foreground"
          data-icod-id="src_components_contentpreview_tsx_2586">
          <span data-icod-id="src_components_contentpreview_tsx_f536">
            Average confidence: {avgConfidence.toFixed(0)}%
          </span>
          {lowConfidenceCount > 0 && (
            <span
              className="text-warning"
              data-icod-id="src_components_contentpreview_tsx_6e85">
              {lowConfidenceCount} cell{lowConfidenceCount !== 1 ? 's' : ''} need review
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Render and edit list content
function ListEditor({
  data,
  onChange,
}: {
  data: ListData;
  onChange: (data: ListData) => void;
}) {
  const isComposing = useRef(false);

  const updateItem = (index: number, value: string) => {
    if (isComposing.current) return;
    const newItems = [...data.items];
    newItems[index] = value;
    onChange({ ...data, items: newItems });
  };

  // Check if entire list contains Urdu content
  const allText = data.items.join(' ');
  const isRtlList = containsUrdu(allText);

  return (
    <div
      className="space-y-3"
      dir={isRtlList ? 'rtl' : undefined}
      lang={isRtlList ? 'ur' : undefined}
      data-icod-id="src_components_contentpreview_tsx_daf9">
      {data.items.map((item, index) => {
        const isRtl = containsUrdu(item) || isRtlList;
        return (
          <div
            key={index}
            className={cn('flex items-start gap-3', isRtl && 'flex-row-reverse')}
            data-icod-id={`src_components_contentpreview_tsx_0e47_${index}`}>
            <span
              className={cn('mt-2.5 min-w-[1.5rem] text-sm text-muted-foreground', isRtl && 'text-right')}
              data-icod-id={`src_components_contentpreview_tsx_42a7_${index}`}>
              {data.ordered ? `${index + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              onCompositionStart={() => { isComposing.current = true; }}
              onCompositionEnd={(e) => {
                isComposing.current = false;
                const target = e.target as HTMLInputElement;
                updateItem(index, target.value);
              }}
              dir={isRtl ? 'rtl' : undefined}
              lang={isRtl ? 'ur' : undefined}
              inputMode="text"
              className={cn(inputClass(), 'flex-1', isRtl && 'text-right font-urdu')}
              data-icod-id={`src_components_contentpreview_tsx_5171_${index}`} />
          </div>
        );
      })}
    </div>
  );
}

// Render and edit form content
function FormEditor({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (data: FormData) => void;
}) {
  const isComposing = useRef(false);

  const updateEntry = (index: number, field: 'key' | 'value', val: string) => {
    if (isComposing.current) return;
    const newEntries = data.entries.map((entry, i) =>
      i === index ? { ...entry, [field]: val } : entry
    );
    onChange({ ...data, entries: newEntries });
  };

  // Check if entire form contains Urdu content
  const allText = data.entries.map(e => `${e.key} ${e.value}`).join(' ');
  const isRtlForm = containsUrdu(allText);

  return (
    <div
      className="space-y-3"
      dir={isRtlForm ? 'rtl' : undefined}
      lang={isRtlForm ? 'ur' : undefined}
      data-icod-id="src_components_contentpreview_tsx_fa56">
      {data.entries.map((entry, index) => {
        const isRtlKey = containsUrdu(entry.key) || isRtlForm;
        const isRtlValue = containsUrdu(entry.value) || isRtlForm;
        const isRtl = isRtlKey || isRtlValue;
        return (
          <div
            key={index}
            className={cn('flex gap-3', isRtl && 'flex-row-reverse')}
            data-icod-id={`src_components_contentpreview_tsx_fc8f_${index}`}>
            <input
              type="text"
              value={entry.key}
              onChange={(e) => updateEntry(index, 'key', e.target.value)}
              onCompositionStart={() => { isComposing.current = true; }}
              onCompositionEnd={(e) => {
                isComposing.current = false;
                const target = e.target as HTMLInputElement;
                updateEntry(index, 'key', target.value);
              }}
              dir={isRtlKey ? 'rtl' : undefined}
              lang={isRtlKey ? 'ur' : undefined}
              inputMode="text"
              className={cn(inputClass(), 'w-1/3 font-medium', isRtlKey && 'text-right font-urdu')}
              data-icod-id={`src_components_contentpreview_tsx_41d5_${index}`} />
            <span
              className={cn('self-center text-muted-foreground', isRtl && 'order-first')}
              data-icod-id={`src_components_contentpreview_tsx_c8d6_${index}`}>:</span>
            <input
              type="text"
              value={entry.value}
              onChange={(e) => updateEntry(index, 'value', e.target.value)}
              onCompositionStart={() => { isComposing.current = true; }}
              onCompositionEnd={(e) => {
                isComposing.current = false;
                const target = e.target as HTMLInputElement;
                updateEntry(index, 'value', target.value);
              }}
              dir={isRtlValue ? 'rtl' : undefined}
              lang={isRtlValue ? 'ur' : undefined}
              inputMode="text"
              className={cn(inputClass(), 'flex-1', isRtlValue && 'text-right font-urdu')}
              data-icod-id={`src_components_contentpreview_tsx_ea96_${index}`} />
          </div>
        );
      })}
    </div>
  );
}

// Render and edit text/paragraph content
function TextEditor({
  content,
  onChange,
  multiline = false,
}: {
  content: string;
  onChange: (content: string) => void;
  multiline?: boolean;
}) {
  const isComposing = useRef(false);
  const isRtl = containsUrdu(content);

  const handleChange = (value: string) => {
    if (isComposing.current) return;
    onChange(value);
  };

  if (multiline) {
    return (
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={(e) => {
          isComposing.current = false;
          const target = e.target as HTMLTextAreaElement;
          onChange(target.value);
        }}
        rows={4}
        dir={isRtl ? 'rtl' : undefined}
        lang={isRtl ? 'ur' : undefined}
        inputMode="text"
        className={cn(inputClass(), 'w-full resize-y leading-relaxed', isRtl && 'text-right font-urdu')}
        data-icod-id="src_components_contentpreview_tsx_078d" />
    );
  }

  return (
    <input
      type="text"
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={(e) => {
        isComposing.current = false;
        const target = e.target as HTMLInputElement;
        onChange(target.value);
      }}
      dir={isRtl ? 'rtl' : undefined}
      lang={isRtl ? 'ur' : undefined}
      inputMode="text"
      className={cn(inputClass(), 'w-full', isRtl && 'text-right font-urdu')}
      data-icod-id="src_components_contentpreview_tsx_d0f9" />
  );
}

// Block type icon
function BlockIcon({ type }: { type: ContentBlock['type'] }) {
  switch (type) {
    case 'heading':
      return (
        <Type
          className="h-3.5 w-3.5"
          data-icod-id="src_components_contentpreview_tsx_1548" />
      );
    case 'table':
      return (
        <TableIcon
          className="h-3.5 w-3.5"
          data-icod-id="src_components_contentpreview_tsx_17c5" />
      );
    case 'list':
      return (
        <List
          className="h-3.5 w-3.5"
          data-icod-id="src_components_contentpreview_tsx_19af" />
      );
    case 'paragraph':
      return (
        <AlignLeft
          className="h-3.5 w-3.5"
          data-icod-id="src_components_contentpreview_tsx_cbac" />
      );
    default:
      return (
        <Type
          className="h-3.5 w-3.5"
          data-icod-id="src_components_contentpreview_tsx_aa63" />
      );
  }
}

export default function ContentPreview({
  results,
  onUpdateBlock,
  className,
}: ContentPreviewProps) {
  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    return (
      <Card
        className={cn('p-10 text-center', className)}
        data-icod-id="src_components_contentpreview_tsx_2e39">
        <p
          className="text-muted-foreground"
          data-icod-id="src_components_contentpreview_tsx_9d1f">No content was successfully extracted.</p>
      </Card>
    );
  }

  return (
    <div
      className={cn('space-y-8', className)}
      data-icod-id="src_components_contentpreview_tsx_966e">
      {successfulResults.map((result, resultIndex) => (
        <Card
          key={result.imageId}
          className="overflow-hidden"
          data-icod-id={`src_components_contentpreview_tsx_3396_${result.imageId}`}>
          {/* Image header */}
          <div
            className="flex items-center gap-4 border-b border-black/[0.04] bg-muted/20 px-6 py-5"
            data-icod-id={`src_components_contentpreview_tsx_1a83_${result.imageId}`}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.06] bg-white"
              data-icod-id={`src_components_contentpreview_tsx_2baa_${result.imageId}`}>
              <FileImage
                className="h-5 w-5 text-muted-foreground"
                data-icod-id={`src_components_contentpreview_tsx_4986_${result.imageId}`} />
            </div>
            <div data-icod-id={`src_components_contentpreview_tsx_51c7_${result.imageId}`}>
              <h3
                className="font-medium text-foreground"
                data-icod-id={`src_components_contentpreview_tsx_3a70_${result.imageId}`}>{result.originalName}</h3>
              <p
                className="text-xs text-muted-foreground"
                data-icod-id={`src_components_contentpreview_tsx_6aee_${result.imageId}`}>
                {result.blocks.length} content block{result.blocks.length !== 1 ? 's' : ''} extracted
              </p>
            </div>
          </div>

          {/* Content blocks */}
          <div
            className="space-y-6 p-6"
            data-icod-id={`src_components_contentpreview_tsx_5f49_${result.imageId}`}>
            {result.blocks.map((block, blockIndex) => (
              <div
                key={blockIndex}
                className="space-y-3"
                data-icod-id={`src_components_contentpreview_tsx_8015_${result.imageId}_${blockIndex}`}>
                <div
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id={`src_components_contentpreview_tsx_2090_${result.imageId}_${blockIndex}`}>
                  <BlockIcon
                    type={block.type}
                    data-icod-id={`src_components_contentpreview_tsx_6e30_${result.imageId}_${blockIndex}`} />
                  <span
                    data-icod-id={`src_components_contentpreview_tsx_ae89_${result.imageId}_${blockIndex}`}>{block.type}</span>
                </div>

                <div
                  className="rounded-lg border border-black/[0.06] bg-muted/20 p-4"
                  data-icod-id={`src_components_contentpreview_tsx_9469_${result.imageId}_${blockIndex}`}>
                  {block.type === 'table' && (
                    <TableEditor
                      data={block.content as TableData}
                      onChange={(newData) => onUpdateBlock(resultIndex, blockIndex, newData)}
                      data-icod-id={`src_components_contentpreview_tsx_5ac3_${result.imageId}_${blockIndex}`} />
                  )}

                  {block.type === 'list' && (
                    <ListEditor
                      data={block.content as ListData}
                      onChange={(newData) => onUpdateBlock(resultIndex, blockIndex, newData)}
                      data-icod-id={`src_components_contentpreview_tsx_dd9f_${result.imageId}_${blockIndex}`} />
                  )}

                  {block.type === 'form' && (
                    <FormEditor
                      data={block.content as FormData}
                      onChange={(newData) => onUpdateBlock(resultIndex, blockIndex, newData)}
                      data-icod-id={`src_components_contentpreview_tsx_dd1e_${result.imageId}_${blockIndex}`} />
                  )}

                  {(block.type === 'heading' || block.type === 'text') && (
                    <TextEditor
                      content={String(block.content)}
                      onChange={(newContent) => onUpdateBlock(resultIndex, blockIndex, newContent)}
                      data-icod-id={`src_components_contentpreview_tsx_b121_${result.imageId}_${blockIndex}`} />
                  )}

                  {block.type === 'paragraph' && (
                    <TextEditor
                      content={String(block.content)}
                      onChange={(newContent) => onUpdateBlock(resultIndex, blockIndex, newContent)}
                      multiline
                      data-icod-id={`src_components_contentpreview_tsx_7089_${result.imageId}_${blockIndex}`} />
                  )}
                </div>
              </div>
            ))}

            {result.blocks.length === 0 && (
              <p
                className="py-6 text-center text-sm text-muted-foreground"
                data-icod-id={`src_components_contentpreview_tsx_49c6_${result.imageId}`}>
                No content detected in this image
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
