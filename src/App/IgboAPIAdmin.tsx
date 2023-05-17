import React, { memo, ReactElement, useState } from 'react';
import { Box } from '@chakra-ui/react';
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
import { getResourceObjects } from './Resources';
import Theme from './Theme';

const Resources = memo(() => {
  const [permissions, setPermissions] = useState(usePermissions());
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
