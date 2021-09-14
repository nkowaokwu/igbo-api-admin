import React, { ReactElement } from 'react';
import { compact } from 'lodash';
import { Record } from 'react-admin';
import {
  Box,
  Text,
  Tooltip,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';

const CompleteWordPreview = (
  { record, className }:
  { record: {
    word: string,
    wordClass: string,
    definitions: [string],
    isStandardIgbo: boolean,
    pronunciation: string,
    examples: string[],
    isComplete: boolean,
  } | Record,
  className: string,
  },
): ReactElement => {
  const {
    word,
    wordClass,
    definitions,
    isStandardIgbo,
    pronunciation,
    examples,
    isComplete,
  } = record;
  const completeWordRequirements = compact([
    !word && 'The headword is needed',
    !word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g) && 'The headword needs to have accent marks',
    !wordClass && 'The word class is needed',
    Array.isArray(definitions) && !definitions.length && 'At least one definition is needed',
    Array.isArray(examples) && !examples?.length && 'At least one example sentence is needed',
    !pronunciation && 'An audio pronunciation is needed',
    !isStandardIgbo && 'The headword needs to be marked as Standard Igbo',
  ]);
  return (
    <Box data-test="pronunciation-cell" className={className}>
      <Tooltip
        label={!isComplete ? 'This document is considered non-"complete"' : 'This document is "complete"'}
        aria-label="A tooltip"
      >
        {completeWordRequirements.length ? (
          <Box data-test="incomplete-word-label">
            <UnorderedList>
              {completeWordRequirements.length > 2 ? (
                <>
                  <ListItem color="red.400">{completeWordRequirements[0]}</ListItem>
                  <ListItem color="red.400">{completeWordRequirements[1]}</ListItem>
                  <ListItem color="red.400" fontWeight="bold">
                    {`${completeWordRequirements.length - 2} more 
                    field${completeWordRequirements.length - 2 === 1 ? '' : 's'} necessary`}
                  </ListItem>
                </>
              ) : (
                completeWordRequirements.map((requirement) => (
                  <ListItem color="red.400">{requirement}</ListItem>
                ))
              )}
            </UnorderedList>
          </Box>
        ) : <Text data-test="complete-word-label" color="green.400">This word is complete</Text>}
      </Tooltip>
    </Box>
  );
};
export default CompleteWordPreview;
