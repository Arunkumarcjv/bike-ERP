import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry = null,
  className = '',
}) {
  return (
    <div className={`p-6 bg-red-50/80 border border-red-200 rounded-card text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-red-100 text-status-red flex items-center justify-center mx-auto mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-status-red mb-1">{title}</h4>
      <p className="text-xs text-red-600/80 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} icon={RefreshCw}>
          Retry Operation
        </Button>
      )}
    </div>
  );
}
