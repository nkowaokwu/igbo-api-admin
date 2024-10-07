import React, { ReactElement } from 'react';
import { Layout as ReactAdminLayout } from 'react-admin';
import Menu from 'src/App/Menu';
import Sidebar from 'src/Core/Layout/components/Sidebar';
import AppBar from './components/AppBar';
import Toast from './components/Toast';

const Layout = (props: any): ReactElement => (
  <ReactAdminLayout {...props} appBar={AppBar} notification={Toast} menu={Menu} sidebar={Sidebar} />
);

export default Layout;
