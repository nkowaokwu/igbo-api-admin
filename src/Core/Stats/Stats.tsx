import React, { useState, useEffect, ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { getUserStats } from 'src/shared/UserAPI';
import MilestoneProgress from './components/MilestoneProgress';

const NO_PERMISSION_STATUS = 403;

const Stats = (): ReactElement => {
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
    <Box className="flex flex-col-reverse lg:flex-row justify-between space-x-0 lg:space-x-4 w-full">
      {/* @ts-expect-error props */}
      <MilestoneProgress {...stats} />
    </Box>
  );
};

export default Stats;
