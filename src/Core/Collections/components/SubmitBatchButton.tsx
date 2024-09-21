import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Button } from '@chakra-ui/react';
import { LuSend } from 'react-icons/lu';

const SubmitBatchButton = ({
  isLoading,
  isClickEnabled = true,
  onClick,
  isDisabled,
  'aria-label': ariaLabel,
}: {
  isLoading: boolean;
  isClickEnabled?: boolean;
  onClick: () => void;
  isDisabled: boolean;
  'aria-label': string;
}): ReactElement => (
  <Button
    onClick={isLoading ? noop : isClickEnabled ? onClick : noop}
    aria-label={ariaLabel}
    isDisabled={isDisabled}
    isLoading={isLoading}
    rightIcon={<LuSend />}
  >
    Submit
  </Button>
);

export default SubmitBatchButton;
