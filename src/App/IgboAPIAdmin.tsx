import React, {
  memo,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { Box, useToast } from '@chakra-ui/react';
import {
  AdminContext,
  AdminUI,
  Resource,
  usePermissions,
} from 'react-admin';
import {
  Dashboard,
  Layout,
  Error,
  NotFound,
  Loading,
} from 'src/Core';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { hasAccessToPlatformPermissions } from 'src/shared/utils/permissions';
import { getResourceObjects } from './Resources';
import Theme from './Theme';

const Resources = memo(() => {
  const [permissions, setPermissions] = useState(usePermissions());
  const toast = useToast();
  const resources = getResourceObjects(permissions).map((resource) => (
    <Resource
      name={resource.name}
      options={resource.options}
      key={resource.key}
      list={resource.list}
      show={resource.show}
      edit={resource.edit}
      create={resource.create}
      icon={resource.icon}
    />
  ));

  useEffect(() => {
    if (permissions) {
      const hasPermission = hasAccessToPlatformPermissions(permissions, true);
      if (!hasPermission) {
        authProvider.logout();
        if (permissions?.role) {
          toast({
            title: 'Insufficient permissions',
            description: 'You\'re account doesn\'t have the necessary permissions to access the platform.',
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
        }
      }
    }
  }, [permissions]);

  return (
    <AdminUI
      layout={(props) => <Layout {...props} error={Error} />}
      dashboard={Dashboard}
      loginPage={Login}
      loading={() => <Loading setPermissions={setPermissions} />}
      theme={Theme}
    >
      {resources}
    </AdminUI>
  );
}, () => true);

const IgboAPIAdmin = (): ReactElement => (
  // @ts-expect-error Cypress
  <Box className={!!window.Cypress ? 'testing-app' : ''}>
    <AdminContext
      dataProvider={dataProvider}
      authProvider={authProvider}
      catchAll={NotFound}
    >
      <Resources />
    </AdminContext>
  </Box>
);

export default IgboAPIAdmin;
