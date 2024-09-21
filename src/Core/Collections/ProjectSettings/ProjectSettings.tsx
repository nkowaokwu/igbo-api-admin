import React, { ReactElement } from 'react';
import Settings from 'src/Core/Layout/components/Settings';
import GeneralSettings from 'src/Core/Collections/ProjectSettings/components/GeneralSettings';
import { ProjectContext } from 'src/App/contexts/ProjectContext';

const tabLabels = ['General'];
const tabPanels = [<GeneralSettings />];

const ProjectSettings = (): ReactElement => {
  const project = React.useContext(ProjectContext);
  return <Settings title={project?.title || 'Project'} tabLabels={tabLabels} tabPanels={tabPanels} />;
};

export default ProjectSettings;
