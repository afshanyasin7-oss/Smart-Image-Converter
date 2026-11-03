import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import PageLoader from '@/components/ui/PageLoader';
import { useAppSelector } from '@/store/hooks';

const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const IntegrationPage = lazy(() => import('./pages/IntegrationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  // Toggle dark class on html element when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ToastProvider data-icod-id="src_app_tsx_5aae">
      <div className="min-h-screen bg-background" data-icod-id="src_app_tsx_0c1c">
        <BrowserRouter>
          <Suspense fallback={<PageLoader data-icod-id="src_app_tsx_2075" />}>
            <Routes>
              <Route path="/" element={<HomePage data-icod-id="src_app_tsx_893e" />} />
              <Route path="/convert" element={<UploadPage data-icod-id="src_app_tsx_294c" />} />
              <Route path="/integration" element={<IntegrationPage data-icod-id="src_app_tsx_bfcb" />} />
              <Route path="*" element={<NotFoundPage data-icod-id="src_app_tsx_859e" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </ToastProvider>
  );
}
