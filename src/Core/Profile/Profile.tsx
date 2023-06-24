import React, { useEffect, useState, ReactElement } from 'react';
import { camelCase } from 'lodash';
import { Box, Button } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import { ChevronLeftIcon } from '@chakra-ui/icons';

const NO_PERMISSION_STATUS = 403;

const handleNoPermissionStatus = ({ status }) => {
  if (status === NO_PERMISSION_STATUS) {
    window.location.hash = '#/';
  }
};

const Profile = (): ReactElement => {
  const [stats, setStats] = useState<{ dialectalVariations: any[]; completeExamples: any[] }>({
    dialectalVariations: [],
    completeExamples: [],
  });
  const uid = useFirebaseUid();

  const handleOnBack = () => {
    window.location.hash = '#/';
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
    <Box className="mb-24 p-6">
      <Button variant="ghost" leftIcon={<ChevronLeftIcon boxSize={4} />} onClick={handleOnBack}>
        Back
      </Button>
      <UserStat uid={uid} {...stats} />
    </Box>
  );
};

export default Profile;
