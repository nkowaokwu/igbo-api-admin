import React, { createElement, useMemo } from 'react';
import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { MenuItemLink, MenuProps, usePermissions } from 'react-admin';
import { withRouter } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getResourceObjects } from 'src/App/Resources';

const Menu = ({ onMenuClick }: MenuProps) => {
  const permissions = usePermissions();
  const isOpen = useSelector((state) => state.admin.ui.sidebarOpen);
  const routes = useMemo(
    () => getResourceObjects(permissions?.permissions ? permissions.permissions : permissions),
    [permissions],
  );

  return (
    <motion.div data-test="sidebar" hidden={!isOpen} initial={false} animate={{ width: isOpen ? '' : 0 }}>
      {routes.map(({ name, options = { label: '' }, icon, exact = false }) => (
        <MenuItemLink
          key={name}
          to={`/${name}`}
          primaryText={options.label || capitalize(name)}
          leftIcon={createElement(icon)}
          onClick={onMenuClick}
          sidebarIsOpen={isOpen}
          exact={exact}
        />
      ))}
    </motion.div>
  );
};

export default withRouter(Menu);
