import React, { ReactElement } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react';

const ActivityButton = ({
  tooltipLabel,
  ...props
}: IconButtonProps & { tooltipLabel?: string }): ReactElement => (
  <Tooltip label={tooltipLabel}>
    <IconButton
      variant="ghost"
      _hover={{
        backgroundColor: 'white',
      }}
      _active={{
        backgroundColor: 'white',
      }}
      _focus={{
        backgroundColor: 'white',
      }}
      {...props}
    />
  </Tooltip>
);

export default ActivityButton;
