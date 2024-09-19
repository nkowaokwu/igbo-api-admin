import React, { ReactElement } from 'react';
import { Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddAudioPronunciationButton = ({
  onClick,
}: {
  onClick: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[], shouldFocus?: boolean) => void;
}): ReactElement => (
  <Button aria-label="Add audio pronunciation" onClick={onClick} leftIcon={<AddIcon />} my={6}>
    Add Audio Pronunciation
  </Button>
);

export default AddAudioPronunciationButton;
