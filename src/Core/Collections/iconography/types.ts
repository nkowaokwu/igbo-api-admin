import { ChakraProps } from '@chakra-ui/react';
import React from 'react';

export type IconProps = {
  className?: string;
  fill?: ChakraProps['fill'];
  height?: number;
  stroke?: React.CSSProperties['stroke'];
  strokeWidth?: React.CSSProperties['strokeWidth'];
  styles?: ChakraProps;
  width?: number;
};
