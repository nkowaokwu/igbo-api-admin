import React, { ReactElement } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { FiMic } from 'react-icons/fi';

const RecordButton = ({ onClick, path }: { onClick: () => void; path: string }): ReactElement => (
  <Tooltip label="Start recording">
    <IconButton
      aria-label="Record"
      icon={<FiMic color="white" />}
      variant="ghost"
      borderRadius="full"
      backgroundColor="red.400"
      _hover={{ backgroundColor: 'red.400' }}
      _active={{ backgroundColor: 'red.400' }}
      _focus={{ backgroundColor: 'red.400' }}
      padding="0px"
      data-test={`start-recording-button${path === 'headword' ? '' : `-${path}`}`}
      className="flex justify-center items-start"
      onClick={onClick}
    />
  </Tooltip>
);

export default RecordButton;
