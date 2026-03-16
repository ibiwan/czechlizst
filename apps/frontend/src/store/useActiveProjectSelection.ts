import { useMemo } from 'react';

import { useListProjectsQuery } from '@api';

import { useAppDispatch, useAppSelector } from './hooks';
import { setSelectedProjectId } from './mainPageSlice';


export function useActiveProjectSelection() {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector((state) => state.mainPage.selectedProjectId);

  const projectsQuery = useListProjectsQuery();
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects]
  );

  const activeProjectId = useMemo(() => {
    if (selectedProjectId === null) {
      return null;
    }
    return projects.some((project) => project.id === selectedProjectId) ? selectedProjectId : null;
  }, [projects, selectedProjectId]);

  function selectProject(projectId: number | null) {
    dispatch(setSelectedProjectId(projectId));
  }

  return {
    activeProjectId,
    projects,
    projectsQuery,
    selectedProjectId,
    selectProject
  };
}
