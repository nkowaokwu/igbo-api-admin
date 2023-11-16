import React, { memo, ReactElement, useContext, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AdminContext, AdminUI, Resource, usePermissions } from 'react-admin';
import { Route } from 'react-router-dom';
import { Dashboard, Layout, Error, NotFound, Loading } from 'src/Core';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';
import { Modal } from '../Core/Modal/Modal';
import { ModalContext } from '../shared/contexts/ModalContext';
import { getResourceObjects, getCustomRouteObjects } from './Resources';
import Theme from './Theme';

const Resources = memo(
  () => {
    const { onOpen } = useContext(ModalContext);
    const [permissions, setPermissions] = useState(usePermissions());
    const resources = getResourceObjects(permissions, { onOpen }).map((resource) => (
      <Resource key={resource.name} {...resource} />
    ));
    const customRoutes = getCustomRouteObjects().map((customRoute) => <Route {...customRoute} />);

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

const IgboAPIAdmin = (): ReactElement => {
  const { component, onClose, render } = React.useContext(ModalContext);
  return (
    <>
      {/* // @ts-expect-error Cypress */}
      <Box className={!!window.Cypress ? 'testing-app' : ''}>
        <AdminContext dataProvider={dataProvider} authProvider={authProvider} catchAll={NotFound}>
          <Resources />
        </AdminContext>
      </Box>
      <Modal onClose={onClose} render={render}>
        {component}
      </Modal>
    </>
  );
};

export default IgboAPIAdmin;
