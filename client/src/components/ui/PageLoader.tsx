import Spinner from './Spinner';

/** Full-page loading indicator shown during route transitions via Suspense. */
export default function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
      data-icod-id="src_components_ui_pageloader_tsx_e8ed">
      <Spinner size="lg" data-icod-id="src_components_ui_pageloader_tsx_522c" />
    </div>
  );
}
