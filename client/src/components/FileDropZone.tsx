import { useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, FileText, FolderOpen } from 'lucide-react';
import { Card, Alert, Button } from '@/components/ui';
import { cn } from '@/utils/cn';

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_FILE_SIZE_MB = 25;

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onRejectedFiles?: (rejections: Array<{ name: string; reason: string }>) => void;
  maxFiles?: number;
  currentCount?: number;
  error?: string | null;
  className?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_PDF_TYPE = 'application/pdf';
const ACCEPTED_OCTET_STREAM = 'application/octet-stream';
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPE, ACCEPTED_OCTET_STREAM];
const ACCEPT_STRING = '.jpg,.jpeg,.png,.webp,.pdf';

function validateFiles(
  files: File[]
): { accepted: File[]; rejected: Array<{ name: string; reason: string }> } {
  const accepted: File[] = [];
  const rejected: Array<{ name: string; reason: string }> = [];

  for (const file of files) {
    // Check file type — accept known types or .pdf extension with octet-stream
    const isKnownType = ACCEPTED_TYPES.includes(file.type);
    const isPdfByExtension =
      file.name.toLowerCase().endsWith('.pdf') &&
      (file.type === '' || file.type === 'application/octet-stream');

    if (!isKnownType && !isPdfByExtension) {
      rejected.push({
        name: file.name,
        reason: `Unsupported format (${file.type || 'unknown'})`,
      });
      continue;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      rejected.push({
        name: file.name,
        reason: `File too large (${sizeMB}MB, max ${MAX_FILE_SIZE_MB}MB)`,
      });
      continue;
    }

    accepted.push(file);
  }

  return { accepted, rejected };
}

export default function FileDropZone({
  onFilesSelected,
  onRejectedFiles,
  maxFiles = 100,
  currentCount = 0,
  error,
  className,
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const allFiles = Array.from(e.dataTransfer.files);
      const { accepted, rejected } = validateFiles(allFiles);

      if (rejected.length > 0 && onRejectedFiles) {
        onRejectedFiles(rejected);
      }

      if (accepted.length > 0) {
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = accepted.slice(0, remainingSlots);
        onFilesSelected(filesToAdd);
      }
    },
    [onFilesSelected, onRejectedFiles, maxFiles, currentCount]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFolderClick = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files || []);
      const { accepted, rejected } = validateFiles(allFiles);

      if (rejected.length > 0 && onRejectedFiles) {
        onRejectedFiles(rejected);
      }

      if (accepted.length > 0) {
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = accepted.slice(0, remainingSlots);
        onFilesSelected(filesToAdd);
      }

      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected, onRejectedFiles, maxFiles, currentCount]
  );

  const handleFolderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files || []);
      const { accepted, rejected } = validateFiles(allFiles);

      if (rejected.length > 0 && onRejectedFiles) {
        onRejectedFiles(rejected);
      }

      if (accepted.length > 0) {
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = accepted.slice(0, remainingSlots);
        onFilesSelected(filesToAdd);
      }

      // Reset input so same folder can be selected again
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    },
    [onFilesSelected, onRejectedFiles, maxFiles, currentCount]
  );

  return (
    <div
      className={cn('space-y-5', className)}
      data-icod-id="src_components_filedropzone_tsx_6047">
      {error && <Alert variant="error" data-icod-id="src_components_filedropzone_tsx_730f">{error}</Alert>}
      <Card
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-5 border-2 border-dashed border-black/[0.08] p-10 transition-all duration-300 hover:border-primary/30 hover:bg-muted/30',
          'min-h-[220px]'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        data-icod-id="src_components_filedropzone_tsx_930a">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/[0.06] bg-white shadow-ambient"
          data-icod-id="src_components_filedropzone_tsx_8ca2">
          <Upload
            className="h-6 w-6 text-primary"
            data-icod-id="src_components_filedropzone_tsx_dbe9" />
        </div>
        <div
          className="text-center"
          data-icod-id="src_components_filedropzone_tsx_efe0">
          <p
            className="font-serif text-lg text-foreground"
            data-icod-id="src_components_filedropzone_tsx_1e7f">
            Drag and drop files here
          </p>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_components_filedropzone_tsx_0def">
            or click to browse files
          </p>
        </div>
        <div
          className="flex items-center gap-6 text-xs text-muted-foreground"
          data-icod-id="src_components_filedropzone_tsx_3129">
          <div
            className="flex items-center gap-1.5"
            data-icod-id="src_components_filedropzone_tsx_98de">
            <ImageIcon
              className="h-3.5 w-3.5"
              data-icod-id="src_components_filedropzone_tsx_f984" />
            <span data-icod-id="src_components_filedropzone_tsx_eb7a">JPG, PNG, WEBP</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            data-icod-id="src_components_filedropzone_tsx_ff0b">
            <FileText
              className="h-3.5 w-3.5"
              data-icod-id="src_components_filedropzone_tsx_3000" />
            <span data-icod-id="src_components_filedropzone_tsx_c6ab">PDF</span>
          </div>
          <span data-icod-id="src_components_filedropzone_tsx_3ebe">up to 25MB each</span>
        </div>
      </Card>
      {/* Action buttons */}
      <div
        className="flex gap-3"
        data-icod-id="src_components_filedropzone_tsx_33e8">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          data-icod-id="src_components_filedropzone_tsx_8209">
          <Upload
            className="mr-2 h-4 w-4"
            data-icod-id="src_components_filedropzone_tsx_0d8b" />
          Select Files
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleFolderClick();
          }}
          data-icod-id="src_components_filedropzone_tsx_a7ae">
          <FolderOpen
            className="mr-2 h-4 w-4"
            data-icod-id="src_components_filedropzone_tsx_2d29" />
          Upload Folder
        </Button>
      </div>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        className="hidden"
        onChange={handleFileChange}
        data-icod-id="src_components_filedropzone_tsx_3a40" />
      <input
        ref={folderInputRef}
        type="file"
        accept={ACCEPT_STRING}
        // @ts-expect-error webkitdirectory is a non-standard attribute for folder selection
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderChange}
        data-icod-id="src_components_filedropzone_tsx_04d9" />
      <div
        className="flex items-center justify-between text-sm"
        data-icod-id="src_components_filedropzone_tsx_7493">
        <span
          className="text-muted-foreground"
          data-icod-id="src_components_filedropzone_tsx_d65f">
          {currentCount}/{maxFiles} files selected
        </span>
        {currentCount >= maxFiles && (
          <span
            className="text-warning"
            data-icod-id="src_components_filedropzone_tsx_707c">Maximum limit reached</span>
        )}
      </div>
    </div>
  );
}
