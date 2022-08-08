import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, Heading, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const FormHeader = (
  {
    title,
    tooltip,
    color,
    onClick,
  }
  : { title: string, tooltip?: string, color?: string, onClick?: () => any },
): ReactElement => (
  <Box
    className={`flex flex-row items-center${onClick ? ' cursor-pointer' : ''}`}
    onClick={onClick || noop}
  >
    <Heading
      as="h2"
      className={`form-header${onClick ? ' hover:underline' : ''}`}
      fontSize="xl"
      fontWeight="normal"
      color={color}
    >
      {title}
    </Heading>
    {tooltip ? (
      <Tooltip label={tooltip}>
        <InfoOutlineIcon color={color} className="ml-2" />
      </Tooltip>
    ) : null}
  </Box>
);

FormHeader.defaultProps = {
  tooltip: '',
  color: 'gray.700',
  onClick: null,
};

export default FormHeader;
