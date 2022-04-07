import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const FormHeader = (
  { title, tooltip, onClick }
  : { title: string, tooltip: string, onClick?: () => any },
): ReactElement => (
  <Box
    className={`flex flex-row items-center${onClick ? ' cursor-pointer' : ''}`}
    onClick={onClick || noop}
  >
    <h2 className={`form-header${onClick ? ' hover:underline' : ''}`}>{title}</h2>
    <Tooltip label={tooltip}>
      <InfoOutlineIcon color="gray.600" className="ml-2" />
    </Tooltip>
  </Box>
);

FormHeader.defaultProps = {
  onClick: null,
};

export default FormHeader;
