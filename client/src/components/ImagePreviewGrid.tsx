import { X, CheckCircle, AlertCircle, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { UploadedImage, ImageStatus } from '@/types/converter';

interface ImagePreviewGridProps {
  images: UploadedImage[];
  onRemove?: (id: string) => void;
  readonly?: boolean;
  className?: string;
}

const statusIcons: Record<ImageStatus, typeof CheckCircle | null> = {
  pending: null,
  uploaded: CheckCircle,
  processing: Loader2,
  done: CheckCircle,
  failed: AlertCircle,
};

const statusColors: Record<ImageStatus, string> = {
  pending: 'text-muted-foreground',
  uploaded: 'text-success',
  processing: 'text-primary animate-spin',
  done: 'text-success',
  failed: 'text-destructive',
};

export default function ImagePreviewGrid({
  images,
  onRemove,
  readonly = false,
  className,
}: ImagePreviewGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6', className)}
      data-icod-id="src_components_imagepreviewgrid_tsx_6936">
      {images.map((image) => {
        const StatusIcon = statusIcons[image.status];
        const isPdf = image.fileType === 'pdf';
        const hasError = image.status === 'failed' || !!image.error;

        return (
          <Card
            key={image.id}
            className={cn(
              'group relative aspect-square overflow-hidden p-0 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-hover',
              hasError && 'ring-2 ring-destructive/60'
            )}
            data-icod-id={`src_components_imagepreviewgrid_tsx_e2e3_${image.id}`}>
            {/* Render image or PDF icon */}
            {isPdf ? (
              <div
                className="flex h-full w-full flex-col items-center justify-center bg-muted/50 p-3"
                data-icod-id={`src_components_imagepreviewgrid_tsx_10a8_${image.id}`}>
                <FileText
                  className="mb-2 h-10 w-10 text-destructive/80"
                  data-icod-id={`src_components_imagepreviewgrid_tsx_c67d_${image.id}`} />
                <span
                  className="line-clamp-2 text-center text-xs font-medium text-foreground"
                  title={image.originalName}
                  data-icod-id={`src_components_imagepreviewgrid_tsx_6dc0_${image.id}`}>
                  {image.originalName}
                </span>
              </div>
            ) : (
              <img
                src={image.previewUrl}
                alt={image.originalName}
                className="h-full w-full object-cover"
                data-icod-id={`src_components_imagepreviewgrid_tsx_81e9_${image.id}`} />
            )}
            {/* Overlay with status and remove button */}
            <div
              className="absolute inset-0 flex flex-col justify-between bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              data-icod-id={`src_components_imagepreviewgrid_tsx_e1ed_${image.id}`}>
              <div
                className="flex justify-end p-2"
                data-icod-id={`src_components_imagepreviewgrid_tsx_300b_${image.id}`}>
                {!readonly && onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/95 text-destructive hover:bg-white hover:text-destructive"
                    onClick={() => onRemove(image.id)}
                    aria-label={`Remove ${image.originalName}`}
                    data-icod-id={`src_components_imagepreviewgrid_tsx_c017_${image.id}`}>
                    <X
                      className="h-4 w-4"
                      data-icod-id={`src_components_imagepreviewgrid_tsx_3d42_${image.id}`} />
                  </Button>
                )}
              </div>
            </div>
            {/* Status indicator — only show when there's no error banner */}
            {StatusIcon && !hasError && (
              <div
                className="absolute bottom-2 right-2"
                data-icod-id={`src_components_imagepreviewgrid_tsx_a8b4_${image.id}`}>
                <StatusIcon
                  className={cn('h-5 w-5 drop-shadow-md', statusColors[image.status])}
                  data-icod-id={`src_components_imagepreviewgrid_tsx_298f_${image.id}`} />
              </div>
            )}
            {/* Order number */}
            <div
              className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/90 text-xs font-medium text-primary-foreground shadow-sm"
              data-icod-id={`src_components_imagepreviewgrid_tsx_e9e5_${image.id}`}>
              {image.order + 1}
            </div>
            {/* Error state — always visible with descriptive message */}
            {hasError && (
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-destructive/90 px-2 py-2.5 text-center backdrop-blur-sm"
                data-icod-id={`src_components_imagepreviewgrid_tsx_25af_${image.id}`}>
                <AlertTriangle
                  className="h-3.5 w-3.5 text-white"
                  data-icod-id={`src_components_imagepreviewgrid_tsx_7bbc_${image.id}`} />
                <p
                  className="line-clamp-2 text-[10px] leading-tight text-white"
                  data-icod-id={`src_components_imagepreviewgrid_tsx_741f_${image.id}`}>
                  {image.error || 'Upload failed'}
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
