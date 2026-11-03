import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { UploadedImage } from '@/types/converter';

interface ProcessingProgressProps {
  images: UploadedImage[];
  progress: number;
  message: string;
  className?: string;
}

export default function ProcessingProgress({
  images,
  progress,
  message,
  className,
}: ProcessingProgressProps) {
  return (
    <div
      className={cn('space-y-8', className)}
      data-icod-id="src_components_processingprogress_tsx_fb78">
      {/* Overall progress */}
      <Card className="p-8" data-icod-id="src_components_processingprogress_tsx_5907">
        <div
          className="space-y-5"
          data-icod-id="src_components_processingprogress_tsx_2445">
          <div
            className="flex items-center justify-between"
            data-icod-id="src_components_processingprogress_tsx_06d5">
            <h3
              className="font-serif text-lg text-foreground"
              data-icod-id="src_components_processingprogress_tsx_c4fb">Processing Progress</h3>
            <span
              className="text-sm font-medium tabular-nums text-primary"
              data-icod-id="src_components_processingprogress_tsx_96be">{progress}%</span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-muted/60"
            data-icod-id="src_components_processingprogress_tsx_e6ed">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              data-icod-id="src_components_processingprogress_tsx_8197" />
          </div>

          <p
            className="text-sm leading-relaxed text-muted-foreground"
            data-icod-id="src_components_processingprogress_tsx_04b7">{message}</p>
        </div>
      </Card>
      {/* Individual image status */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_components_processingprogress_tsx_b03c">
        {images.map((image) => (
          <Card
            key={image.id}
            className="flex items-center gap-4 p-4 transition-all duration-300 hover:shadow-hover"
            data-icod-id={`src_components_processingprogress_tsx_78b3_${image.id}`}>
            <div
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/[0.06]"
              data-icod-id={`src_components_processingprogress_tsx_3668_${image.id}`}>
              <img
                src={image.previewUrl}
                alt={image.originalName}
                className="h-full w-full object-cover"
                data-icod-id={`src_components_processingprogress_tsx_e576_${image.id}`} />
            </div>
            <div
              className="min-w-0 flex-1"
              data-icod-id={`src_components_processingprogress_tsx_95bf_${image.id}`}>
              <p
                className="truncate text-sm font-medium text-foreground"
                data-icod-id={`src_components_processingprogress_tsx_0782_${image.id}`}>
                {image.originalName}
              </p>
              <div
                className="mt-1 flex items-center gap-1.5 text-xs"
                data-icod-id={`src_components_processingprogress_tsx_c048_${image.id}`}>
                {image.status === 'processing' && (
                  <>
                    <Loader2
                      className="h-3 w-3 animate-spin text-primary"
                      data-icod-id={`src_components_processingprogress_tsx_e183_${image.id}`} />
                    <span
                      className="text-primary"
                      data-icod-id={`src_components_processingprogress_tsx_7773_${image.id}`}>Processing...</span>
                  </>
                )}
                {image.status === 'done' && (
                  <>
                    <CheckCircle
                      className="h-3 w-3 text-success"
                      data-icod-id={`src_components_processingprogress_tsx_91f6_${image.id}`} />
                    <span
                      className="text-success"
                      data-icod-id={`src_components_processingprogress_tsx_dbda_${image.id}`}>Complete</span>
                  </>
                )}
                {image.status === 'failed' && (
                  <>
                    <AlertCircle
                      className="h-3 w-3 text-destructive"
                      data-icod-id={`src_components_processingprogress_tsx_b176_${image.id}`} />
                    <span
                      className="text-destructive"
                      data-icod-id={`src_components_processingprogress_tsx_1312_${image.id}`}>Failed</span>
                  </>
                )}
                {(image.status === 'pending' || image.status === 'uploaded') && (
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_components_processingprogress_tsx_121f_${image.id}`}>Waiting...</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
