import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ConverterStep } from '@/types/converter';

interface Step {
  id: ConverterStep;
  label: string;
}

const steps: Step[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'select-format', label: 'Format' },
  { id: 'processing', label: 'Processing' },
  { id: 'preview', label: 'Preview' },
  { id: 'done', label: 'Done' },
];

interface StepIndicatorProps {
  currentStep: ConverterStep;
  className?: string;
}

export default function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div
      className={cn('flex items-center justify-center gap-1.5', className)}
      data-icod-id="src_components_stepindicator_tsx_a7c2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step.id}
            className="flex items-center gap-1.5"
            data-icod-id={`src_components_stepindicator_tsx_97fb_${step.id}`}>
            <div
              className="flex items-center gap-2"
              data-icod-id={`src_components_stepindicator_tsx_adfd_${step.id}`}>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
                data-icod-id={`src_components_stepindicator_tsx_2ae4_${step.id}`}>
                {isCompleted ? <Check
                  className="h-3.5 w-3.5"
                  data-icod-id={`src_components_stepindicator_tsx_b54b_${step.id}`} /> : index + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium tracking-wide sm:block transition-colors duration-300',
                  isCurrent && 'text-foreground',
                  isCompleted && 'text-primary',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
                data-icod-id={`src_components_stepindicator_tsx_a5b0_${step.id}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-px w-6 transition-colors duration-300 sm:w-10',
                  index < currentIndex ? 'bg-primary/60' : 'bg-black/[0.06]'
                )}
                data-icod-id={`src_components_stepindicator_tsx_c56f_${step.id}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
