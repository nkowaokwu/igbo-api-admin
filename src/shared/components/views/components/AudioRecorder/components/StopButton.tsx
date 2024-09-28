import React, { ReactElement } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { FiStopCircle } from 'react-icons/fi';

const StopButton = ({ onClick, path }: { onClick: () => void; path: string }): ReactElement => (
  <Tooltip label="Stop recording">
    <IconButton
      aria-label="Stop"
      icon={<FiStopCircle color="white" />}
      borderRadius="full"
      backgroundColor="red.400"
      _hover={{ backgroundColor: 'red.400' }}
      _active={{ backgroundColor: 'red.400' }}
      _focus={{ backgroundColor: 'red.400' }}
      padding="0px"
      data-test={`stop-recording-button${path === 'headword' ? '' : `-${path}`}`}
      className="flex justify-center items-center"
      onClick={onClick}
    />
  </Tooltip>
);

export default StopButton;
