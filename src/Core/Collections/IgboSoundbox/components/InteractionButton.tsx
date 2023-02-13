import React, { ReactElement } from 'react';
import { Button } from '@chakra-ui/react';

const InteractionButton = ({
  ariaLabel,
  onClick,
  rightIcon,
  children,
} : {
  ariaLabel: string,
  onClick: () => void,
  rightIcon: ReactElement,
  children: any,
}): ReactElement => (
  <Button
    onClick={onClick}
    rightIcon={rightIcon}
    aria-label={ariaLabel}
    backgroundColor="gray.200"
    borderRadius="full"
    fontFamily="Silka"
    fontWeight="bold"
    _hover={{
      color: 'green.300',
    }}
    _active={{
      color: 'green.300',
    }}
    _focus={{
      color: 'green.300',
    }}
    p={6}
  >
    {children}
  </Button>
);

export default InteractionButton;
