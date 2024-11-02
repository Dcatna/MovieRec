// src/contexts/RefreshContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface RefreshContextProps {
  shouldRefresh: boolean;
  setShouldRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  triggerSidebarRefresh: () => void;  // New function for triggering refresh
}

const RefreshContext = createContext<RefreshContextProps | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  const triggerSidebarRefresh = () => {
    setShouldRefresh(true);  // Trigger refresh when called
  };

  return (
    <RefreshContext.Provider value={{ shouldRefresh, setShouldRefresh, triggerSidebarRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = (): RefreshContextProps => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
