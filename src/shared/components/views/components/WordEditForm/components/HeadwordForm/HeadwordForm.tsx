import React, { ReactElement, useEffect, useState } from 'react';
import { get } from 'lodash';
import { Box, Text, chakra } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import determineIsAsCompleteAsPossible from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import { Input } from 'src/shared/primitives';
import generateFlags from 'src/shared/utils/flagHeadword';
import OnwuCharacters from 'src/shared/constants/OnwuCharacters';
import FormHeader from '../../../FormHeader';
import HeadwordInterface from './HeadwordFormInterface';
import SuggestedWords from './SuggestedWords';
import HeadwordAttributes from './HeadwordAttributes';

const generateIPALabel = (word = '') => {
  const cleanedWord = word.normalize('NFC');
  let IPA = cleanedWord;
  Object.entries(OnwuCharacters).forEach(([latin, ipa]) => {
    IPA = IPA.replace(new RegExp(latin, 'g'), ipa);
  });
  return (
    <Text>
      <chakra.span fontWeight="bold" fontFamily="Silka">
        Generated IPA:{' '}
      </chakra.span>
      {IPA}
    </Text>
  );
};

const HeadwordForm = ({ errors, control, getValues, record, watch, onChange }: HeadwordInterface): ReactElement => {
  const [flags, setFlags] = useState({});
  const isHeadwordAccented = (record.word || '').normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g);
  const isAsCompleteAsPossible = determineIsAsCompleteAsPossible(record);
  const watchedWord = watch('word');
  const watchedWordPronunciation = watch('wordPronunciation');
  const isConstructedPollTerm = !!get(record, 'twitterPollId');

  useEffect(() => {
    const { flags: generatedFlags } = generateFlags({ word: { ...(record || {}), word: watchedWord }, flags: {} });
    setFlags(generatedFlags);
  }, [watchedWord]);

  return (
    <Box className="flex flex-col w-full">
      <Box className="flex flex-col my-2 space-y-2 justify-between items-between">
        <FormHeader
          title="Headword"
          tooltip={`This is the headword that should ideally be in to Standard Igbo.
          Add diacritic marks to denote the tone for the word. 
          All necessary accented characters will appear in the letter popup`}
          color={Object.values(flags).length ? 'orange.600' : ''}
        />
        <Controller
          render={({ field: props }) => (
            <Input
              {...props}
              onChange={(e) => {
                onChange(e);
                return props.onChange(e);
              }}
              placeholder="i.e. ụgbo ala, biko, igwe, mmiri"
              mb={2}
              data-test="word-input"
            />
          )}
          name="word"
          control={control}
          defaultValue={get(record, 'word') || get(getValues(), 'word')}
        />
        <HeadwordAttributes
          record={record}
          errors={errors}
          control={control}
          getValues={getValues}
          isHeadwordAccented={!!isHeadwordAccented?.length}
          isAsCompleteAsPossible={isAsCompleteAsPossible}
          isConstructedPollTerm={isConstructedPollTerm}
        />
      </Box>
      <details className="mt-4 cursor-pointer">
        <summary>
          <chakra.span fontWeight="bold" fontFamily="Silka">
            Advanced Headword Options
          </chakra.span>
        </summary>
        <Box className="space-y-3 mt-3">
          <chakra.span fontWeight="bold" fontFamily="Silka">
            Headword pronunciation spelling:{' '}
          </chakra.span>
          <Controller
            render={({ field: props }) => (
              <Input
                {...props}
                placeholder="Spelling of headword pronunciation, i.e. ụgbaala"
                data-test="word-pronunciation-input"
              />
            )}
            name="wordPronunciation"
            control={control}
            defaultValue={get(record, 'wordPronunciation') || get(getValues(), 'wordPronunciation')}
          />
          {generateIPALabel(watchedWordPronunciation)}
          <Controller
            render={({ field: props }) => (
              <Input
                {...props}
                placeholder="Conceptual spelling of headword using dashes , i.e. isi-agụ"
                data-test="conceptual-word-input"
              />
            )}
            name="conceptualWord"
            control={control}
            defaultValue={get(record, 'conceptualWord') || get(getValues(), 'conceptualWord')}
          />
        </Box>
      </details>
      {Object.values(flags).map((message: string) =>
        message ? (
          <Box key={message} className="flex flex-row items-start">
            <WarningIcon boxSize={3} mr={2} mt={2} color="orange.600" />
            <Text color="orange.600" fontSize="sm">
              {message}
            </Text>
          </Box>
        ) : null,
      )}
      <SuggestedWords word={watchedWord || ''} id={get(record, 'id')} />
      {errors.word && <p className="error">Word is required</p>}
    </Box>
  );
};

export default HeadwordForm;
