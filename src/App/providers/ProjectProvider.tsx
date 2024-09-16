import React, { useState, useEffect } from 'react';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { getAllProjects, getCurrentProject } from 'src/shared/ProjectAPI';

export const ProjectProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const localProjectId = localStorage.getItem(LocalStorageKeys.PROJECT_ID);

  useEffect(() => {
    (async () => {
      // Gets all projects to get the default project
      const userProjects = await getAllProjects();
      if (!localProjectId) {
        localStorage.setItem(LocalStorageKeys.PROJECT_ID, userProjects[0]?.id?.toString() || '');
      }

      const project = await getCurrentProject();
      setCurrentProject(project);
    })();
  }, [localProjectId]);

  return <ProjectContext.Provider value={currentProject}>{children}</ProjectContext.Provider>;
};
