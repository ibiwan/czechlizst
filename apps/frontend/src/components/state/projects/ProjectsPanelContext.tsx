import { createContext } from 'react';
import { useProjectsPanelModel } from './useProjectsPanelModel';

export const ProjectsPanelContext = createContext<ReturnType<typeof useProjectsPanelModel> | null>(
  null
);
