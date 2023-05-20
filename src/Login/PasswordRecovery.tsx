import React, { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';

const PasswordRecovery = (props: any): ReactElement => (
  <Box {...props}>
    <Text width="full" className="my-3">
      Please enter your registered email address and we will send a recovery link via email.
    </Text>
  </Box>
);

export default PasswordRecovery;
