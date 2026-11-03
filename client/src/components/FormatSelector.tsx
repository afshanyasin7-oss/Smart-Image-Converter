import { FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { OutputFormat } from '@/types/converter';

interface FormatOption {
  id: OutputFormat;
  label: string;
  description: string;
  icon: typeof FileSpreadsheet;
}

const formats: FormatOption[] = [
  {
    id: 'xlsx',
    label: 'Microsoft Excel (.xlsx)',
    description: 'Best for tables, spreadsheets, and structured data',
    icon: FileSpreadsheet,
  },
  {
    id: 'docx',
    label: 'Microsoft Word (.docx)',
    description: 'Best for documents, reports, and formatted text',
    icon: FileText,
  },
];

interface FormatSelectorProps {
  selected: OutputFormat | null;
  onSelect: (format: OutputFormat) => void;
  className?: string;
}

export default function FormatSelector({
  selected,
  onSelect,
  className,
}: FormatSelectorProps) {
  return (
    <div
      className={cn('grid gap-5 sm:grid-cols-2', className)}
      data-icod-id="src_components_formatselector_tsx_c17f">
      {formats.map((format) => {
        const isSelected = selected === format.id;
        const Icon = format.icon;

        return (
          <Card
            key={format.id}
            className={cn(
              'cursor-pointer border-2 p-6 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-hover',
              isSelected
                ? 'border-primary bg-accent shadow-hover'
                : 'border-black/[0.06] hover:border-black/[0.1]'
            )}
            onClick={() => onSelect(format.id)}
            data-icod-id={`src_components_formatselector_tsx_522f_${format.id}`}>
            <div
              className="flex items-start gap-4"
              data-icod-id={`src_components_formatselector_tsx_9aa9_${format.id}`}>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-black/[0.06] bg-white text-muted-foreground'
                )}
                data-icod-id={`src_components_formatselector_tsx_57b4_${format.id}`}>
                <Icon
                  className="h-5 w-5"
                  data-icod-id={`src_components_formatselector_tsx_f7ad_${format.id}`} />
              </div>
              <div
                className="space-y-1.5"
                data-icod-id={`src_components_formatselector_tsx_d087_${format.id}`}>
                <h3
                  className={cn(
                    'font-medium transition-colors duration-300',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                  data-icod-id={`src_components_formatselector_tsx_308b_${format.id}`}>
                  {format.label}
                </h3>
                <p
                  className="text-sm leading-relaxed text-muted-foreground"
                  data-icod-id={`src_components_formatselector_tsx_a170_${format.id}`}>
                  {format.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
