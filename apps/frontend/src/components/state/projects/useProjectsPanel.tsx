import { useContext } from 'react';
import { ProjectsPanelContext } from './ProjectsPanelContext';

export function useProjectsPanel() {
  const context = useContext(ProjectsPanelContext);
  if (!context) {
    throw new Error('useProjectsPanel must be used within ProjectsPanelProvider');
  }
  return context;
}
