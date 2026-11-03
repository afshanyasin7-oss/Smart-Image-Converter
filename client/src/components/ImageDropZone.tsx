import { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ImageDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  currentCount?: number;
  error?: string | null;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPT_STRING = '.jpg,.jpeg,.png,.webp';

export default function ImageDropZone({
  onFilesSelected,
  maxFiles = 100,
  currentCount = 0,
  error,
  className,
}: ImageDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        ACCEPTED_TYPES.includes(file.type)
      );

      if (files.length > 0) {
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = files.slice(0, remainingSlots);
        onFilesSelected(filesToAdd);
      }
    },
    [onFilesSelected, maxFiles, currentCount]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        ACCEPTED_TYPES.includes(file.type)
      );

      if (files.length > 0) {
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = files.slice(0, remainingSlots);
        onFilesSelected(filesToAdd);
      }

      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected, maxFiles, currentCount]
  );

  return (
    <div
      className={cn('space-y-5', className)}
      data-icod-id="src_components_imagedropzone_tsx_5b68">
      {error && <Alert variant="error" data-icod-id="src_components_imagedropzone_tsx_8da3">{error}</Alert>}
      <Card
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-5 border-2 border-dashed border-black/[0.08] p-10 transition-all duration-300 hover:border-primary/30 hover:bg-muted/30',
          'min-h-[220px]'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        data-icod-id="src_components_imagedropzone_tsx_e81b">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/[0.06] bg-white shadow-ambient"
          data-icod-id="src_components_imagedropzone_tsx_282f">
          <Upload
            className="h-6 w-6 text-primary"
            data-icod-id="src_components_imagedropzone_tsx_4f4e" />
        </div>
        <div
          className="text-center"
          data-icod-id="src_components_imagedropzone_tsx_c42e">
          <p
            className="font-serif text-lg text-foreground"
            data-icod-id="src_components_imagedropzone_tsx_8532">
            Drag and drop images here
          </p>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_components_imagedropzone_tsx_6502">
            or click to browse files
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          data-icod-id="src_components_imagedropzone_tsx_09ff">
          <ImageIcon
            className="h-3.5 w-3.5"
            data-icod-id="src_components_imagedropzone_tsx_93d0" />
          <span data-icod-id="src_components_imagedropzone_tsx_6289">JPG, PNG, WEBP up to 10MB each</span>
        </div>
      </Card>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        className="hidden"
        onChange={handleFileChange}
        data-icod-id="src_components_imagedropzone_tsx_84bc" />
      <div
        className="flex items-center justify-between text-sm"
        data-icod-id="src_components_imagedropzone_tsx_f276">
        <span
          className="text-muted-foreground"
          data-icod-id="src_components_imagedropzone_tsx_31a6">
          {currentCount}/{maxFiles} images selected
        </span>
        {currentCount >= maxFiles && (
          <span
            className="text-warning"
            data-icod-id="src_components_imagedropzone_tsx_fbc5">Maximum limit reached</span>
        )}
      </div>
    </div>
  );
}
