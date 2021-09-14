import React, { ReactElement } from 'react';
import { useListContext } from 'react-admin';
import { Box, Heading, Text } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { startCase } from 'lodash';
import { CreateButton } from '../../shared/primitives';

const Empty = (): ReactElement => {
  const { basePath, resource } = useListContext();
  return (
    <Box className="flex flex-col justify-center items-center text-center pt-6 lg:py-12 lg:px-6">
      <Box className="flex flex-col justify-center items-center w-11/12 lg:w-8/12 lg:space-y-6 h-72">
        <WarningIcon w={12} h={12} color="gray.500" />
        <Box textAlign="center" m={1} className="lg:space-y-2">
          <Heading fontSize="xl">{`No ${startCase(resource)} available`}</Heading>
          <Text fontSize="lg">
            Create one or import from a file
          </Text>
          <CreateButton basePath={basePath} />
        </Box>
      </Box>
    </Box>
  );
};

export default Empty;
