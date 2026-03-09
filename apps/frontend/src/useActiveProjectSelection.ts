import { useEffect, useMemo } from 'react';
import { useListProjectsQuery } from './api';
import { getActiveProjectId } from './activeProject';
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
  const activeProjectId = useMemo(
    () => getActiveProjectId(projects, selectedProjectId),
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (activeProjectId !== selectedProjectId) {
      dispatch(setSelectedProjectId(activeProjectId));
    }
  }, [activeProjectId, dispatch, selectedProjectId]);

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
