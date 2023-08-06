import React, { ReactElement } from 'react';
import { HStack, PinInput, PinInputField } from '@chakra-ui/react';

const ConfirmationCodeInput = ({ onComplete }: { onComplete: (value: string) => void }): ReactElement => (
  <HStack>
    <PinInput size="lg" type="alphanumeric" otp onComplete={onComplete}>
      <PinInputField data-test="first-input-code-verification" />
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
    </PinInput>
  </HStack>
);

export default ConfirmationCodeInput;
