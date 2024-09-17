import React from 'react';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { IGBO_API_PROJECT_ID } from 'src/Core/constants';

const useIsIgboAPIProject = (): boolean => {
  const project = React.useContext(ProjectContext);
  return project?.id?.toString?.() === IGBO_API_PROJECT_ID;
};

export default useIsIgboAPIProject;
