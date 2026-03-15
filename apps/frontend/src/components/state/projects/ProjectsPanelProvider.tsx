import { type ReactNode } from 'react';
import { ProjectsPanelContext } from './ProjectsPanelContext';
import { useProjectsPanelModel } from './useProjectsPanelModel';

export function ProjectsPanelProvider({ children }: { children: ReactNode }) {
  const value = useProjectsPanelModel();
  return (
    <ProjectsPanelContext.Provider value={value}>{children}</ProjectsPanelContext.Provider>
  );
}
