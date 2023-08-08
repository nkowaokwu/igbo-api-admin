import { chakra } from '@chakra-ui/react';
import React from 'react';
import { IconProps } from './types';

export const Microphone: React.FC<IconProps> = ({
  className,
  height = 8,
  stroke = 'gray.500',
  strokeWidth = 2,
  styles,
  width = 8,
}) => (
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
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 26.3333H13C9.66667 26.3333 7 23.6667 7 20.3333V15"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.0005 15V20.3333C25.0005 22.0667 24.2671 23.6667 23.0671 24.7333"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 29.9998V26.6665" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path
      d="M15.9996 20.0002C16.736 20.0002 17.3329 19.4032 17.3329 18.6668C17.3329 17.9304 16.736 17.3335 15.9996 17.3335C15.2632 17.3335 14.6663 17.9304 14.6663 18.6668C14.6663 19.4032 15.2632 20.0002 15.9996 20.0002Z"
      fill={stroke}
    />
    <path
      d="M11 9.26667V5C11 3.86667 11.8667 3 13 3H19C20.1333 3 21 3.86667 21 5V20.3333C21 21.4667 20.1333 22.3333 19 22.3333H13C11.8667 22.3333 11 21.4667 11 20.3333V13.2667"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M21 15H11" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M12 30H20" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </chakra.svg>
);
