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
} : {
  pills: (Word | NsibidiCharacter)[],
  onDelete: (index: number) => void,
  formName: string,
  control: Control
}): ReactElement => (
  <Box className="w-full space-x-2 flex flex-row flex-wrap items-center justify-start">
    {pills.map((pill, index) => (
      <>
        <input
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
          name={`${formName}.${index}.id`}
          ref={control.register}
          defaultValue={pill.id}
        />
        <WordPill
          {...pill}
          key={pill.id.toString()}
          index={index}
          onDelete={onDelete}
        />
      </>
    ))}
  </Box>
);

export default WordPills;
