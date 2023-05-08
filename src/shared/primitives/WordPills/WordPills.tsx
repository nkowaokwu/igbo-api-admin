import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { NsibidiCharacter, Word } from 'src/backend/controllers/utils/interfaces';
import WordPill from './WordPill';

const WordPills = ({
  pills,
  onDelete,
} : {
  pills: (Word | NsibidiCharacter)[],
  onDelete: (index: number) => void,
}): ReactElement => (
  <Box className="w-full space-x-2 flex flex-row flex-wrap items-center justify-start">
    {pills.map((pill, index) => (
      <WordPill
        {...pill}
        key={pill.id.toString()}
        index={index}
        onDelete={() => onDelete(index)}
      />
    ))}
  </Box>
);

export default WordPills;
