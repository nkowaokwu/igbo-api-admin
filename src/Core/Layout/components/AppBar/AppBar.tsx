import React, { ReactElement } from 'react';
import { AppBar as DefaultAppBar } from 'react-admin';
import { Heading } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import UserMenu from './UserMenu';

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
    userMenu={<UserMenu />}
  >
    <Heading fontFamily="Silka" fontSize="lg" flex={1} id="react-admin-title" color="white" />
  </DefaultAppBar>
);

export default AppBar;
