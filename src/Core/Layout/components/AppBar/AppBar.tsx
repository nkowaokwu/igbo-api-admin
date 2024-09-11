import React, { ReactElement } from 'react';
import { AppBar as DefaultAppBar } from 'react-admin';
import { Heading } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import ProjectSelector from 'src/Core/Layout/components/AppBar/components/ProjectSelector';
import Notifications from 'src/Core/Layout/components/Notifications';

const AppBar = ({ notifications, ...props }: { notifications: Interfaces.Notification[] }): ReactElement => (
  <DefaultAppBar
    sx={{
      '& .RaAppBar-title': {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
      '& .RaUserMenu-userButton': {
        border: 'none',
      },
    }}
    {...props}
    userMenu={false}
  >
    <Heading fontFamily="Silka" fontSize="lg" flex={1} id="react-admin-title" color="white" />
    <ProjectSelector />
    <Notifications notifications={notifications} />
  </DefaultAppBar>
);

export default AppBar;
