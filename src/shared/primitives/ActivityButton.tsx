import React, { ReactElement } from 'react';
import { Box, IconButton, Tooltip, IconButtonProps } from '@chakra-ui/react';

const ActivityButton = ({ tooltipLabel, ...props }: IconButtonProps & { tooltipLabel?: string }): ReactElement => (
  <Tooltip label={tooltipLabel}>
    <Box>
      <IconButton {...props} />
    </Box>
  </Tooltip>
);

export default ActivityButton;
