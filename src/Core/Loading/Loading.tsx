import React, { ReactElement } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';

const Loading = ({ setPermissions } : { setPermissions: React.Dispatch<React.SetStateAction<any>> }): ReactElement => {
  const { permissions } = usePermissions();
  setPermissions(permissions);
  return (
    <Box height="100vh" width="100vw" display="flex" justifyContent="center" alignItems="center">
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" className="space-y-6">
        <Spinner color="green" size="xl" />
        <Text>Loading the page, please wait a moment</Text>
      </Box>
    </Box>
  );
};

export default Loading;
