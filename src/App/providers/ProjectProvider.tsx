import React, { useState, useEffect } from 'react';
import { noop } from 'lodash';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import Loading from 'src/Core/Loading';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { getAllUserProjects, getCurrentProject } from 'src/shared/ProjectAPI';

const auth = getAuth();

export const ProjectProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);

  const refetch = async () => {
    // Gets all projects to get the default project
    const userProjects = await getAllUserProjects();
    if (!localStorage.getItem(LocalStorageKeys.PROJECT_ID)) {
      localStorage.setItem(LocalStorageKeys.PROJECT_ID, userProjects[0]?.id?.toString() || '');
    }

    const project = await getCurrentProject();
    setCurrentProject(project);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          await refetch();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <ProjectContext.Provider value={{ ...(currentProject ?? {}), triggerRefetch: refetch }}>
      {isLoading ? <Loading setPermissions={noop} /> : children}
    </ProjectContext.Provider>
  );
};
