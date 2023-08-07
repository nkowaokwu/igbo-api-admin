import { chakra } from '@chakra-ui/react';
import React from 'react';
import { IconProps } from './types';

export const Maginifier: React.FC<IconProps> = ({
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
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.75 11C5.75 8.1005 8.1005 5.75 11 5.75C13.8995 5.75 16.25 8.1005 16.25 11C16.25 12.4475 15.6652 13.7569 14.7172 14.7074C13.766 15.6612 12.4525 16.25 11 16.25C8.1005 16.25 5.75 13.8995 5.75 11ZM11 4.25C7.27208 4.25 4.25 7.27208 4.25 11C4.25 14.7279 7.27208 17.75 11 17.75C12.5935 17.75 14.0588 17.1971 15.2132 16.2739L18.4697 19.5303C18.7626 19.8232 19.2374 19.8232 19.5303 19.5303C19.8232 19.2374 19.8232 18.7626 19.5303 18.4697L16.2739 15.2132C17.1971 14.0588 17.75 12.5934 17.75 11C17.75 7.27208 14.7279 4.25 11 4.25Z"
      fill={stroke}
      strokeWidth={strokeWidth}
    />
  </chakra.svg>
);
