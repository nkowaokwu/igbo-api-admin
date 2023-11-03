import React, { useState, useEffect, ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Support from 'src/Core/Dashboard/components/Support';
import { getUserStats } from 'src/shared/UserAPI';
import MilestoneProgress from './MilestoneProgress';

const NO_PERMISSION_STATUS = 403;
const ProgressManager = (): ReactElement => {
  const [stats, setStats] = useState({});

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      window.location.hash = '#/';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const updatedStats = await getUserStats();
        setStats(updatedStats);
      } catch (err) {
        handleNoPermissionStatus(err);
      }
    })();
  }, []);

  return (
    <Box p={3}>
      <Heading as="h1" className="mb-3">
        Dashboard
      </Heading>
      <Box className="flex flex-col-reverse lg:flex-row justify-between space-x-0 lg:space-x-4 w-full">
        {/* @ts-expect-error props */}
        <MilestoneProgress {...stats} />
        <Support />
      </Box>
    </Box>
  );
};

export default ProgressManager;
