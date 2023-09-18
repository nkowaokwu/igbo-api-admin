import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import { compact } from 'lodash';
import { Control, useFieldArray } from 'react-hook-form';
import { Input, WordPills } from 'src/shared/primitives';
import { getNsibidiCharacter, resolveNsibidiCharacter } from 'src/shared/API';
import Collections from 'src/shared/constants/Collection';
import FormHeader from '../../../FormHeader';
import RadicalsFormInterface from './RadicalsFormInterface';

const Radicals = ({
  radicalIds,
  remove,
  control,
}: {
  radicalIds: { id: string }[];
  remove: (index: number) => void;
  control: Control;
}) => {
  const [resolvedRadicals, setResolvedRadicals] = useState(null);
  const [isLoadingRadicals, setIsLoadingRadicals] = useState(false);

  const resolveRadicals = async () => {
    const shouldResolve =
      resolvedRadicals?.length !== radicalIds.length ||
      !radicalIds.every(({ id }) => resolvedRadicals.find(({ id: resolvedId }) => resolvedId === id));
    if (!shouldResolve) {
      return;
    }
    setIsLoadingRadicals(true);
    try {
      /**
       * We compact the resolved radicals so that if a word cannot be found
       * by its MongoDB Id or regular word search, the compact array will be used
       * to save the Word Suggestion, omitting the unwanted word.
       */
      const compactedResolvedRadicals = compact(
        await Promise.all(
          radicalIds.map(async ({ id: radicalId }) => {
            const word = await resolveNsibidiCharacter(radicalId).catch(() => null);
            return word;
          }),
        ),
      );
      setResolvedRadicals(compactedResolvedRadicals);
    } finally {
      setIsLoadingRadicals(false);
    }
  };

  const handleDeleteRadicals = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    resolveRadicals();
  }, [radicalIds]);

  return isLoadingRadicals ? (
    <Spinner />
  ) : resolvedRadicals && resolvedRadicals.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      <WordPills pills={resolvedRadicals} onDelete={handleDeleteRadicals} control={control} formName="radicals" />
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600 mb-4">No radicals</p>
    </Box>
  );
};

const RadicalsForm = ({ errors, control, record }: RadicalsFormInterface): ReactElement => {
  const {
    fields: radicals,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'radicals',
  });
  const [input, setInput] = useState('');
  const toast = useToast();

  const canAddRadical = (userInput) =>
    !radicals.includes(userInput) && userInput !== record.id && userInput !== record.originalWordId;

  const handleAddRadical = async (userInput = input) => {
    try {
      if (canAddRadical(userInput)) {
        const nsibidiCharacter = await getNsibidiCharacter(userInput);
        append({ id: nsibidiCharacter.id });
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add radical',
        description: "You have provided either an invalid word id or a the current word's or parent word's id.",
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
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Nsịbịdị Radicals"
          tooltip="Radical or root character words when combined with other radicals create new Nsịbịdị characters."
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="radical-search"
          placeholder="Search for radical or use radical id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddRadical(e.id)}
          collection={Collections.NSIBIDI_CHARACTERS}
        />
      </Box>
      <Radicals radicalIds={radicals} remove={remove} control={control} />
      {errors.radicals && <p className="error">{errors.radicals.message || errors.radicals[0]?.message}</p>}
    </Box>
  );
};

export default RadicalsForm;
