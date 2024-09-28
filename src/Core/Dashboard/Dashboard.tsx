import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import ProgressManager from './components/ProgressManager';

const Dashboard = (): ReactElement => {
  const permissions = usePermissions();
  if (permissions.loading) {
    return null;
  }

  return (
    <Box data-test="dashboard">
      <Box className="h-full w-full">
        <ProgressManager permissions={permissions} />
      </Box>
    </Box>
  );
};

export default Dashboard;
