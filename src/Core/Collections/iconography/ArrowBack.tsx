import { chakra } from '@chakra-ui/react';
import React from 'react';
import { IconProps } from './types';

export const ArrowBack: React.FC<IconProps> = ({ className, height = 8, stroke = 'gray.500', styles, width = 8 }) => (
  <chakra.svg
    className={className}
    sx={{
      ...styles,
      '& path': {
        fill: stroke,
      },
    }}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.233 4.4545C12.6723 4.89384 12.6723 5.60616 12.233 6.0455L7.40349 10.875H19.3125C19.9338 10.875 20.4375 11.3787 20.4375 12C20.4375 12.6213 19.9338 13.125 19.3125 13.125H7.40349L12.233 17.9545C12.6723 18.3938 12.6723 19.1062 12.233 19.5455C11.7937 19.9848 11.0813 19.9848 10.642 19.5455L3.892 12.7955C3.45267 12.3562 3.45267 11.6438 3.892 11.2045L10.642 4.4545C11.0813 4.01517 11.7937 4.01517 12.233 4.4545Z"
      fill={stroke}
    />
  </chakra.svg>
);
