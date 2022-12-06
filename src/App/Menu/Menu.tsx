import React, { createElement } from 'react';
import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { MenuItemLink, MenuProps, usePermissions } from 'react-admin';
import { withRouter } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { getResourceObjects } from 'src/App/Resources';

const Menu = ({ onMenuClick } : MenuProps) => {
  const permissions = usePermissions();
  const open = useSelector((state) => state.admin.ui.sidebarOpen);
  const routes = getResourceObjects(permissions);

  return (
    <Box>
      {routes.map(({ name, options = { label: '' }, icon }) => (
        <MenuItemLink
          key={name}
          to={`/${name}`}
          primaryText={options.label || capitalize(name)}
          leftIcon={createElement(icon)}
          onClick={onMenuClick}
          sidebarIsOpen={open}
        />
      ))}
    </Box>
  );
};

export default withRouter(Menu);
