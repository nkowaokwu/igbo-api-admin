import React, { ReactElement } from 'react';
import { Box, Button, ButtonProps, Tooltip } from '@chakra-ui/react';

const ActivityButton = ({
  tooltipLabel,
  label,
  ...props
}: ButtonProps & { label: string; tooltipLabel?: string }): ReactElement => (
  <Tooltip label={tooltipLabel}>
    <Box>
      <Button {...props}>{label}</Button>
    </Box>
  </Tooltip>
);

export default ActivityButton;
