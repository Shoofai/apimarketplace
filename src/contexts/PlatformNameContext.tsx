'use client';

import { createContext, useContext } from 'react';

const PlatformNameContext = createContext<string>('LukeAPI');

export function PlatformNameProvider({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <PlatformNameContext.Provider value={name || 'LukeAPI'}>
      {children}
    </PlatformNameContext.Provider>
  );
}

export function usePlatformName(): string {
  return useContext(PlatformNameContext);
}
