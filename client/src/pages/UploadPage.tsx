import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, RefreshCw, CheckCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { Button, Card, Alert, EmptyState, Modal } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/useToast';
import {
  addImages,
  removeImage,
  setStep,
  setFormat,
  setLanguage,
  uploadImages,
  extractContent,
  generateDocument,
  updateBlock,
  reset,
  cleanupJob,
  setError,
} from '@/store/slices/converterSlice';
import type { ContentBlock, OutputFormat, OcrLanguage } from '@/types/converter';
import StepIndicator from '@/components/StepIndicator';
import FileDropZone from '@/components/FileDropZone';
import ImagePreviewGrid from '@/components/ImagePreviewGrid';
import FormatSelector from '@/components/FormatSelector';
import LanguageSelector from '@/components/LanguageSelector';
import ProcessingProgress from '@/components/ProcessingProgress';
import ContentPreview from '@/components/ContentPreview';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import * as converterService from '@/services/converterService';

export default function UploadPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [rejectionAlert, setRejectionAlert] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const {
    images,
    selectedFormat,
    selectedLanguage,
    extractionResults,
    failedImages,
    currentStep,
    isProcessing,
    error,
    processingProgress,
    processingMessage,
    uploadProgress,
    generatedFileUrl,
    generatedFileName,
  } = useAppSelector((state) => state.converter);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generatedFileUrl) {
        URL.revokeObjectURL(generatedFileUrl);
      }
    };
  }, [generatedFileUrl]);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setRejectionAlert(null);
      dispatch(addImages(files));
      if (files.length > 0) {
        toast(`${files.length} file${files.length > 1 ? 's' : ''} added`, 'success');
      }
    },
    [dispatch, toast],
  );

  const handleRejectedFiles = useCallback(
    (rejections: Array<{ name: string; reason: string }>) => {
      const message = rejections
        .map((r) => `${r.name}: ${r.reason}`)
        .join('\n');
      setRejectionAlert(message);
      toast(`${rejections.length} file${rejections.length > 1 ? 's were' : ' was'} rejected`, 'warning');
    },
    [toast],
  );

  const handleRemoveImage = useCallback(
    (id: string) => {
      dispatch(removeImage(id));
    },
    [dispatch],
  );

  const hasErroredFiles = images.some((img) => img.status === 'failed' || !!img.error);

  const handleContinueToFormat = useCallback(async () => {
    if (images.length === 0) return;

    // Guard: prevent continuing when files have errors
    if (hasErroredFiles) {
      dispatch(setError('Please remove files with errors before continuing.'));
      toast('Please remove files with errors before continuing', 'error');
      return;
    }

    try {
      // Upload images first
      const files = images.map((img) => img.file);
      await dispatch(uploadImages(files)).unwrap();
      dispatch(setStep('select-format'));
      toast('Files uploaded successfully', 'success');
    } catch (err) {
      toast('Upload failed. Please try again.', 'error');
    }
  }, [dispatch, images, hasErroredFiles, toast]);

  const handleFormatSelect = useCallback(
    (format: OutputFormat) => {
      dispatch(setFormat(format));
    },
    [dispatch],
  );

  const handleLanguageSelect = useCallback(
    (language: OcrLanguage) => {
      dispatch(setLanguage(language));
    },
    [dispatch],
  );

  const handleExtractContent = useCallback(async () => {
    if (!selectedFormat) return;

    dispatch(setStep('processing'));
    try {
      await dispatch(extractContent()).unwrap();
      dispatch(setStep('preview'));
      toast('Content extracted successfully', 'success');
    } catch (err) {
      toast('Extraction failed. Please try again.', 'error');
    }
  }, [dispatch, selectedFormat, toast]);

  const handleUpdateBlock = useCallback(
    (resultIndex: number, blockIndex: number, content: ContentBlock['content']) => {
      dispatch(updateBlock({ resultIndex, blockIndex, content }));
    },
    [dispatch],
  );

  const handleGenerateDocument = useCallback(async () => {
    try {
      await dispatch(generateDocument()).unwrap();
      dispatch(setStep('done'));
      toast('Document generated successfully', 'success');
    } catch (err) {
      toast('Document generation failed. Please try again.', 'error');
    }
  }, [dispatch, toast]);

  const handleDownload = useCallback(() => {
    if (generatedFileUrl && generatedFileName) {
      converterService.downloadBlob(
        new Blob([generatedFileUrl]),
        generatedFileName,
      );
      toast('Download started', 'info');
    }
  }, [generatedFileUrl, generatedFileName, toast]);

  const handleStartOver = useCallback(async () => {
    await dispatch(cleanupJob());
    dispatch(reset());
    toast('Workflow reset', 'info');
  }, [dispatch, toast]);

  const handleBackToUpload = useCallback(() => {
    dispatch(setStep('upload'));
  }, [dispatch]);

  return (
    <div
      className="min-h-screen bg-background"
      data-icod-id="src_pages_uploadpage_tsx_5005">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
        data-icod-id="src_pages_uploadpage_tsx_582d">
        Skip to content
      </a>
      <Navigation data-icod-id="src_pages_uploadpage_tsx_4371" />
      {/* Progress bar showing current step in the workflow */}
      <div
        className="border-b border-black/[0.04] bg-background/80 backdrop-blur-sm px-6 py-3 lg:px-8"
        data-icod-id="src_pages_uploadpage_tsx_fb77">
        <div
          className="mx-auto max-w-5xl"
          data-icod-id="src_pages_uploadpage_tsx_f3d9">
          <StepIndicator currentStep={currentStep} data-icod-id="src_pages_uploadpage_tsx_82b0" />
        </div>
      </div>
      {/* Main Content */}
      <main
        id="main-content"
        className="px-6 py-12 md:py-16 lg:px-8"
        data-icod-id="src_pages_uploadpage_tsx_a8bb">
        <div
          className="mx-auto max-w-4xl"
          data-icod-id="src_pages_uploadpage_tsx_31d1">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="error"
              className="mb-8"
              data-icod-id="src_pages_uploadpage_tsx_fc62">
              {error}
            </Alert>
          )}

          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <div className="space-y-10" data-icod-id="src_pages_uploadpage_tsx_452b">
              <div
                className="flex items-start justify-between"
                data-icod-id="src_pages_uploadpage_tsx_99ba">
                <div
                  className="text-center flex-1"
                  data-icod-id="src_pages_uploadpage_tsx_a6bc">
                  <h1
                    className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
                    data-icod-id="src_pages_uploadpage_tsx_fbfa">
                    Upload Your Files
                  </h1>
                  <p
                    className="mt-4 text-lg leading-relaxed text-muted-foreground"
                    data-icod-id="src_pages_uploadpage_tsx_261c">
                    Add up to 100 images or PDFs to convert to Word or Excel
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHelpOpen(true)}
                  aria-label="Help and tips"
                  title="Help & Tips"
                  data-icod-id="src_pages_uploadpage_tsx_b360">
                  <HelpCircle className="h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_4f4f" />
                </Button>
              </div>

              <FileDropZone
                onFilesSelected={handleFilesSelected}
                onRejectedFiles={handleRejectedFiles}
                maxFiles={100}
                currentCount={images.length}
                data-icod-id="src_pages_uploadpage_tsx_01bf" />

              {/* Rejection alert for files that failed client-side validation */}
              {rejectionAlert && (
                <Alert
                  variant="error"
                  className="whitespace-pre-line"
                  data-icod-id="src_pages_uploadpage_tsx_9982">
                  <p className="font-medium" data-icod-id="src_pages_uploadpage_tsx_900c">Some files were not added:</p>
                  <ul
                    className="mt-2 list-inside list-disc text-sm leading-relaxed"
                    data-icod-id="src_pages_uploadpage_tsx_83df">
                    {rejectionAlert.split('\n').map((line, i) => (
                      <li key={i} data-icod-id={`src_pages_uploadpage_tsx_0a3a_${i}`}>{line}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {images.length > 0 && (
                <>
                  <ImagePreviewGrid
                    images={images}
                    onRemove={handleRemoveImage}
                    data-icod-id="src_pages_uploadpage_tsx_4695" />

                  <div
                    className="flex justify-end pt-4"
                    data-icod-id="src_pages_uploadpage_tsx_0039">
                    <Button
                      size="lg"
                      onClick={handleContinueToFormat}
                      loading={isProcessing}
                      disabled={images.length === 0 || hasErroredFiles}
                      data-icod-id="src_pages_uploadpage_tsx_0c33">
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_e02f" />
                    </Button>
                  </div>
                  {hasErroredFiles && (
                    <p
                      className="text-right text-sm text-destructive"
                      data-icod-id="src_pages_uploadpage_tsx_83cc">
                      Please remove files with errors before continuing
                    </p>
                  )}
                </>
              )}

              {images.length === 0 && (
                <EmptyState
                  title="No files selected"
                  description="Drag and drop images or PDFs above, or click to browse"
                  data-icod-id="src_pages_uploadpage_tsx_3ad0" />
              )}
            </div>
          )}

          {/* Step 2: Select Format */}
          {currentStep === 'select-format' && (
            <div className="space-y-12" data-icod-id="src_pages_uploadpage_tsx_e525">
              <div className="text-center" data-icod-id="src_pages_uploadpage_tsx_2407">
                <h1
                  className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
                  data-icod-id="src_pages_uploadpage_tsx_4803">
                  Configure Extraction
                </h1>
                <p
                  className="mt-4 text-lg leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_2216">
                  Choose the language and output format for your converted content
                </p>
              </div>

              {/* Language Selection */}
              <div className="space-y-4" data-icod-id="src_pages_uploadpage_tsx_a137">
                <h2
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_87f1">Text Language</h2>
                <LanguageSelector
                  selected={selectedLanguage}
                  onSelect={handleLanguageSelect}
                  data-icod-id="src_pages_uploadpage_tsx_c8e6" />
              </div>

              {/* Format Selection */}
              <div className="space-y-4" data-icod-id="src_pages_uploadpage_tsx_3641">
                <h2
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_178d">Output Format</h2>
                <FormatSelector
                  selected={selectedFormat}
                  onSelect={handleFormatSelect}
                  data-icod-id="src_pages_uploadpage_tsx_0a63" />
              </div>

              <div
                className="flex justify-between border-t border-black/[0.04] pt-8"
                data-icod-id="src_pages_uploadpage_tsx_cb6e">
                <Button
                  variant="outline"
                  onClick={handleBackToUpload}
                  data-icod-id="src_pages_uploadpage_tsx_be0a">
                  <ArrowLeft className="mr-2 h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_f108" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleExtractContent}
                  disabled={!selectedFormat}
                  loading={isProcessing}
                  data-icod-id="src_pages_uploadpage_tsx_7ad5">
                  Extract Content
                  <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_c118" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === 'processing' && (
            <div className="space-y-10" data-icod-id="src_pages_uploadpage_tsx_1487">
              <div className="text-center" data-icod-id="src_pages_uploadpage_tsx_302f">
                <h1
                  className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
                  data-icod-id="src_pages_uploadpage_tsx_9738">
                  Processing Files
                </h1>
                <p
                  className="mt-4 text-lg leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_974b">
                  Extracting text and content from your files
                </p>
              </div>

              <ProcessingProgress
                images={images}
                progress={processingProgress}
                message={processingMessage}
                data-icod-id="src_pages_uploadpage_tsx_d475" />
            </div>
          )}

          {/* Step 4: Preview & Edit */}
          {currentStep === 'preview' && (
            <div className="space-y-10" data-icod-id="src_pages_uploadpage_tsx_25a6">
              <div className="text-center" data-icod-id="src_pages_uploadpage_tsx_946a">
                <h1
                  className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
                  data-icod-id="src_pages_uploadpage_tsx_bb83">
                  Review & Edit Content
                </h1>
                <p
                  className="mt-4 text-lg leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_dc34">
                  Review the extracted content and make any necessary edits
                </p>
              </div>

              {failedImages.length > 0 && (
                <Alert variant="warning" data-icod-id="src_pages_uploadpage_tsx_ac05">
                  <p className="font-medium" data-icod-id="src_pages_uploadpage_tsx_11b2">Some files failed to process:</p>
                  <ul
                    className="mt-2 list-inside list-disc text-sm leading-relaxed"
                    data-icod-id="src_pages_uploadpage_tsx_9fdd">
                    {failedImages.map((img) => (
                      <li
                        key={img.imageId}
                        data-icod-id={`src_pages_uploadpage_tsx_d604_${img.imageId}`}>
                        {img.filename}: {img.reason}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              <ContentPreview
                results={extractionResults}
                onUpdateBlock={handleUpdateBlock}
                data-icod-id="src_pages_uploadpage_tsx_aa02" />

              <div
                className="flex justify-between border-t border-black/[0.04] pt-8"
                data-icod-id="src_pages_uploadpage_tsx_b660">
                <Button
                  variant="outline"
                  onClick={() => dispatch(setStep('select-format'))}
                  data-icod-id="src_pages_uploadpage_tsx_b0af">
                  <ArrowLeft className="mr-2 h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_178c" />
                  Change Format
                </Button>
                <Button
                  size="lg"
                  onClick={handleGenerateDocument}
                  loading={isProcessing}
                  data-icod-id="src_pages_uploadpage_tsx_2720">
                  Generate {selectedFormat?.toUpperCase()}
                  <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_uploadpage_tsx_37d3" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {currentStep === 'done' && (
            <div className="space-y-10" data-icod-id="src_pages_uploadpage_tsx_5717">
              <Card className="p-12 text-center" data-icod-id="src_pages_uploadpage_tsx_71d6">
                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
                  data-icod-id="src_pages_uploadpage_tsx_1646">
                  <CheckCircle
                    className="h-8 w-8 text-success"
                    aria-hidden="true"
                    data-icod-id="src_pages_uploadpage_tsx_ea80" />
                </div>
                <h1
                  className="font-serif text-3xl font-light tracking-tight text-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_e82f">
                  Conversion Complete
                </h1>
                <p
                  className="mt-4 text-lg leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_uploadpage_tsx_3a2b">
                  Your document has been generated successfully
                </p>

                <div
                  className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                  data-icod-id="src_pages_uploadpage_tsx_fd51">
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    data-icod-id="src_pages_uploadpage_tsx_21c8">
                    <Download
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                      data-icod-id="src_pages_uploadpage_tsx_046f" />
                    Download {generatedFileName}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartOver}
                    data-icod-id="src_pages_uploadpage_tsx_eaa4">
                    <RefreshCw
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                      data-icod-id="src_pages_uploadpage_tsx_85c2" />
                    Start Over
                  </Button>
                </div>
              </Card>

              <div className="text-center" data-icod-id="src_pages_uploadpage_tsx_2f21">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  data-icod-id="src_pages_uploadpage_tsx_90ef">
                  Return to Home
                </Link>
              </div>
            </div>
          )}

          {/* Start Over button visible on all steps except upload and done */}
          {currentStep !== 'upload' && currentStep !== 'done' && (
            <div
              className="mt-12 border-t border-black/[0.04] pt-6 text-center"
              data-icod-id="src_pages_uploadpage_tsx_a3c9">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartOver}
                data-icod-id="src_pages_uploadpage_tsx_3deb">
                <RotateCcw
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  data-icod-id="src_pages_uploadpage_tsx_9a8e" />
                Start Over
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer data-icod-id="src_pages_uploadpage_tsx_ed4c" />
      {/* Help Modal */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help & Tips"
        data-icod-id="src_pages_uploadpage_tsx_fe29">
        <div
          className="space-y-6 text-sm leading-relaxed text-muted-foreground"
          data-icod-id="src_pages_uploadpage_tsx_fdf2">
          <section data-icod-id="src_pages_uploadpage_tsx_27ff">
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_uploadpage_tsx_eb2e">Supported Formats</h3>
            <ul
              className="list-inside list-disc space-y-1"
              data-icod-id="src_pages_uploadpage_tsx_cf0f">
              <li data-icod-id="src_pages_uploadpage_tsx_3293"><strong className="text-foreground" data-icod-id="src_pages_uploadpage_tsx_8d46">Images:</strong> JPG, PNG, WEBP (up to 25MB each)</li>
              <li data-icod-id="src_pages_uploadpage_tsx_156c"><strong className="text-foreground" data-icod-id="src_pages_uploadpage_tsx_96be">Documents:</strong> PDF (up to 25MB each)</li>
              <li data-icod-id="src_pages_uploadpage_tsx_f0f3"><strong className="text-foreground" data-icod-id="src_pages_uploadpage_tsx_33bc">Batch:</strong> Up to 100 files per conversion</li>
            </ul>
          </section>

          <section data-icod-id="src_pages_uploadpage_tsx_9c52">
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_uploadpage_tsx_7ca2">Tips for Best Results</h3>
            <ul
              className="list-inside list-disc space-y-1"
              data-icod-id="src_pages_uploadpage_tsx_7a30">
              <li data-icod-id="src_pages_uploadpage_tsx_9e42">Use high-resolution images (at least 300 DPI)</li>
              <li data-icod-id="src_pages_uploadpage_tsx_f40c">Ensure good lighting and minimal shadows</li>
              <li data-icod-id="src_pages_uploadpage_tsx_8518">Avoid blurry or skewed photographs</li>
              <li data-icod-id="src_pages_uploadpage_tsx_ac50">For multi-page documents, keep pages in order</li>
              <li data-icod-id="src_pages_uploadpage_tsx_b5f4">Clean backgrounds improve text detection accuracy</li>
            </ul>
          </section>

          <section data-icod-id="src_pages_uploadpage_tsx_6da1">
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_uploadpage_tsx_f971">Urdu Language Support</h3>
            <p data-icod-id="src_pages_uploadpage_tsx_340b">
              Smart Converter supports Urdu text extraction with proper right-to-left rendering.
              Select &quot;English + Urdu&quot; as the language option when your documents contain
              Urdu or mixed-language content. The exported Word and Excel files preserve
              correct Urdu typography and layout.
            </p>
          </section>

          <section data-icod-id="src_pages_uploadpage_tsx_ff53">
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_uploadpage_tsx_b8ae">Output Formats</h3>
            <ul
              className="list-inside list-disc space-y-1"
              data-icod-id="src_pages_uploadpage_tsx_2cbe">
              <li data-icod-id="src_pages_uploadpage_tsx_3e62"><strong className="text-foreground" data-icod-id="src_pages_uploadpage_tsx_ee89">Excel (.xlsx):</strong> Best for tables, forms, and structured data</li>
              <li data-icod-id="src_pages_uploadpage_tsx_3585"><strong className="text-foreground" data-icod-id="src_pages_uploadpage_tsx_19df">Word (.docx):</strong> Best for paragraphs, headings, and prose</li>
            </ul>
          </section>
        </div>
      </Modal>
    </div>
  );
}
