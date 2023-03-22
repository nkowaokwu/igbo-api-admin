import React, { useState, ReactElement } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import { getWord } from 'src/shared/API';
import FormHeader from '../../../FormHeader';
import StemsFormInterface from './StemsFormInterface';
import Stems from './Stems';

const StemsForm = ({
  errors,
  stems,
  setStems,
  control,
  setValue,
  record,
} : StemsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateStems = (value) => {
    setStems(value);
    setValue('stems', value);
  };

  const canAddStem = (userInput) => (
    !stems.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddStem = async (userInput = input) => {
    try {
      if (canAddStem(userInput)) {
        const word = await getWord(userInput);
        updateStems([...stems, word.id]);
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add stem',
        description: 'You have provided either an invalid word id or a the current word\'s or parent word\'s id.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setInput('');
    }
  };
  return (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2 " height="fit-content">
      <Controller
        render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
        name="stems"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Word Stems"
          tooltip={`Root or stem Igbo words when combined with other stems create new words.
          Please add tone markings.`}
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="stem-search"
          placeholder="Search for stem or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddStem(e.id)}
        />
        <Tooltip label="Click this button to add the stem">
          <IconButton
            colorScheme="green"
            aria-label="Add stem"
            onClick={() => handleAddStem()}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <Stems stemIds={stems} updateStems={updateStems} />
      {errors.stems && (
        <p className="error">{errors.stems.message || errors.stems[0]?.message}</p>
      )}
    </Box>
  );
};

export default StemsForm;
