import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import { ChevronLeftIcon } from '@chakra-ui/icons';

const Profile = (): ReactElement => {
  const uid = useFirebaseUid();

  const handleOnBack = () => {
    window.location.hash = '#/';
  };

  return (
    <Box className="mb-24 p-6">
      <Button variant="ghost" leftIcon={<ChevronLeftIcon boxSize={4} />} onClick={handleOnBack}>
        Back
      </Button>
      <UserStat uid={uid} />
    </Box>
  );
};

export default Profile;
