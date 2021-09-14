/* eslint-disable react/no-array-index-key */
import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Spinner,
} from '@chakra-ui/react';
import ReactAudioPlayer from 'react-audio-player';
import Dialects from '../../../../../backend/shared/constants/Dialects';
import Collection from '../../../../constants/Collections';
import DiffField from './DiffField';
import { generateEmptyRecordDialects } from '../../utils';

/* Renders the visual red/green diff sections in the Show view */
const DialectDiff = (
  { record, diffRecord, resource }:
  { record: Record, diffRecord: any, resource: string },
): ReactElement => {
  const updatedDialects = [];
  diffRecord?.forEach(({ path = [] }) => {
    Object.values(record.dialects || generateEmptyRecordDialects())
      .forEach(({ dialect }) => {
        if (path.includes(dialect)) {
          updatedDialects.push(Dialects[dialect]);
        }
      });
  });
  /* Calculates the indexes that need to be expanded by default if they present data */
  const determineDefaultIndexes = (): number[] => (
    Object.values(record.dialects)
      .reduce((finalDialectIndexes, { word, variations, pronunciation }, index) => {
        if (word || pronunciation || variations.length) {
          finalDialectIndexes.push(index);
        }
        return finalDialectIndexes;
      }, [])
  );

  return record.word ? (
    <Box className="w-full">
      {updatedDialects.length ? updatedDialects.map(({ value, label }) => (
        <>
          <h1 className="text-xl mt-3">{label}</h1>
          <Box className="flex flex-row items-center">
            <h2 className="text-lg">Word:</h2>
            <DiffField
              path={`dialects.${value}.word`}
              diffRecord={diffRecord}
              fallbackValue="No word changes"
            />
          </Box>
          <Box>
            <DiffField
              path={`dialects.${value}.pronunciation`}
              diffRecord={diffRecord}
              fallbackValue={record.dialects[value].pronunciation ? (
                <ReactAudioPlayer
                  src={record.dialects[value].pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              ) : <span>No audio pronunciation</span>}
              renderNestedObject={() => (
                <ReactAudioPlayer
                  src={record.dialects[value].pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              )}
            />
          </Box>
        </>
      )) : resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS ? (
        <Accordion
          defaultIndex={resource === Collection.WORDS ? [0, 1, 2] : determineDefaultIndexes()}
          allowMultiple
        >
          {Object.values(record.dialects).map(({
            word,
            variations,
            dialect,
            pronunciation,
          }, index) => (
            <AccordionItem key={index}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {Dialects[dialect].label}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <h2>
                  <span className="font-bold mr-2">Word:</span>
                  {word || 'No Word'}
                </h2>
                <h2>
                  <span className="font-bold mr-2">Variations:</span>
                  {variations.length ? variations.join(', ') : 'No variations'}
                </h2>
                <ReactAudioPlayer
                  src={pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <span className="text-gray-500 italic">
          No dialect changes
        </span>
      )}
    </Box>
  ) : <Spinner />;
};

export default DialectDiff;
