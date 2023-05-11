import React, { ReactElement } from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

const PrimaryButton = ({
  children,
  ...props
} : ButtonProps): ReactElement => (
  <Button
    {...props}
    colorScheme="green"
    rightIcon={(() => <>💾</>)()}
    aria-label="Complete recordings"
    borderRadius="full"
    fontFamily="Silka"
    fontWeight="bold"
    p={6}
  >
    {children}
  </Button>
);

export default PrimaryButton;
