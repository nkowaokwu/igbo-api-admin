import React, { ReactElement } from 'react';
import { Layout as ReactAdminLayout } from 'react-admin';
import AppBar from './components/AppBar';
import Toast from './components/Toast';

const Layout = (props: any): ReactElement => (
  <ReactAdminLayout
    {...props}
    appBar={AppBar}
    notification={Toast}
  />
);

export default Layout;
