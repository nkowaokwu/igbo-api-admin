import React, { ReactElement } from 'react';
import { Box, Divider, Text } from '@chakra-ui/react';

const OrDivider = (): ReactElement => (
  <Box display="flex" width="full" alignItems="center" mb="4">
    <Divider />
    <Text flex="1" px={2} m={0} color="gray.400" width="full" textAlign="center">
      or
    </Text>
    <Divider />
  </Box>
);

export default OrDivider;
