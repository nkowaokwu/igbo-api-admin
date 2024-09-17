import React, { ReactElement } from 'react';
import { Box, Button, Tooltip, ButtonProps } from '@chakra-ui/react';

const ActivityButton = ({
  tooltipLabel,
  label,
  ...props
}: ButtonProps & { tooltipLabel?: string; label: string }): ReactElement => (
  <Tooltip label={tooltipLabel}>
    <Box>
      <Button {...props}>{label}</Button>
    </Box>
  </Tooltip>
);

export default ActivityButton;
