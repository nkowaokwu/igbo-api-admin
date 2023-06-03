import React, { ReactElement } from 'react';
import { Box, Spinner as ChakraSpinner, SpinnerProps } from '@chakra-ui/react';

const Spinner = (props: SpinnerProps): ReactElement => (
  <Box
    width="full"
    height="full"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <ChakraSpinner color="green" {...props} />
  </Box>
);

export default Spinner;
