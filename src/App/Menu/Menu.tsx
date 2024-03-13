import React, { createElement, useContext, useMemo } from 'react';
import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { MenuItemLink, usePermissions } from 'react-admin';
import { withRouter } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getResourceObjects } from 'src/App/Resources';
import { ModalContext } from 'src/shared/contexts/ModalContext';

const Menu = () => {
  const permissions = usePermissions();
  const { onOpen } = useContext(ModalContext);
  const isOpen = useSelector((state) => state.admin.ui.sidebarOpen);
  const routes = useMemo(
    () => getResourceObjects(permissions?.permissions ? permissions.permissions : permissions, { onOpen }),
    [permissions],
  );

  return (
    <motion.div data-test="sidebar" hidden={!isOpen} initial={false} animate={{ width: isOpen ? '' : 0 }}>
      {routes.map(({ key, name, options, onClick, icon, exact = false }) => (
        <MenuItemLink
          key={key}
          to={`/${name}`}
          primaryText={options?.label || capitalize(name)}
          leftIcon={createElement(icon)}
          onClick={onClick}
          sidebarIsOpen={isOpen}
          exact={exact}
        />
      ))}
    </motion.div>
  );
};

export default withRouter(Menu);
