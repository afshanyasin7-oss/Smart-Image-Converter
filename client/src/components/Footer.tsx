import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-black/[0.04] px-6 py-12 lg:px-8"
      role="contentinfo"
      data-icod-id="src_components_footer_tsx_eb84">
      <div
        className="mx-auto max-w-7xl"
        data-icod-id="src_components_footer_tsx_a2a6">
        <div
          className="flex flex-col items-center justify-between gap-6 md:flex-row"
          data-icod-id="src_components_footer_tsx_fc58">
          {/* Brand */}
          <span
            className="font-serif text-lg tracking-tight text-foreground"
            data-icod-id="src_components_footer_tsx_7442">
            Smart Converter
          </span>

          {/* Page links */}
          <nav
            aria-label="Footer navigation"
            className="flex gap-6"
            data-icod-id="src_components_footer_tsx_da44">
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              data-icod-id="src_components_footer_tsx_92e0">
              Home
            </Link>
            <Link
              to="/convert"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              data-icod-id="src_components_footer_tsx_8a5f">
              Convert
            </Link>
            <Link
              to="/integration"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              data-icod-id="src_components_footer_tsx_355a">
              Integration
            </Link>
          </nav>

          {/* Copyright & tech credit */}
          <div
            className="text-right text-sm text-muted-foreground"
            data-icod-id="src_components_footer_tsx_b5cc">
            <p data-icod-id="src_components_footer_tsx_510c">&copy; {year} Smart Converter</p>
            <p
              className="mt-1 text-xs opacity-70"
              data-icod-id="src_components_footer_tsx_544d">Powered by AI OCR</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
