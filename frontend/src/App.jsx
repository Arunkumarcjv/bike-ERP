import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { ErrorBoundary } from './app/ErrorBoundary';
import { useAppStore } from './store';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      {/* Mounted at the root so pages outside AppShell (login, portal, DVI) can show toasts too */}
      <Toaster position="top-right" richColors theme={theme} />
    </ErrorBoundary>
  );
}
