import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { Title } from 'react-admin';
import { getAuth } from 'firebase/auth';
import ProgressManager from './components/ProgressManager';

const auth = getAuth();

const Dashboard = (): ReactElement => {
  const { currentUser: user } = auth;
  return (
    <Box>
      <Title title="Igbo API Editor Platform" />
      <Box style={{ minHeight: '120vh' }} className="w-full" backgroundColor="gray.100" p={3}>
        <ProgressManager user={user} />
      </Box>
    </Box>
  );
};

export default Dashboard;
