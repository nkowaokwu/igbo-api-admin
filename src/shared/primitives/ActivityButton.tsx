import React, { ReactElement } from 'react';
import { Button, ButtonProps, Tooltip } from '@chakra-ui/react';

const ActivityButton = ({
  tooltipLabel,
  label,
  ...props
}: ButtonProps & { label: string; tooltipLabel?: string }): ReactElement => (
  <Tooltip label={tooltipLabel}>
    <Button {...props}>{label}</Button>
  </Tooltip>
);

export default ActivityButton;
