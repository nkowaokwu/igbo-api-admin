import React, { memo, ReactElement, useState } from 'react';
import { AdminContext, AdminUI, Resource, usePermissions } from 'react-admin';
import { Route } from 'react-router-dom';
import { Dashboard, Layout, Error, Loading } from 'src/Core';
import Login from 'src/Login';
import { ProjectProvider } from 'src/App/providers/ProjectProvider';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { UserProjectPermissionProvider } from 'src/App/providers/UserProjectPermissionProvider';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { IGBO_API_PROJECT_ID } from 'src/Core/constants';
import { getResourceObjects, getCustomRouteObjects } from './Resources';
import Theme from './Theme';

const Resources = memo(() => {
  const [permissions, setPermissions] = useState(usePermissions());
  const project = React.useContext(ProjectContext);
  const isIgboAPIProject = project?.id?.toString() === IGBO_API_PROJECT_ID;
  const resources = getResourceObjects(permissions)
    .filter(
      (resource) =>
        isIgboAPIProject ||
        (!isIgboAPIProject &&
          resource.generalProject &&
          Boolean(project.types.filter((type) => resource.projectTypes.includes(type)).length)),
    )
    .map((resource) => <Resource key={resource.name} {...resource} />);

  const customRoutes = getCustomRouteObjects()
    .filter((resource) => isIgboAPIProject || (!isIgboAPIProject && resource.generalProject))
    .map((customRoute) => <Route key={customRoute.path} {...customRoute} />);

  return (
    <AdminContext dataProvider={dataProvider} authProvider={authProvider}>
      <AdminUI
        layout={(props) => <Layout {...props} error={Error} />}
        dashboard={Dashboard}
        loginPage={Login}
        loading={() => <Loading setPermissions={setPermissions} />}
        theme={Theme}
        customRoutes={customRoutes}
      >
        {resources}
      </AdminUI>
    </AdminContext>
  );
});

const IgboAPIAdmin = (): ReactElement => (
  <ProjectProvider>
    <UserProjectPermissionProvider>
      <Resources />
    </UserProjectPermissionProvider>
  </ProjectProvider>
);

export default IgboAPIAdmin;
