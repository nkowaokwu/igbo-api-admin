import React, { ReactElement } from 'react';
import { Box, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const FormHeader = ({ title, tooltip } : { title: string, tooltip: string }): ReactElement => (
  <Box className="flex flex-row items-center">
    <h2 className="form-header">{title}</h2>
    <Tooltip label={tooltip}>
      <InfoOutlineIcon color="gray.600" className="ml-2" />
    </Tooltip>
  </Box>
);

export default FormHeader;
