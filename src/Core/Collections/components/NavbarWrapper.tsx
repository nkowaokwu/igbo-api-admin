import React, { ReactElement } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

const NavbarWrapper = ({ children, className, ...props }: BoxProps): ReactElement => (
  <Box
    className={`bg-white w-full h-16 flex flex-row items-center ${className}`}
    borderBottomColor="gray.200"
    borderBottomWidth="1px"
    {...props}
  >
    {children}
  </Box>
);

export default NavbarWrapper;
