import { createContext, type ReactNode } from 'react';
import { useProjectsPanelModel } from './useProjectsPanelModel';

export const ProjectsPanelContext = createContext<ReturnType<typeof useProjectsPanelModel> | null>(
  null
);

export function ProjectsPanelProvider({ children }: { children: ReactNode }) {
  const value = useProjectsPanelModel();
  return (
    <ProjectsPanelContext.Provider value={value}>{children}</ProjectsPanelContext.Provider>
  );
}
