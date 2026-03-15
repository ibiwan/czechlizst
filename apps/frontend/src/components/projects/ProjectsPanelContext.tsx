/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';
import { useProjectsPanelModel } from './useProjectsPanelModel';

type ProjectsPanelContextValue = ReturnType<typeof useProjectsPanelModel>;

const ProjectsPanelContext = createContext<ProjectsPanelContextValue | null>(null);

export function ProjectsPanelProvider({ children }: { children: React.ReactNode }) {
  const model = useProjectsPanelModel();
  return <ProjectsPanelContext.Provider value={model}>{children}</ProjectsPanelContext.Provider>;
}

export function useProjectsPanel() {
  const context = useContext(ProjectsPanelContext);
  if (!context) {
    throw new Error('useProjectsPanel must be used within ProjectsPanelProvider');
  }
  return context;
}
