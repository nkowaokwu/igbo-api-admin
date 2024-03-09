import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { Control } from 'react-hook-form';
import { NsibidiCharacter, Word } from 'src/backend/controllers/utils/interfaces';
import WordPill from './WordPill';

const WordPills = ({
  pills,
  onDelete,
  formName,
  control,
}: {
  pills: (Word | NsibidiCharacter)[];
  onDelete: (index: number) => void;
  formName: string;
  control: Control;
}): ReactElement => (
  <Box className="w-full grid grid-flow-row grid-cols-2 lg:grid-cols-3 gap-4 my-4">
    {pills.map((pill, index) => (
      <Box key={pill.id}>
        <input
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
          name={`${formName}.${index}.id`}
          ref={control.register}
          defaultValue={pill.id}
        />
        <WordPill {...pill} key={pill.id.toString()} index={index} onDelete={onDelete} />
      </Box>
    ))}
  </Box>
);

export default WordPills;
