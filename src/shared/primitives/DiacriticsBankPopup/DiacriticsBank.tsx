import React, { ReactElement } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

const diacritics = [803, 768, 772, 775, 614];

const insertLetter = (inputRef, letter) => {
  const element = inputRef.current;
  const [start, end] = [element.selectionStart, element.selectionEnd];
  element.setRangeText(letter, start, end, 'select');
  element.dispatchEvent(new Event('change'));
};

const DiacriticsBank = (
  { inputRef }
  :{ inputRef: { current: HTMLElement } },
): ReactElement => {
  const INSTRUCTIONS_TEXT = `Type first a letter with the computer keyboard
  and click on the key to add the diacritic mark`;
  return (
    <Box className="flex flex-col">
      <Text className="px-2 text-sm text-gray-600 italic text-center">
        {INSTRUCTIONS_TEXT}
      </Text>
      <Box className="flex space-x-8 lg:space-x-6 pt-3 pb-4 overflow-x-scroll">
        {diacritics.map((diacritic) => {
          const diacriticString = String.fromCharCode(diacritic);
          return (
            <Button
              key={`diacritic-key-${diacriticString}`}
              onClick={() => insertLetter(inputRef, diacriticString)}
            >
              {diacriticString}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default DiacriticsBank;
