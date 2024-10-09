import React, { useEffect, ReactElement } from 'react';
import { Box, Spinner, Text, usePrevious } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';

const Loading = ({ setPermissions }: { setPermissions: React.Dispatch<React.SetStateAction<any>> }): ReactElement => {
  const { permissions } = usePermissions();
  const prevPermissions = usePrevious(permissions);

  useEffect(() => {
    if (permissions?.role) {
      setPermissions(permissions);
    } else if (!permissions?.role && prevPermissions !== permissions) {
      window.location.hash = '#/login';
    }
  }, [permissions]);

  return (
    <Box height="100vh" width="100vw" display="flex" justifyContent="center" alignItems="center">
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" className="space-y-6">
        <Spinner size="xl" />
        <Text>Loading the page, please wait a moment</Text>
      </Box>
    </Box>
  );
};

export default Loading;
