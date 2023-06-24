import React, { useState, useEffect, ReactElement } from 'react';
import { camelCase } from 'lodash';
import { Box, Heading } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import Support from 'src/Core/Dashboard/components/Support';
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
    network('/stats/full')
      .then(({ body }) => {
        const parsedBody = JSON.parse(body);
        const updatedStats = Object.entries(parsedBody).reduce(
          (finalStats, [key, value]: [string, { value: number }]) => ({
            ...finalStats,
            [camelCase(key)]: value.value,
          }),
          {},
        );
        setStats(updatedStats);
      })
      .catch(handleNoPermissionStatus);
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
