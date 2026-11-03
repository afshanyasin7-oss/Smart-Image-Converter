import { Languages, Globe, Cpu, Cloud } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { OcrLanguage, OcrEngine } from '@/types/converter';

interface LanguageOption {
  id: OcrLanguage;
  label: string;
  description: string;
  icon: typeof Languages;
}

const languages: LanguageOption[] = [
  {
    id: 'eng',
    label: 'English',
    description: 'Recognize English text only',
    icon: Languages,
  },
  {
    id: 'urd',
    label: 'Urdu (اردو)',
    description: 'Recognize Urdu text only with RTL support',
    icon: Globe,
  },
  {
    id: 'eng+urd',
    label: 'Both (English + Urdu)',
    description: 'Recognize both English and Urdu text (Recommended)',
    icon: Globe,
  },
];

interface EngineOption {
  id: OcrEngine;
  label: string;
  description: string;
  icon: typeof Cpu;
}

const engines: EngineOption[] = [
  {
    id: 'auto',
    label: 'Auto (Recommended)',
    description: 'Automatically select best engine for content',
    icon: Cpu,
  },
  {
    id: 'google-vision',
    label: 'Google Vision',
    description: 'Best accuracy for Urdu/Nastaliq script (requires API key)',
    icon: Cloud,
  },
  {
    id: 'tesseract',
    label: 'Tesseract',
    description: 'Offline processing, no API required',
    icon: Cpu,
  },
];

interface LanguageSelectorProps {
  selected: OcrLanguage;
  onSelect: (language: OcrLanguage) => void;
  className?: string;
  selectedEngine?: OcrEngine;
  onEngineSelect?: (engine: OcrEngine) => void;
}

export default function LanguageSelector({
  selected,
  onSelect,
  className,
  selectedEngine = 'auto',
  onEngineSelect,
}: LanguageSelectorProps) {
  return (
    <div
      className={cn('space-y-8', className)}
      data-icod-id="src_components_languageselector_tsx_9034">
      {/* Language Selection */}
      <div
        className="space-y-4"
        data-icod-id="src_components_languageselector_tsx_4186">
        <h3
          className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
          data-icod-id="src_components_languageselector_tsx_6d6d">
          Select Language
        </h3>
        <div
          className="grid gap-4 sm:grid-cols-3"
          data-icod-id="src_components_languageselector_tsx_0571">
          {languages.map((lang) => {
            const isSelected = selected === lang.id;
            const Icon = lang.icon;

            return (
              <Card
                key={lang.id}
                className={cn(
                  'cursor-pointer border-2 p-5 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-hover',
                  isSelected
                    ? 'border-primary bg-accent shadow-hover'
                    : 'border-black/[0.06] hover:border-black/[0.1]'
                )}
                onClick={() => onSelect(lang.id)}
                data-icod-id={`src_components_languageselector_tsx_cc3d_${lang.id}`}>
                <div
                  className="flex flex-col items-center gap-3 text-center"
                  data-icod-id={`src_components_languageselector_tsx_ae5a_${lang.id}`}>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-black/[0.06] bg-white text-muted-foreground'
                    )}
                    data-icod-id={`src_components_languageselector_tsx_ce96_${lang.id}`}>
                    <Icon
                      className="h-5 w-5"
                      data-icod-id={`src_components_languageselector_tsx_5e4d_${lang.id}`} />
                  </div>
                  <div
                    className="space-y-1"
                    data-icod-id={`src_components_languageselector_tsx_8a13_${lang.id}`}>
                    <h3
                      className={cn(
                        'font-medium transition-colors duration-300',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                      data-icod-id={`src_components_languageselector_tsx_50c5_${lang.id}`}>
                      {lang.label}
                    </h3>
                    <p
                      className="text-xs leading-relaxed text-muted-foreground"
                      data-icod-id={`src_components_languageselector_tsx_ea27_${lang.id}`}>
                      {lang.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {/* OCR Engine Selection */}
      {onEngineSelect && (
        <div
          className="space-y-4"
          data-icod-id="src_components_languageselector_tsx_4c10">
          <h3
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
            data-icod-id="src_components_languageselector_tsx_38ef">
            OCR Engine
          </h3>
          <div
            className="grid gap-4 sm:grid-cols-3"
            data-icod-id="src_components_languageselector_tsx_6a46">
            {engines.map((engine) => {
              const isSelected = selectedEngine === engine.id;
              const Icon = engine.icon;

              return (
                <Card
                  key={engine.id}
                  className={cn(
                    'cursor-pointer border-2 p-5 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-hover',
                    isSelected
                      ? 'border-primary bg-accent shadow-hover'
                      : 'border-black/[0.06] hover:border-black/[0.1]'
                  )}
                  onClick={() => onEngineSelect(engine.id)}
                  title={engine.id === 'google-vision' ? 'Google Cloud Vision provides better accuracy for Urdu Nastaliq script' : undefined}
                  data-icod-id={`src_components_languageselector_tsx_95b8_${engine.id}`}>
                  <div
                    className="flex flex-col items-center gap-3 text-center"
                    data-icod-id={`src_components_languageselector_tsx_16d9_${engine.id}`}>
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-black/[0.06] bg-white text-muted-foreground'
                      )}
                      data-icod-id={`src_components_languageselector_tsx_acfa_${engine.id}`}>
                      <Icon
                        className="h-5 w-5"
                        data-icod-id={`src_components_languageselector_tsx_3b46_${engine.id}`} />
                    </div>
                    <div
                      className="space-y-1"
                      data-icod-id={`src_components_languageselector_tsx_c6ea_${engine.id}`}>
                      <h3
                        className={cn(
                          'font-medium transition-colors duration-300',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}
                        data-icod-id={`src_components_languageselector_tsx_b9c5_${engine.id}`}>
                        {engine.label}
                      </h3>
                      <p
                        className="text-xs leading-relaxed text-muted-foreground"
                        data-icod-id={`src_components_languageselector_tsx_f62c_${engine.id}`}>
                        {engine.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
