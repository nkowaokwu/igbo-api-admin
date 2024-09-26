import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import { hasCrowdsourcerPermission } from 'src/shared/utils/permissions';
import ProgressManager from './components/ProgressManager';
import CrowdsourcingProgressManager from './components/CrowdsourcingProgressManager';

const Dashboard = (): ReactElement => {
  const permissions = usePermissions();
  if (permissions.loading) {
    return null;
  }

  const isCrowdsourcer = hasCrowdsourcerPermission(permissions?.permissions, true);
  return (
    <Box data-test="dashboard">
      <Box className="h-full w-full">
        {isCrowdsourcer ? <CrowdsourcingProgressManager /> : <ProgressManager />}
      </Box>
    </Box>
  );
};

export default Dashboard;
