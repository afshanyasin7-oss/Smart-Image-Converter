import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      data-icod-id="src_pages_notfoundpage_tsx_46fa">
      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
        data-icod-id="src_pages_notfoundpage_tsx_70b9">
        Skip to content
      </a>
      <Navigation data-icod-id="src_pages_notfoundpage_tsx_5591" />
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-6 py-24 lg:px-8"
        data-icod-id="src_pages_notfoundpage_tsx_d050">
        <div className="text-center" data-icod-id="src_pages_notfoundpage_tsx_ea0a">
          <div
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50"
            data-icod-id="src_pages_notfoundpage_tsx_19ed">
            <FileQuestion
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
              data-icod-id="src_pages_notfoundpage_tsx_baa2" />
          </div>

          <h1
            className="font-serif text-5xl font-light tracking-tight text-foreground md:text-6xl"
            data-icod-id="src_pages_notfoundpage_tsx_61cb">
            404
          </h1>
          <p
            className="mt-4 text-xl font-light text-muted-foreground"
            data-icod-id="src_pages_notfoundpage_tsx_f379">
            Page not found
          </p>
          <p
            className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground"
            data-icod-id="src_pages_notfoundpage_tsx_0e56">
            The page you are looking for does not exist or has been moved.
          </p>

          <div
            className="mt-10 flex items-center justify-center gap-4"
            data-icod-id="src_pages_notfoundpage_tsx_d73f">
            <Link
              to="/"
              className={buttonClass({ variant: 'primary', size: 'lg' })}
              data-icod-id="src_pages_notfoundpage_tsx_f2fc">
              <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" data-icod-id="src_pages_notfoundpage_tsx_a441" />
              Back to Home
            </Link>
            <Link
              to="/convert"
              className={buttonClass({ variant: 'outline', size: 'md' })}
              data-icod-id="src_pages_notfoundpage_tsx_eace">
              Go to Converter
            </Link>
          </div>
        </div>
      </main>
      <Footer data-icod-id="src_pages_notfoundpage_tsx_8b83" />
    </div>
  );
}
