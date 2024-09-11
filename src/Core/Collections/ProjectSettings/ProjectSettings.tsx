import React, { ReactElement } from 'react';
import Settings from 'src/Core/Layout/components/Settings';
import GeneralSettings from 'src/Core/Collections/ProjectSettings/components/GeneralSettings';

const tabLabels = ['General'];
const tabPanels = [<GeneralSettings />];

const ProjectSettings = (): ReactElement => <Settings title="Project" tabLabels={tabLabels} tabPanels={tabPanels} />;

export default ProjectSettings;
