import { Button, GridItem, ChakraProps } from '@chakra-ui/react';
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  styles: ChakraProps['sx'];
};

export const LeaderboardRenderer: React.FC<Props> = ({ children, className, onClick, styles }) => {
  const sx: ChakraProps['sx'] = {
    ...styles,
    borderRadius: 'md',
    fontFamily: 'Silka',
    fontSize: 14,
    fontWeight: 'semibold',
    height: [20, 28, 36],
    padding: 2,
  };
  const buttonStyles: ChakraProps['sx'] = {
    ...styles,
    alignItems: 'flex-start',
    display: 'flex',
    height: '100%',
    justifyContent: 'flex-start',
    padding: 0,
    position: 'relative',
    textAlign: 'left',
    whiteSpace: 'unset',
    width: '100%',
  };

  return (
    <GridItem className={className} sx={sx}>
      <Button _hover={{ bgColor: 'inherit' }} _focus={{ outlineStyle: 'none' }} sx={buttonStyles} onClick={onClick}>
        {children}
      </Button>
    </GridItem>
  );
};
