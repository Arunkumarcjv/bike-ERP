import React from 'react';
import clsx from 'clsx';

/** AKASH Bajaj monogram (public/logo.svg), used in the sidebar, login and favicon. */
export function BrandLogo({ className = 'w-8 h-8' }) {
  return <img src="/logo.svg" alt="AKASH Bajaj" className={clsx('shrink-0 select-none', className)} draggable={false} />;
}
