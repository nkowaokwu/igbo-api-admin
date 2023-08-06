import React, { ReactElement } from 'react';
import { Text } from '@chakra-ui/react';

const PasswordRecovery = (): ReactElement => (
  <Text className="my-3 w-full lg:w-10/12">
    Please enter your registered email address and we will send a recovery link via email.
  </Text>
);

export default PasswordRecovery;
