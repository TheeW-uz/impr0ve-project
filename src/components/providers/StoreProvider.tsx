'use client';

import * as React from 'react';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-gray-900 min-h-screen" />;
  }

  return <>{children}</>;
}
