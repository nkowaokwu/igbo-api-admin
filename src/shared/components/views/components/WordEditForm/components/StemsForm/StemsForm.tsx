import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import { Input } from '../../../../../../primitives';
import StemsFormInterface from './StemsFormInterface';

const StemsForm = ({ stems, setStems, control }: StemsFormInterface): ReactElement => (
  <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
    <Box className="flex items-center my-5 w-full justify-between">
      <Box className="flex flex-col">
        <FormHeader
          title="Word Stems"
          tooltip={`Root or stem Igbo words when combined with other stems create new words.
           Please add tone markings.`}
        />
      </Box>
      <Button
        colorScheme="teal"
        aria-label="Add Stem"
        minWidth="130px"
        onClick={() => setStems([...stems, ''])}
        leftIcon={<AddIcon />}
      >
        Add Stem
      </Button>
    </Box>
    {stems.length ? stems.map((stem, index) => (
      <Box className="list-container" key={stem}>
        <Controller
          render={(props) => (
            <Input
              {...props}
              className="form-input"
            />
          )}
          name={`stems[${index}]`}
          control={control}
          defaultValue={stems[index]}
        />
        <Button
          colorScheme="red"
          aria-label="Delete Stem"
          onClick={() => {
            const filteredStems = [...stems];
            filteredStems.splice(index, 1);
            setStems(filteredStems);
          }}
          className="ml-3"
          leftIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Box>
    )) : (
      <Box className="flex w-full justify-center">
        <p className="text-gray-600">No stems</p>
      </Box>
    )}
  </Box>
);
export default StemsForm;
