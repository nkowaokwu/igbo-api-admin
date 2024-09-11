import React, { memo, ReactElement, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AdminContext, AdminUI, Resource, usePermissions } from 'react-admin';
import { Route } from 'react-router-dom';
import { Dashboard, Layout, Error, Loading } from 'src/Core';
import Login from 'src/Login';
import { ProjectProvider } from 'src/App/providers/ProjectProvider';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { UserProjectPermissionProvider } from 'src/App/providers/UserProjectPermissionProvider';
import { getResourceObjects, getCustomRouteObjects } from './Resources';
import Theme from './Theme';

const Resources = memo(
  () => {
    const [permissions, setPermissions] = useState(usePermissions());
    const resources = getResourceObjects(permissions).map((resource) => <Resource key={resource.name} {...resource} />);
    const customRoutes = getCustomRouteObjects(permissions).map((customRoute) => (
      <Route key={customRoute.path} {...customRoute} />
    ));

    return (
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
    );
  },
  () => true,
);

const IgboAPIAdmin = (): ReactElement => (
  <Box>
    <AdminContext dataProvider={dataProvider} authProvider={authProvider}>
      <ProjectProvider>
        <UserProjectPermissionProvider>
          <Resources />
        </UserProjectPermissionProvider>
      </ProjectProvider>
    </AdminContext>
  </Box>
);

export default IgboAPIAdmin;
