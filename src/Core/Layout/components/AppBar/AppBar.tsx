import React, { ReactElement } from 'react';
import { AppBar as DefaultAppBar } from 'react-admin';
import { Heading } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import Notifications from '../Notifications';

const AppBar = ({ notifications, ...props } : { notifications: Interfaces.Notification[] }): ReactElement => (
  <DefaultAppBar
    sx={{
      '& .RaAppBar-title': {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
    }}
    {...props}
  >
    <Heading
      fontFamily="Silka"
      fontSize="lg"
      flex={1}
      id="react-admin-title"
      color="white"
    />
    <Notifications notifications={notifications} />
  </DefaultAppBar>
);

export default AppBar;
