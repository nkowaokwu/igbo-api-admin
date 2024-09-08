import React, { memo, ReactElement, Suspense, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AdminContext, AdminUI, Resource, usePermissions } from 'react-admin';
import { Route } from 'react-router-dom';
import { Dashboard, Layout, Error, Loading } from 'src/Core';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { getResourceObjects, getCustomRouteObjects, getUnauthenticatedRoutes } from './Resources';
import Theme from './Theme';

const Resources = memo(
  () => {
    const [permissions, setPermissions] = useState(usePermissions());
    const resources = getResourceObjects(permissions).map((resource) => <Resource key={resource.name} {...resource} />);
    const customRoutes = getCustomRouteObjects().map((customRoute) => <Route {...customRoute} />);
    const unauthenticatedRoutes = getUnauthenticatedRoutes().map((unauthenticatedRoute) => (
      <Route {...unauthenticatedRoute} />
    ));

    return (
      <AdminUI
        layout={(props) => <Layout {...props} error={Error} />}
        dashboard={Dashboard}
        loginPage={Login}
        loading={() => <Loading setPermissions={setPermissions} />}
        theme={Theme}
        customRoutes={customRoutes.concat(unauthenticatedRoutes)}
      >
        {resources}
      </AdminUI>
    );
  },
  () => true,
);

const IgboAPIAdmin = (): ReactElement => (
  <Suspense
    fallback={(() => (
      <></>
    ))()}
  >
    {/* @ts-expect-error Cypress */}
    <Box className={!!window.Cypress ? 'testing-app' : ''}>
      <AdminContext dataProvider={dataProvider} authProvider={authProvider}>
        <Resources />
      </AdminContext>
    </Box>
  </Suspense>
);

export default IgboAPIAdmin;
