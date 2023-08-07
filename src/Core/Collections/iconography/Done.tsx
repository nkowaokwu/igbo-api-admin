import React from 'react';
import { chakra } from '@chakra-ui/react';
import { IconProps } from './types';

export const Done: React.FC<IconProps> = ({
  className,
  height = 8,
  stroke = 'grey',
  strokeWidth = 2,
  styles,
  width = 8,
}) => (
  <chakra.svg
    className={className}
    sx={styles}
    width={width}
    height={height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.7334 23.0668L12.4001 25.7335C12.9334 26.2668 13.7334 26.2668 14.2667 25.7335L28.4667 11.5335C29.0001 11.0002 29.0001 10.2002 28.4667 9.66683L25.5334 6.7335C25.0001 6.20016 24.2001 6.20016 23.6667 6.7335L21.3334 9.06683"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.6666 11.7334L13.3333 17.0667L9.79998 13.5334C9.26664 13.0001 8.46664 13.0001 7.93331 13.5334L4.99998 16.4667C4.46664 17.0001 4.46664 17.8001 4.99998 18.3334L7.19998 20.5334"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </chakra.svg>
);
