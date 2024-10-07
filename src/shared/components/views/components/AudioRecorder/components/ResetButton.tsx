import React, { ReactElement } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';

const ResetButton = ({ onClick, path }: { onClick: () => void; path: string }): ReactElement => (
  <Tooltip label="Reset recording">
    <IconButton
      aria-label="Reset recording"
      icon={<FiRefreshCw color="gray.600" />}
      data-test={`reset-recording-button${path === 'headword' ? '' : `-${path}`}`}
      backgroundColor="white"
      _hover={{ backgroundColor: 'white' }}
      onClick={onClick}
      borderRadius="full"
      variant="ghost"
    />
  </Tooltip>
);

export default ResetButton;
