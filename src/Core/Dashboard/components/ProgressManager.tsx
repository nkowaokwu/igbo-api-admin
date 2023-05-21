import React, { useState, useEffect, ReactElement } from 'react';
import { camelCase } from 'lodash';
import { Box } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import MilestoneProgress from './MilestoneProgress';
import UserStat from './UserStat';

const NO_PERMISSION_STATUS = 403;
const ProgressManager = ({ user } : { user: { uid: string } }): ReactElement => {
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
        const updatedStats = Object.entries(parsedBody).reduce((
          finalStats,
          [key, value]: [string, { value: number }],
        ) => ({
          ...finalStats,
          [camelCase(key)]: value.value,
        }), {});
        setStats(updatedStats);
      })
      .catch(handleNoPermissionStatus);
  }, []);

  return (
    <Box p={3}>
      <Box className="mb-24">
        <UserStat uid={user?.uid} {...stats} />
      </Box>
      {/* @ts-expect-error props */}
      <MilestoneProgress {...stats} />
    </Box>
  );
};

export default ProgressManager;
