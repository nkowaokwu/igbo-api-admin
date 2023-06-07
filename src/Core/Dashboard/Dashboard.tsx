import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import { getAuth } from 'firebase/auth';
import { hasCrowdsourcerPermission } from 'src/shared/utils/permissions';
import ProgressManager from './components/ProgressManager';
import CrowdsourcingProgressManager from './components/CrowdsourcingProgressManager';

const auth = getAuth();

const Dashboard = (): ReactElement => {
  const { currentUser: user } = auth;
  const permissions = usePermissions();
  if (permissions.loading) {
    return null;
  }

  const isCrowdsourcer = hasCrowdsourcerPermission(permissions?.permissions, true);
  return (
    <Box>
      <Box style={{ minHeight: '100vh' }} className="w-full">
        {isCrowdsourcer ? <CrowdsourcingProgressManager user={user} /> : <ProgressManager user={user} />}
      </Box>
    </Box>
  );
};

export default Dashboard;
