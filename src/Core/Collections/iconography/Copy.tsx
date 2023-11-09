import { chakra } from '@chakra-ui/react';
import React from 'react';
import { IconProps } from './types';

export const Copy: React.FC<IconProps> = ({ className, height = 8, stroke = 'gray.500', styles, width = 8 }) => (
  <chakra.svg
    className={className}
    sx={{
      ...styles,
      '& path': {
        stroke,
      },
    }}
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.06699 2.16699C2.56994 2.16699 2.16699 2.56994 2.16699 3.06699V9.60032C2.16699 10.0974 2.56994 10.5003 3.06699 10.5003H5.50033V12.9337C5.50033 13.4307 5.90327 13.8337 6.40033 13.8337H12.9337C13.4307 13.8337 13.8337 13.4307 13.8337 12.9337V6.40033C13.8337 5.90327 13.4307 5.50033 12.9337 5.50033H10.5003V3.06699C10.5003 2.56994 10.0974 2.16699 9.60032 2.16699H3.06699ZM9.50033 5.50033V3.16699H3.16699V9.50033H5.50033V6.40033C5.50033 5.90327 5.90327 5.50033 6.40033 5.50033H9.50033ZM6.50033 10.0003V12.8337H12.8337V6.50033H10.0003H6.50033V10.0003Z"
      fill={stroke}
    />
  </chakra.svg>
);
