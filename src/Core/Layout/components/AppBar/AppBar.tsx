import React, { ReactElement } from 'react';
import { AppBar as DefaultAppBar } from 'react-admin';
import { Heading } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import ProjectSelector from 'src/Core/Layout/components/AppBar/components/ProjectSelector';

const AppBar = ({ notifications, ...props }: { notifications: Interfaces.Notification[] }): ReactElement => (
  <DefaultAppBar
    sx={{
      '& .RaAppBar-title': {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        color: 'var(--chakra-colors-gray-700)',
      },
    }}
    {...props}
    userMenu={false}
  >
    <Heading fontFamily="Silka" fontSize="lg" flex={1} id="react-admin-title" color="white" />
    <ProjectSelector />
  </DefaultAppBar>
);

export default AppBar;
