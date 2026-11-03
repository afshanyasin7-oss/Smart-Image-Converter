import { Link } from 'react-router-dom';
import { ArrowRight, FileSpreadsheet, FileText, Globe, Zap } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-background"
      data-icod-id="src_pages_homepage_tsx_cd74">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
        data-icod-id="src_pages_homepage_tsx_3304">
        Skip to content
      </a>
      <Navigation data-icod-id="src_pages_homepage_tsx_7e78" />
      {/* Hero Section — editorial typography, generous whitespace */}
      <main id="main-content" data-icod-id="src_pages_homepage_tsx_1284">
        <section
          className="px-6 py-32 md:py-40 lg:px-8"
          data-icod-id="src_pages_homepage_tsx_c70e">
          <div
            className="mx-auto max-w-5xl text-center"
            data-icod-id="src_pages_homepage_tsx_2643">
            <h1
              className="font-serif text-6xl font-light leading-[1.05] tracking-[-0.02em] text-foreground md:text-7xl lg:text-8xl"
              data-icod-id="src_pages_homepage_tsx_c16a">
              Transform images into{' '}
              <span
                className="italic text-primary"
                data-icod-id="src_pages_homepage_tsx_9ce2">editable documents</span>
            </h1>
            <p
              className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground mb-20"
              data-icod-id="src_pages_homepage_tsx_a4e5">
              AI-powered OCR that extracts text, tables, and structured content from your images.
              Supporting English and Urdu with professional Word and Excel export.
            </p>
            <div
              className="flex items-center justify-center gap-4"
              data-icod-id="src_pages_homepage_tsx_248e">
              <Link
                to="/convert"
                className={buttonClass({ size: 'lg' })}
                data-icod-id="src_pages_homepage_tsx_c4c7">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_homepage_tsx_6f96" />
              </Link>
              <Link
                to="/integration"
                className={buttonClass({ variant: 'outline', size: 'md' })}
                data-icod-id="src_pages_homepage_tsx_b53c">
                View Integration
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section — editorial grid, typography-led cards */}
        <section
          className="border-t border-black/[0.04] bg-white px-6 py-24 md:py-32 lg:px-8"
          data-icod-id="src_pages_homepage_tsx_0a95">
          <div className="mx-auto max-w-7xl" data-icod-id="src_pages_homepage_tsx_f205">
            <div className="mb-16 max-w-2xl" data-icod-id="src_pages_homepage_tsx_1f3b">
              <h2
                className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
                data-icod-id="src_pages_homepage_tsx_7498">
                Built for precision
              </h2>
              <p
                className="mt-4 text-lg leading-relaxed text-muted-foreground"
                data-icod-id="src_pages_homepage_tsx_e7dd">
                Every feature designed for professional document conversion workflows.
              </p>
            </div>

            <div
              className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3"
              data-icod-id="src_pages_homepage_tsx_ff72">
              <div className="group" data-icod-id="src_pages_homepage_tsx_0e98">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_aa6e">
                  <Zap
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_d3ab" />
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_18b4">Smart OCR</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_ea83">
                  Advanced text recognition automatically detects paragraphs, tables, lists,
                  and forms with high accuracy.
                </p>
              </div>

              <div className="group" data-icod-id="src_pages_homepage_tsx_e03b">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_6954">
                  <Globe
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_7a60" />
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_8ea4">Urdu Support</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_fa7c">
                  Full support for Urdu text extraction with proper right-to-left
                  rendering in Word and Excel documents.
                </p>
              </div>

              <div className="group" data-icod-id="src_pages_homepage_tsx_7b43">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_13ef">
                  <FileSpreadsheet
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_3e3d" />
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_4163">Excel Export</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_af7d">
                  Generate real .xlsx files with proper tables, cells, and formatting
                  ready for editing in Microsoft Excel.
                </p>
              </div>

              <div className="group" data-icod-id="src_pages_homepage_tsx_4c57">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_2f5a">
                  <FileText
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_0a7c" />
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_fc27">Word Export</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_522c">
                  Create professional .docx documents with headings, paragraphs,
                  and native Word tables for seamless editing.
                </p>
              </div>

              <div className="group" data-icod-id="src_pages_homepage_tsx_4609">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_9290">
                  <span
                    className="font-serif text-lg font-medium text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_cf27">100</span>
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_964d">Batch Upload</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_641e">
                  Upload up to 100 images at once. Support for JPG, PNG, WEBP,
                  and PDF formats up to 25MB each.
                </p>
              </div>

              <div className="group" data-icod-id="src_pages_homepage_tsx_7aec">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out group-hover:-translate-y-px group-hover:border-black/[0.08] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]"
                  data-icod-id="src_pages_homepage_tsx_4779">
                  <span
                    className="font-serif text-lg font-medium text-primary"
                    aria-hidden="true"
                    data-icod-id="src_pages_homepage_tsx_2217">Edit</span>
                </div>
                <h3
                  className="font-serif text-xl text-foreground"
                  data-icod-id="src_pages_homepage_tsx_e7da">Preview & Edit</h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  data-icod-id="src_pages_homepage_tsx_82bc">
                  Review extracted content before export. Edit text, tables, and
                  structured data directly in the browser.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — clean numbered steps */}
        <section
          className="px-6 py-24 md:py-32 lg:px-8"
          data-icod-id="src_pages_homepage_tsx_1d15">
          <div className="mx-auto max-w-3xl" data-icod-id="src_pages_homepage_tsx_002b">
            <h2
              className="mb-16 text-center font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl"
              data-icod-id="src_pages_homepage_tsx_7402">
              How it works
            </h2>
            <div className="space-y-12" data-icod-id="src_pages_homepage_tsx_378f">
              <div className="flex gap-6" data-icod-id="src_pages_homepage_tsx_8064">
                <span
                  className="font-serif text-4xl font-light text-primary/40"
                  aria-hidden="true"
                  data-icod-id="src_pages_homepage_tsx_139a">01</span>
                <div data-icod-id="src_pages_homepage_tsx_40d2">
                  <h3
                    className="font-serif text-xl text-foreground"
                    data-icod-id="src_pages_homepage_tsx_08ca">Upload Images</h3>
                  <p
                    className="mt-2 leading-relaxed text-muted-foreground"
                    data-icod-id="src_pages_homepage_tsx_09a0">
                    Drag and drop or browse to upload your images. Add up to 100 images
                    in a single batch for processing.
                  </p>
                </div>
              </div>

              <div className="flex gap-6" data-icod-id="src_pages_homepage_tsx_508d">
                <span
                  className="font-serif text-4xl font-light text-primary/40"
                  aria-hidden="true"
                  data-icod-id="src_pages_homepage_tsx_89f5">02</span>
                <div data-icod-id="src_pages_homepage_tsx_31df">
                  <h3
                    className="font-serif text-xl text-foreground"
                    data-icod-id="src_pages_homepage_tsx_c672">Choose Format</h3>
                  <p
                    className="mt-2 leading-relaxed text-muted-foreground"
                    data-icod-id="src_pages_homepage_tsx_8817">
                    Select whether you want to export to Microsoft Excel (.xlsx) or
                    Microsoft Word (.docx). Choose your language preference.
                  </p>
                </div>
              </div>

              <div className="flex gap-6" data-icod-id="src_pages_homepage_tsx_b79f">
                <span
                  className="font-serif text-4xl font-light text-primary/40"
                  aria-hidden="true"
                  data-icod-id="src_pages_homepage_tsx_07cc">03</span>
                <div data-icod-id="src_pages_homepage_tsx_f86f">
                  <h3
                    className="font-serif text-xl text-foreground"
                    data-icod-id="src_pages_homepage_tsx_c8de">Extract & Edit</h3>
                  <p
                    className="mt-2 leading-relaxed text-muted-foreground"
                    data-icod-id="src_pages_homepage_tsx_d6e6">
                    Our AI extracts text, tables, and structured content. Preview and edit
                    the results before downloading your document.
                  </p>
                </div>
              </div>

              <div className="flex gap-6" data-icod-id="src_pages_homepage_tsx_dab9">
                <span
                  className="font-serif text-4xl font-light text-primary/40"
                  aria-hidden="true"
                  data-icod-id="src_pages_homepage_tsx_31a2">04</span>
                <div data-icod-id="src_pages_homepage_tsx_fade">
                  <h3
                    className="font-serif text-xl text-foreground"
                    data-icod-id="src_pages_homepage_tsx_d643">Download</h3>
                  <p
                    className="mt-2 leading-relaxed text-muted-foreground"
                    data-icod-id="src_pages_homepage_tsx_2219">
                    Download your fully editable document. The file opens directly in
                    Excel or Word with proper formatting preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section — refined, not heavy */}
        <section
          className="border-t border-black/[0.04] bg-white px-6 py-24 md:py-32 lg:px-8"
          data-icod-id="src_pages_homepage_tsx_53fd">
          <div
            className="mx-auto max-w-3xl text-center"
            data-icod-id="src_pages_homepage_tsx_db95">
            <h2
              className="font-serif text-3xl font-light tracking-tight text-foreground md:text-5xl"
              data-icod-id="src_pages_homepage_tsx_08bd">
              Ready to convert?
            </h2>
            <p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
              data-icod-id="src_pages_homepage_tsx_2a2a">
              Start converting your images to editable documents today.
              No sign-up required.
            </p>
            <div className="mt-10" data-icod-id="src_pages_homepage_tsx_7500">
              <Link
                to="/convert"
                className={buttonClass({ size: 'lg' })}
                data-icod-id="src_pages_homepage_tsx_b5e8">
                Start Converting
                <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_homepage_tsx_1855" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer data-icod-id="src_pages_homepage_tsx_5be5" />
    </div>
  );
}
