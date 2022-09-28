import React, { ReactElement } from 'react';
import { Layout as ReactAdminLayout } from 'react-admin';
import AppBar from './components/AppBar';

const Layout = (props: any): ReactElement => (
  <ReactAdminLayout
    {...props}
    appBar={AppBar}
  />
);

export default Layout;
