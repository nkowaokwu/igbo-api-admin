import React, { useState, useEffect } from 'react';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import { getCurrentProject } from 'src/shared/ProjectAPI';

export const ProjectProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  useEffect(() => {
    (async () => {
      const project = await getCurrentProject();
      setCurrentProject(project);
    })();
  }, []);

  return <ProjectContext.Provider value={currentProject}>{children}</ProjectContext.Provider>;
};
