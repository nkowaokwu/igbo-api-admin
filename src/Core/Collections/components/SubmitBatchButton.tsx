import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { PrimaryButton } from 'src/shared/primitives';

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
  <PrimaryButton
    onClick={isLoading ? noop : isClickEnabled ? onClick : noop}
    aria-label={ariaLabel}
    isDisabled={isDisabled}
    isLoading={isLoading}
  >
    Submit
  </PrimaryButton>
);

export default SubmitBatchButton;
