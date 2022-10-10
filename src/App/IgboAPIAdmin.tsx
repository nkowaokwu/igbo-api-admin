import React, { ReactElement, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AdminContext, AdminUI, Resource } from 'react-admin';
import { useLocation } from 'react-router-dom';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import {
  Dashboard,
  Layout,
  Error,
  NotFound,
} from 'src/Core';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { resourceObjects } from './Resources';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      // Saves the last visited route
      if (window.location.hash !== '#/login') {
        localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    setResources(resourceObjects);
  }, []);

  return (
    <AdminUI
      layout={(props) => <Layout {...props} error={Error} />}
      dashboard={Dashboard}
      loginPage={Login}
    >
      {resources.map((resource) => (
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
      ))}
    </AdminUI>
  );
};

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
