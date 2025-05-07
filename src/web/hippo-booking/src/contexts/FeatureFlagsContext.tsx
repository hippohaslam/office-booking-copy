import { createContext, useContext, ReactNode } from 'react';

interface FeatureFlags {
  waitingListFeature: boolean;
}

const defaultFlags: FeatureFlags = {
  waitingListFeature: import.meta.env.VITE_FEATURE_WAITING_LIST === 'true',
};

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FeatureFlagsContext.Provider value={defaultFlags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext); 